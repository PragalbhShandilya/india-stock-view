import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./dist/data-loader.js',import.meta.url),'utf8');
function fixture(failed=[]){return async file=>{if(failed.includes(file))throw Error('offline');return {ok:true,json:async()=>file==='data.json'?{stocks:[{name:'Test',ticker:'TEST.NS'}],sources:{}}:file==='instruments.json'?{listings:[{name:'Test',symbol:'TEST',exchange:'NSE',isin:'INE1'}]}:{records:[]}}}}
async function load(fetch){const ctx=vm.createContext({fetch,AbortSignal});vm.runInContext(source,ctx);return vm.runInContext('loadMarketSources()',ctx)}
test('missing supplementary sources do not erase available companies or invent records',async()=>{const result=await load(fixture(['official-shares.json','ipo-listings.json']));assert.equal(result.data[0].stocks.length,1);assert.equal(result.data[1].listings.length,1);assert.equal(result.data[2].records.length,0);assert.equal(result.warnings.join(','),'Official share counts,Exchange IPO dates')});
test('either financials or directory can keep the site usable, but loss of both triggers recovery',async()=>{assert.equal((await load(fixture(['data.json']))).data[1].listings.length,1);assert.equal((await load(fixture(['instruments.json']))).data[0].stocks.length,1);await assert.rejects(load(fixture(['data.json','instruments.json'])),/No company data/)});
test('invalid record schemas are isolated just like network failures',async()=>{const good=fixture();const result=await load(async file=>file==='data.json'?{ok:true,json:async()=>({stocks:[{name:null,ticker:{}}]})}:good(file));assert.ok(result.warnings.includes('Company financials'));assert.equal(result.data[0].stocks.length,0)});

test('repeated source retries do not start additional live polling intervals',async()=>{const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let feedPollingStarted=false;'),end=app.indexOf('\n',app.indexOf('async function initLive(){',start));let intervals=0;const button={},ctx=vm.createContext({STATIC_PREVIEW:false,readFeed:async()=>({status:{provider:'Market data',authenticated:false},quotes:[]}),updateFeedLabel(){},$:()=>button,setInterval(){intervals++}});vm.runInContext(app.slice(start,end),ctx);await vm.runInContext('initLive()',ctx);await vm.runInContext('initLive()',ctx);assert.equal(intervals,1)});

test('history failures clear pending requests so retry can recover, and malformed payloads are rejected',async()=>{const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start);let count=0;const ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout(){},fetch:async(_,options)=>{assert.ok(options.signal);count++;return {ok:true,json:async()=>count===1?{unexpected:[]}: {provider:'Zerodha Kite',range:'1M',isin:'INE1',currency:'INR',points:[{time:'2026-11-02',price:10}]}}}});vm.runInContext(source.slice(start,end),ctx);await assert.rejects(vm.runInContext("getPriceHistory({isin:'INE1'},'1M')",ctx),/Invalid historical data/);const data=await vm.runInContext("getPriceHistory({isin:'INE1'},'1M')",ctx);assert.equal(data.points.length,1);assert.equal(count,2)});

test('concurrent market refreshes share one request and recover after a failed request',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let feedReadInFlight=null;'),end=app.indexOf('\n',app.indexOf('async function readFeed(){',start));
 let calls=0,release;const gate=new Promise(resolve=>release=resolve),ctx=vm.createContext({AbortSignal,STATIC_PREVIEW:false,feedMode:'kite',feedStatus:{configured:true},fetch:async()=>{calls++;await gate;throw Error('offline')}});
 vm.runInContext(await readFile(new URL('./dist/market-updates.js',import.meta.url),'utf8'),ctx);vm.runInContext(app.slice(start,end),ctx);const a=vm.runInContext('readFeed()',ctx),b=vm.runInContext('readFeed()',ctx);assert.equal(calls,1);release();const results=await Promise.all([a,b]);assert.ok(results.every(r=>r.status.authenticated===false));
 ctx.fetch=async()=>{calls++;return {ok:true,json:async()=>({status:{authenticated:true},quotes:[]})}};assert.equal((await vm.runInContext('readFeed()',ctx)).status.authenticated,true);assert.equal(calls,2);
});

test('readFeed merges real incremental responses into complete quote/index sets before UI consumers see them',async()=>{
 const {MarketDeltas}=await import('./market-deltas.mjs'),app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let feedReadInFlight=null;'),end=app.indexOf('\n',app.indexOf('async function readFeed(){',start)),server=new MarketDeltas();let price=100;const transferred=[];
 const ctx=vm.createContext({STATIC_PREVIEW:false,AbortSignal,feedMode:'kite',feedStatus:{configured:true},fetch:async url=>{const since=new URL(url,'http://localhost').searchParams.get('since'),payload=server.payload({status:{provider:'Zerodha Kite',authenticated:true},quotes:[{id:'NSE:A',price},{id:'NSE:B',price:200}],indices:[{id:'NSE:NIFTY 50',price:25000}]},since);transferred.push(payload.quotes.length);return {ok:true,json:async()=>payload}}});vm.runInContext(await readFile(new URL('./dist/market-updates.js',import.meta.url),'utf8'),ctx);vm.runInContext(app.slice(start,end),ctx);
 const first=await vm.runInContext('readFeed()',ctx);price=102;const second=await vm.runInContext('readFeed()',ctx);const unchanged=await vm.runInContext('readFeed()',ctx);assert.deepEqual(transferred,[2,1,0]);assert.equal(first.quotes.length,2);assert.equal(second.quotes.length,2);assert.equal(second.quotes.find(q=>q.id==='NSE:A').price,102);assert.equal(unchanged.quotes.length,2);assert.equal(unchanged.indices[0].price,25000);assert.equal(first.quotes.find(q=>q.id==='NSE:A').price,100);
});

test('temporary refresh failure retains last generic-feed prices and next successful poll updates them',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let feedPollingStarted=false;'),end=app.indexOf('\n',app.indexOf('async function initLive(){',start));
 const retained=[{id:'NSE:TEST',price:100}],statuses=[],button={};let poll,applied=0,renders=0;
 const ctx=vm.createContext({STATIC_PREVIEW:false,feedMode:'live',stocks:retained,document:{hidden:false,activeElement:{}},readFeed:async()=>({status:{provider:'Market data',state:'streaming'},quotes:retained}),updateFeedLabel(){statuses.push(ctx.feedStatus?.state)},$:()=>button,showFeedPanel(){},setInterval(fn){poll=fn},applyLiveQuotes(quotes){applied++;ctx.stocks=quotes},render(){renders++}});
 vm.runInContext(app.slice(start,end),ctx);await vm.runInContext('initLive()',ctx);
 ctx.readFeed=async()=>({status:{provider:'Market data',state:'disconnected',refreshFailed:true},quotes:[]});await poll();assert.equal(ctx.stocks,retained);assert.equal(applied,0);assert.equal(renders,0);assert.equal(statuses.at(-1),'disconnected');
 ctx.readFeed=async()=>({status:{provider:'Market data',state:'streaming'},quotes:[{id:'NSE:TEST',price:105}]});await poll();assert.equal(ctx.stocks[0].price,105);assert.equal(applied,1);assert.equal(renders,1);
});
test('transport failure preserves configuration and prior authentication without reporting live sockets',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let feedReadInFlight=null;'),end=app.indexOf('\n',app.indexOf('async function readFeed(){',start)),ctx=vm.createContext({STATIC_PREVIEW:false,AbortSignal,feedMode:'kite',feedStatus:{provider:'Zerodha Kite',authenticated:true,configured:true,connections:3,state:'streaming'},fetch:async()=>{throw Error('offline')}});
 vm.runInContext(await readFile(new URL('./dist/market-updates.js',import.meta.url),'utf8'),ctx);vm.runInContext(app.slice(start,end),ctx);const result=await vm.runInContext('readFeed()',ctx);assert.equal(result.status.authenticated,true);assert.equal(result.status.configured,true);assert.equal(result.status.connections,0);assert.equal(result.status.state,'disconnected');assert.equal(result.status.refreshFailed,true);
});

test('usable company data arrives before delayed supporting sources and final results retain their records',async()=>{
 const good=fixture(),pending=[];let initial,finished=false;
 const ctx=vm.createContext({AbortSignal,fetch:async file=>['data.json','instruments.json'].includes(file)?good(file):new Promise(resolve=>pending.push(()=>resolve({ok:true,json:async()=>({records:[{isin:'INE1',source:file}]})}))),onCoreReady:value=>{initial=value}});vm.runInContext(source,ctx);const complete=vm.runInContext('loadMarketSources(fetch,onCoreReady)',ctx).then(value=>{finished=true;return value});await new Promise(resolve=>setImmediate(resolve));assert.equal(finished,false);assert.equal(initial.data[0].stocks[0].ticker,'TEST.NS');assert.equal(initial.data[1].listings.length,1);assert.equal(initial.data[2].records.length,0);assert.equal(initial.warnings.length,0);for(const release of pending)release();const result=await complete;assert.equal(result.data[2].records.length,1);assert.equal(result.data[5].records.length,1);assert.equal(initial.data[2].records.length,0);
});
test('failed critical sources never show an empty early company view',async()=>{let initial=0;const ctx=vm.createContext({AbortSignal,fetch:fixture(['data.json','instruments.json']),ready:()=>initial++});vm.runInContext(source,ctx);await assert.rejects(vm.runInContext('loadMarketSources(fetch,ready)',ctx),/No company data/);assert.equal(initial,0)});

test('website bootstrap renders core data while supporting sources load, then hydrates once and starts feed once',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let sourceLoadInFlight='),end=app.indexOf('\nif(document.readyState',start),content={setAttribute(){},removeAttribute(){},innerHTML:''},notice={classes:new Map(),classList:{toggle(key,value){notice.classes.set(key,value)}},querySelector(){return null}},good=fixture(),release=[];let renders=0,feeds=0;
 const ctx=vm.createContext({db:null,AbortSignal,fetch:async file=>['data.json','instruments.json'].includes(file)?good(file):new Promise(resolve=>release.push(()=>resolve({ok:true,json:async()=>({records:[]})}))),$:selector=>selector==='#content'?content:selector==='#data-availability'?notice:null,escapeHtml:v=>v,attachIPOListings:v=>v,attachOfficialShares:v=>v,mergeRankingUniverse:rows=>rows,canonicalSavedTickers:(_,v)=>v,watch:new Set(['TEST.NS']),compare:['TEST.NS'],getSector:()=>'',initLive(){feeds++},render(){renders++}});vm.runInContext(source,ctx);vm.runInContext(app.slice(start,end),ctx);const pending=vm.runInContext('loadWebsiteData()',ctx);await new Promise(resolve=>setImmediate(resolve));assert.equal(renders,1);assert.equal(feeds,0);assert.match(notice.innerHTML,/Loading supporting/);assert.equal(notice.classes.get('supporting-pending'),true);assert.equal(ctx.stocks[0].ticker,'TEST.NS');for(const done of release)done();await pending;assert.equal(renders,2);assert.equal(feeds,1);assert.equal(notice.hidden,true);assert.equal(notice.classes.get('supporting-pending'),false);assert.ok(ctx.watch.has('TEST.NS'));assert.equal(ctx.compare[0],'TEST.NS');
});

test('malformed historical records reject safely and each failed response permits a clean retry',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start),valid={time:'2026-11-02',price:100,volume:0};let payload;
 const ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout(){},fetch:async()=>({ok:true,json:async()=>payload})});vm.runInContext(source.slice(start,end),ctx);
 for(const record of [null,{},[],{...valid,time:'invalid'},{...valid,price:0},{...valid,price:'100'},{...valid,open:-1},{...valid,volume:-1}]){payload={provider:'Zerodha Kite',range:'1M',isin:'TEST',currency:'INR',points:[valid,record]};await assert.rejects(vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx),/Invalid historical data/)}
 payload={provider:'Zerodha Kite',range:'1M',isin:'TEST',currency:'INR',points:[valid]};assert.equal((await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx)).points.length,1);
});

test('an old request expiry cannot evict a newer successful retry from history cache',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start),timers=[];let calls=0;
 const ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout:fn=>timers.push(fn),fetch:async()=>{calls++;return {ok:true,json:async()=>calls===1?null:{provider:'Zerodha Kite',range:'1M',isin:'TEST',currency:'INR',points:[{time:'2026-11-02',price:100}]}}}});vm.runInContext(source.slice(start,end),ctx);
 await assert.rejects(vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx));await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);timers[0]();await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);assert.equal(calls,2);timers[1]();await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);assert.equal(calls,3);
});

test('historical prices cannot be relabelled as another company, index, range or currency',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start);let payload;
 const valid={provider:'Zerodha Kite',range:'1M',isin:'TEST',currency:'INR',points:[{time:'2026-11-02',price:100}]},ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout(){},fetch:async()=>({ok:true,json:async()=>payload})});vm.runInContext(source.slice(start,end),ctx);
 for(const mismatch of [{isin:'OTHER'},{currency:'USD'},{range:'1Y'},{provider:'Unverified'}, {isin:undefined}]){payload={...valid,...mismatch};await assert.rejects(vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx),/does not match/)}
 payload={...valid,index:'NSE:NIFTY 50',isin:undefined,currency:'POINTS'};await assert.rejects(vm.runInContext("getPriceHistory({historyIndex:'NSE:NIFTY IT'},'1M')",ctx),/does not match/);payload.index='NSE:NIFTY IT';assert.equal((await vm.runInContext("getPriceHistory({historyIndex:'NSE:NIFTY IT'},'1M')",ctx)).currency,'POINTS');
});

test('failed or unacknowledged timeline warming can retry instead of being suppressed for ten minutes',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const chartPreloadTimes='),end=source.indexOf('\nfunction renderKiteHistoryValues',start);let calls=0,reply={ok:false,json:async()=>({})};
 const ctx=vm.createContext({STATIC_PREVIEW:false,Date,URLSearchParams,AbortSignal,fetch:async()=>{calls++;return reply}});vm.runInContext(source.slice(start,end),ctx);
 const warm=()=>vm.runInContext("preloadChartTimelines([{isin:'TEST'}])",ctx),settle=()=>new Promise(resolve=>setImmediate(resolve));
 warm();await settle();assert.equal(calls,1);reply={ok:true,json:async()=>({queued:0})};warm();await settle();assert.equal(calls,2);reply={ok:true,json:async()=>({queued:1})};warm();await settle();assert.equal(calls,3);warm();await settle();assert.equal(calls,3);
});


test('history rejects reversed or duplicate instants and impossible candle bounds, then recovers',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start);
 let points,calls=0;const ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout(){},fetch:async()=>{calls++;return {ok:true,json:async()=>({provider:'Zerodha Kite',range:'1M',isin:'TEST',currency:'INR',points})}}});vm.runInContext(source.slice(start,end),ctx);
 const first={time:'2026-11-02T09:15:00+05:30',price:100},later={time:'2026-11-02T09:20:00+05:30',price:105};
 for(const invalid of [[later,first],[first,{...first,price:101}],[first,{...first,time:'2026-11-02T03:45:00Z'}],[{...first,high:99}],[{...first,low:101}],[{...first,open:110,high:105}],[{...first,high:110,low:120}]]){
  points=invalid;await assert.rejects(vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx),/Invalid historical data/);
 }
 points=[{...first,open:101,high:105,low:99,volume:0},later];const data=await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);assert.equal(data.points.length,2);assert.equal(calls,8);
 await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);assert.equal(calls,8);
});

test('concurrent chart consumers share one history request while separate ranges remain independent',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=source.indexOf('const priceHistoryRequests='),end=source.indexOf('\nasync function loadKiteComparison',start),pending=[];
 const ctx=vm.createContext({URLSearchParams,AbortSignal,setTimeout(){},fetch:(url)=>new Promise(resolve=>pending.push({url,resolve}))});vm.runInContext(source.slice(start,end),ctx);
 const first=vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx),second=vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx),longer=vm.runInContext("getPriceHistory({isin:'TEST'},'6M')",ctx);assert.equal(pending.length,2);
 for(const request of pending){const range=new URL('http://localhost'+request.url).searchParams.get('range');request.resolve({ok:true,json:async()=>({provider:'Zerodha Kite',range,isin:'TEST',currency:'INR',points:[{time:'2026-11-02',price:100}]})})}
 const results=await Promise.all([first,second,longer]);assert.equal(results[0],results[1]);assert.equal(results[2].range,'6M');assert.notEqual(results[0],results[2]);
 await vm.runInContext("getPriceHistory({isin:'TEST'},'1M')",ctx);assert.equal(pending.length,2);
});


test('first authenticated feed updates existing chart views in place and still rebuilds ranking controls',async()=>{
 const source=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=source.indexOf('let feedPollingStarted=false;'),end=source.indexOf('\n',source.indexOf('async function initLive(){',start));
 for(const tab of ['stock','index','compare','charts','rankings']){let renders=0,refreshes=0,stats=0,quotes=0;const button={},ctx=vm.createContext({tab,STATIC_PREVIEW:true,readFeed:async()=>({status:{provider:'Zerodha Kite',authenticated:true},quotes:[{price:100}]}),updateFeedLabel(){},applyKiteQuotes(){quotes++},render(){renders++},refreshKiteView(){refreshes++},updateStats(){stats++},$:()=>button});vm.runInContext(source.slice(start,end),ctx);await vm.runInContext('initLive()',ctx);assert.equal(quotes,1);assert.equal(renders,tab==='rankings'?1:0);assert.equal(refreshes,tab==='rankings'?0:1);assert.equal(stats,tab==='rankings'?0:1)}
});
