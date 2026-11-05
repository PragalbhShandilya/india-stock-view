import http from 'node:http';
import {sendResponse} from './http-response.mjs';
import {resolvePublicFile} from './static-files.mjs';
import {localAPIRequestAllowed} from './request-policy.mjs';
import {MarketDeltas} from './market-deltas.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {FeedState} from './feed.mjs';
import {ListingTracker} from './listings.mjs';
import {KiteMarket} from './kite.mjs';
import {ZerodhaTrends} from './zerodha-trends.mjs';
import {syncReferences} from './reference-data.mjs';
import {syncSupplementalIPOs} from './ipo-calendar.mjs';
try{process.loadEnvFile('.env')}catch{}
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const endpoint=process.env.GFD_WS_URL,key=process.env.GFD_API_KEY;
const configured=Boolean(endpoint&&key),feed=new FeedState();
let master;try{master=JSON.parse(await readFile(new URL('./.local/master.json',import.meta.url),'utf8'))}catch{master=JSON.parse(await readFile(path.join(root,'instruments.json'),'utf8'))}
const registry=new Map();
function indexMaster(){registry.clear();for(const listing of master.listings){registry.set(`${listing.exchange}:${listing.symbol}`,listing);registry.set(`${listing.exchange}:${listing.token}`,listing)}}
indexMaster();
const tracker=new ListingTracker(master,fileURLToPath(new URL('./.local',import.meta.url)),updated=>{master=updated;indexMaster()});
await tracker.initialize();
const kite=new KiteMarket(master,fileURLToPath(new URL('./.local',import.meta.url)));
await kite.initialize();
const trendListingDates=new Map();for(const file of ['ipo-listings.json','supplemental-ipos.json','reviewed-shares.json']){try{const data=JSON.parse(await readFile(path.join(root,file),'utf8'));for(const r of data.records||[])if(r.listingType==='IPO'&&r.isin&&r.listingDate)trendListingDates.set(r.isin,r.listingDate)}catch{}}
const zerodhaTrends=new ZerodhaTrends(kite,fileURLToPath(new URL('./.local',import.meta.url)),{listingDates:trendListingDates});await zerodhaTrends.initialize();
// Do not retry every minute: broker masters are daily publications.
let referenceRunning=false;async function dailyReferences(){if(referenceRunning)return;let state;try{state=JSON.parse(await readFile(new URL('./.local/reference-sync.json',import.meta.url),'utf8'))}catch{}const today=new Date().toISOString().slice(0,10);if(state?.startedAt?.slice(0,10)===today&&state?.state!=='running')return;referenceRunning=true;try{await syncReferences();await syncSupplementalIPOs(master.listings)}catch{console.error('Official share-count refresh unavailable; previous verified records retained.')}finally{referenceRunning=false}}
const referenceTimer=setInterval(dailyReferences,3600000);setTimeout(dailyReferences,5000);
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
const marketDeltas=new MarketDeltas();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if(!localAPIRequestAllowed(req.headers,'/')){res.writeHead(403);res.end();return}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400);res.end();return}
  if(!localAPIRequestAllowed(req.headers,url.pathname)){res.writeHead(403,{'Cache-Control':'no-store'});res.end('Open this API from the local IndiaStockView website.');return}
  if(req.method==='HEAD'&&['/api/kite/login','/api/kite/callback','/api/kite/preload'].includes(url.pathname)){res.writeHead(405,{Allow:'GET','Cache-Control':'no-store'});res.end();return}
  if(url.pathname==='/api/kite/login'){
    if(!kite.available){res.writeHead(503);res.end('Kite is not configured on this server.');return}
    const login=kite.login();res.setHeader('Set-Cookie','isv_kite_state='+login.state+'; HttpOnly; SameSite=Lax; Path=/api/kite; Max-Age=600');res.writeHead(302,{Location:login.url,'Cache-Control':'no-store'});res.end();return;
  }
  if(url.pathname==='/api/kite/callback'){
    res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');const state=url.searchParams.get('state'),cookie=req.headers.cookie?.split(';').map(s=>s.trim()).find(s=>s.startsWith('isv_kite_state='))?.split('=')[1];
    if(!state||state!==cookie){res.writeHead(400);res.end('Login validation failed. Return to IndiaStockView and connect again.');return}
    try{await kite.authenticate(url.searchParams.get('request_token'),state);res.setHeader('Set-Cookie','isv_kite_state=; HttpOnly; SameSite=Lax; Path=/api/kite; Max-Age=0');res.writeHead(303,{Location:'/#rankings'});res.end()}catch{res.writeHead(401,{'Content-Type':'text/plain'});res.end('Zerodha login could not be completed. Return to IndiaStockView and connect again.')}return;
  }
  if(url.pathname==='/api/kite/preload'){const isins=[...new Set((url.searchParams.get('isins')||'').split(',').filter(s=>/^IN[A-Z0-9]{10}$/.test(s)))].slice(0,4);const indices=[...new Set((url.searchParams.get('indices')||'').split(',').filter(s=>/^(NSE|BSE):[A-Z0-9 ]{1,40}$/.test(s)))].slice(0,4);kite.preload(isins);kite.preloadIndices(indices);sendResponse(req,res,JSON.stringify({queued:isins.length+indices.length}));return}
  if(url.pathname==='/api/kite/history'){
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');try{sendResponse(req,res,JSON.stringify(await kite.history(url.searchParams.get('token'),url.searchParams.get('range')||'1M',url.searchParams.get('isin'),{background:url.searchParams.get('prefetch')==='1',index:url.searchParams.get('index')})))}catch(error){res.writeHead(kite.state==='login_required'?401:503);res.end(JSON.stringify({error:error.message}))}return;
  }
  if(url.pathname==='/api/trends'){const isins=[...new Set((url.searchParams.get('isins')||'').split(',').filter(s=>/^IN[A-Z0-9]{10}$/.test(s)))].slice(0,200);sendResponse(req,res,JSON.stringify(zerodhaTrends.payload(isins)));return}
  if(url.pathname==='/api/listings'){res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');res.end(JSON.stringify(tracker.payload()));return}
  if(url.pathname==='/instruments.json'){sendResponse(req,res,JSON.stringify(master),{cache:true});return}
  if(url.pathname==='/api/market'){
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');const payload=kite.available?kite.payload({includeListings:url.searchParams.get('quotes')!=='1'}):feed.payload(configured);if(!kite.available)payload.listings=master.listings;payload.status.directoryListings=master.listings.length;const output=kite.available&&url.searchParams.get('changes')==='1'?marketDeltas.payload(payload,url.searchParams.get('since')):payload;sendResponse(req,res,JSON.stringify(output));return;
  }
  let name;try{name=decodeURIComponent(url.pathname)}catch{res.writeHead(400);res.end();return}
  try{const target=await resolvePublicFile(root,name);if(!url.pathname.endsWith('/')&&path.basename(target)==='index.html'&&!url.pathname.endsWith('/index.html')){res.writeHead(308,{Location:'/'+url.pathname.replace(/^\/+/, '')+'/'+url.search});res.end();return}const bytes=await readFile(target);sendResponse(req,res,bytes,{type:types[path.extname(target)]||'application/octet-stream',cache:true,version:['.js','.css'].includes(path.extname(target))?url.searchParams.get('v'):null})}catch(error){res.writeHead(error.status||404);res.end(error.status===403?'Forbidden':error.status===400?'Bad request':'Not found')}
});
server.listen(Number(process.env.PORT||4174),'127.0.0.1',()=>console.log(`IndiaStockView: http://127.0.0.1:${server.address().port} · ${kite.available?'Zerodha backend configured':configured?'Provider configured':'Snapshot mode; live provider not configured'}`));
function stop(){const trendSaved=Promise.all([zerodhaTrends.stop(),kite.flushHistoryCache().catch(()=>{})]);kite.disconnect();clearInterval(referenceTimer);clearInterval(directoryTimer);clearInterval(watchdog);clearTimeout(reconnect);clearTimeout(authTimeout);ws?.close();server.close(()=>trendSaved.finally(()=>process.exit()))}process.on('SIGINT',stop);process.on('SIGTERM',stop);
