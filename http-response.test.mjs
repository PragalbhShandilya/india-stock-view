import test from 'node:test';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {sendResponse} from './http-response.mjs';
function response(headers={},method='GET',cache=true){const res={headers:{},setHeader(k,v){this.headers[k]=v},writeHead(n){this.status=n},end(body){this.body=body}};sendResponse({headers,method},res,'日本語 market '.repeat(1000),{cache});return res}
test('large public payloads gzip losslessly and revalidate without a response body',()=>{const plain=response(),gzip=response({'accept-encoding':'br, gzip'});assert.equal(gzip.status,200);assert.equal(gzip.headers['Content-Encoding'],'gzip');assert.ok(gzip.body.length<plain.body.length/10);assert.deepEqual(gunzipSync(gzip.body),plain.body);const cached=response({'accept-encoding':'gzip','if-none-match':gzip.headers.ETag});assert.equal(cached.status,304);assert.equal(cached.body,undefined);assert.equal(response({'if-none-match':gzip.headers.ETag}).status,200)});
test('private live data is never cacheable and HEAD carries no response body',()=>{const res=response({'accept-encoding':'gzip'},'GET',false);assert.equal(res.headers['Cache-Control'],'no-store');assert.equal(res.headers.ETag,undefined);const head=response({'accept-encoding':'gzip'},'HEAD');assert.equal(head.body,undefined);assert.equal(head.headers['Content-Length'],response({'accept-encoding':'gzip'}).body.length)});
test('gzip q=0 is respected and weak matching tags may revalidate public assets',()=>{assert.equal(response({'accept-encoding':'gzip;q=0'}).headers['Content-Encoding'],undefined);const etag=response().headers.ETag;assert.equal(response({'if-none-match':'W/'+etag}).status,304)});

test('only a matching content version grants immutable caching; changing bytes and private data remain fresh',async()=>{
 const {createHash}=await import('node:crypto');
 const body='const value=1;'.repeat(200),hash=createHash('sha256').update(body).digest('hex').slice(0,12);
 const run=(text,options)=>{const res={headers:{},setHeader(k,v){this.headers[k]=v},writeHead(n){this.status=n},end(body){this.body=body}};sendResponse({headers:{'accept-encoding':'gzip'},method:'GET'},res,text,options);return res};
 const first=run(body,{cache:true,version:hash}),repeat=run(body,{cache:true,version:hash});assert.match(first.headers['Cache-Control'],/immutable/);assert.equal(first.body,repeat.body);assert.equal(first.headers.ETag,repeat.headers.ETag);
 const changed=run(body+'changed',{cache:true,version:hash});assert.equal(changed.headers['Cache-Control'],'no-cache');assert.notEqual(changed.headers.ETag,first.headers.ETag);assert.equal(gunzipSync(changed.body).toString(),body+'changed');
 assert.equal(run(body,{cache:false,version:hash}).headers['Cache-Control'],'no-store');assert.equal(run(body,{cache:true,version:'bad'}).headers['Cache-Control'],'no-cache');
});
