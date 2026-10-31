import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {FeedState} from './feed.mjs';
import {ListingTracker} from './listings.mjs';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const endpoint=process.env.GFD_WS_URL,key=process.env.GFD_API_KEY;
const configured=Boolean(endpoint&&key),feed=new FeedState();
let master;try{master=JSON.parse(await readFile(new URL('./.local/master.json',import.meta.url),'utf8'))}catch{master=JSON.parse(await readFile(path.join(root,'instruments.json'),'utf8'))}
const registry=new Map();
function indexMaster(){registry.clear();for(const listing of master.listings){registry.set(`${listing.exchange}:${listing.symbol}`,listing);registry.set(`${listing.exchange}:${listing.token}`,listing)}}
indexMaster();
const tracker=new ListingTracker(master,fileURLToPath(new URL('./.local',import.meta.url)),updated=>{master=updated;indexMaster()});
await tracker.initialize();
// Do not retry every minute: broker masters are daily publications.
const directoryTimer=setInterval(()=>{const now=new Date();const india=new Date(now.getTime()+330*60000);const day=india.toISOString().slice(0,10),minute=india.getUTCHours()*60+india.getUTCMinutes();if(minute>=515&&tracker.state.lastAttempt?.slice(0,10)!==day)tracker.refresh()},60000);
if(tracker.state.lastAttempt?.slice(0,10)!==new Date().toISOString().slice(0,10))tracker.refresh();
let ws,reconnect,attempt=0,authTimeout,lastMessage=Date.now();
function connect(){
  if(!configured)return;
  if(!endpoint.startsWith('wss://')){feed.state='configuration_error';console.error('GFD_WS_URL must use the provider’s secure wss endpoint.');return}
  feed.state='connecting';
  try{ws=new WebSocket(endpoint)}catch{feed.state='configuration_error';return}
  ws.addEventListener('open',()=>{lastMessage=Date.now();ws.send(JSON.stringify({MessageType:'Authenticate',Password:key}));authTimeout=setTimeout(()=>ws.close(),15000)});
  ws.addEventListener('message',event=>{
    lastMessage=Date.now();let message;try{message=JSON.parse(event.data)}catch{return}
    if(message.MessageType==='AuthenticateResult'){
      clearTimeout(authTimeout);
      if(message.Complete!==true){feed.state='authentication_failed';ws.close();return}
      attempt=0;feed.state='waiting_for_quotes';
      // StreamAllSymbols-enabled accounts begin pushing after authentication.
      for(const exchange of ['NSE','BSE'])ws.send(JSON.stringify({MessageType:'GetInstruments',Exchange:exchange}));
    }
    if((message.MessageType==='InstrumentsResult'||message.Request?.MessageType==='GetInstruments')&&Array.isArray(message.Result)){
      const exchange=message.Request?.Exchange??message.Exchange;
      if(['NSE','BSE'].includes(exchange))for(const row of message.Result){const symbol=row.InstrumentIdentifier;if(typeof symbol==='string')feed.catalogue.set(`${exchange}:${symbol}`,row)}
    }
    const rows=Array.isArray(message)?message:message.T==='Batch'?message.data:[message];
    feed.ingest((rows||[]).flatMap(row=>{const entry=registry.get(`${row.Exchange??row.E}:${row.InstrumentIdentifier??row.I}`);return entry?[{...row,Exchange:entry.exchange,InstrumentIdentifier:entry.symbol}]:[]}));
  });
  ws.addEventListener('error',()=>{feed.state='connection_error';ws.close()});
  ws.addEventListener('close',()=>{clearTimeout(authTimeout);if(feed.state==='authentication_failed')return;feed.state='disconnected';reconnect=setTimeout(connect,Math.min(30000,1000*2**attempt++))});
}
connect();
const watchdog=setInterval(()=>{if(ws?.readyState===WebSocket.OPEN&&Date.now()-lastMessage>90000)ws.close()},15000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  const host=req.headers.host;if(!host||!['localhost','127.0.0.1'].includes(host.split(':')[0])){res.writeHead(403);res.end();return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400);res.end();return}
  if(url.pathname==='/api/listings'){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.end(JSON.stringify(tracker.payload()));return}
  if(url.pathname==='/instruments.json'){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-cache');res.end(JSON.stringify(master));return}
  if(url.pathname==='/api/market'){
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');const payload=feed.payload(configured);payload.listings=master.listings;payload.status.directoryListings=master.listings.length;res.end(JSON.stringify(payload));return;
  }
  let name;try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
  const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!target.startsWith(root)){res.writeHead(403);res.end();return}
  try{const bytes=await readFile(target);res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(req.method==='HEAD'?undefined:bytes)}catch{res.writeHead(404);res.end('Not found')}
});
server.listen(Number(process.env.PORT||4174),'127.0.0.1',()=>console.log(`IndiaStockView: http://127.0.0.1:${server.address().port} · ${configured?'Provider configured':'Snapshot mode; live provider not configured'}`));
function stop(){clearInterval(directoryTimer);clearInterval(watchdog);clearTimeout(reconnect);clearTimeout(authTimeout);ws?.close();server.close(()=>process.exit())}process.on('SIGINT',stop);process.on('SIGTERM',stop);
