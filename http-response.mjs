import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';

// Public encodings only: bounded by both count and bytes; private quotes never enter it.
const publicEncodings=new Map();
let encodingBytes=0;
const MAX_ENCODING_BYTES=16*1024*1024;
function publicEncoding(bytes){
 const hash=createHash('sha256').update(bytes).digest('hex');
 let entry=publicEncodings.get(hash);
 if(entry){publicEncodings.delete(hash);publicEncodings.set(hash,entry);return entry}
 const gzip=bytes.length>=1024?gzipSync(bytes):null;
 entry={hash,gzip,size:bytes.length+(gzip?.length||0)};
 if(entry.size<=MAX_ENCODING_BYTES){
  while(publicEncodings.size>=32||encodingBytes+entry.size>MAX_ENCODING_BYTES){const key=publicEncodings.keys().next().value;encodingBytes-=publicEncodings.get(key).size;publicEncodings.delete(key)}
  publicEncodings.set(hash,entry);encodingBytes+=entry.size;
 }
 return entry;
}

// Public data/assets may revalidate; account/session responses must never be cached.
export function sendResponse(req,res,body,{type='application/json; charset=utf-8',cache=false,status=200,version=null}={}){
 const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);
 const encoding=cache?publicEncoding(bytes):null;
 res.setHeader('Content-Type',type);
 const immutable=cache&&/^[a-f0-9]{12}$/.test(version||'')&&encoding.hash.startsWith(version);
 res.setHeader('Cache-Control',immutable?'public, max-age=31536000, immutable':cache?'no-cache':'no-store');
 res.setHeader('Vary','Accept-Encoding');
 const acceptsGzip=(req.headers['accept-encoding']||'').split(',').some(part=>{const [name,...params]=part.trim().split(';');return name==='gzip'&&!params.some(p=>/^q=0(?:\.0*)?$/.test(p.trim()))});
 const compressed=acceptsGzip&&bytes.length>=1024;
 const output=compressed?(encoding?.gzip||gzipSync(bytes)):bytes;
 if(compressed)res.setHeader('Content-Encoding','gzip');
 if(cache){const etag='"'+createHash('sha256').update(output).digest('hex').slice(0,24)+'"';res.setHeader('ETag',etag);
 if((req.headers['if-none-match']||'').split(',').some(tag=>tag.trim().replace(/^W\//,'')===etag||tag.trim()==='*')){res.writeHead(304);res.end();return}}
 res.setHeader('Content-Length',output.length);res.writeHead(status);res.end(req.method==='HEAD'?undefined:output);
}
