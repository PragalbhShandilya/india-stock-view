import test from 'node:test';import assert from 'node:assert/strict';import {parseKiteFrame,normalizeKiteQuote} from './kite.mjs';import {readFile} from 'node:fs/promises';import vm from 'node:vm';
test('Kite full binary ticks retain INR prices, true timestamps and traded value',()=>{const p=Buffer.alloc(184);p.writeUInt32BE(123,0);p.writeInt32BE(12050,4);p.writeInt32BE(12000,12);p.writeUInt32BE(1000,16);p.writeInt32BE(10000,40);p.writeUInt32BE(1700000000,44);p.writeUInt32BE(1700000001,60);const frame=Buffer.alloc(188);frame.writeUInt16BE(1,0);frame.writeUInt16BE(184,2);p.copy(frame,4);const rows=parseKiteFrame(frame,new Map([[123,{exchange:'NSE',symbol:'TEST'}]]));assert.equal(rows[0].price,120.5);assert.equal(rows[0].volume,1000);assert.equal(rows[0].turnover,120000);assert.equal(rows[0].lastTrade,new Date(1700000000000).toISOString());assert.equal(rows[0].change,20.5)});
test('ignores heartbeat, unknown tokens and truncated packets',()=>{assert.deepEqual(parseKiteFrame(Buffer.from([0]),new Map()),[]);assert.deepEqual(parseKiteFrame(Buffer.from([0,1,0,184,0]),new Map()),[])});
test('REST quote does not invent change when previous close is missing',()=>{assert.equal(normalizeKiteQuote('NSE:TEST',{last_price:100,volume:50},{}).change,null)});
const ctx=vm.createContext({URL});vm.runInContext(await readFile(new URL('./dist/live-valuation.js',import.meta.url),'utf8'),ctx);
test('price-scaled market caps are estimates and never use trading volume',()=>{const value=vm.runInContext("calculateLiveMarketCap({ticker:'TEST.NS',cap:10,price:20,volume:900000},2200,100)",ctx);assert.equal(value.capUSD,11);assert.equal(value.estimated,true);assert.equal(vm.runInContext("calculateLiveMarketCap({ticker:'HDB',cap:10,price:20},2200,100)",ctx),null)});
test('official shares value directory-only IPOs without a previous market cap',()=>{const value=vm.runInContext("calculateLiveMarketCap({ticker:'JPL.NS',verifiedSharesOutstanding:9209030830,shareCountDate:'2026-10-28'},1400,100,'2026-10-28')",ctx);assert.equal(value.capUSD,128.92643162);assert.equal(value.estimated,false)});
test('share records join by ISIN, reject unofficial, future and invalid counts, and choose latest effective record',()=>{const result=vm.runInContext(`attachOfficialShares([{isin:'INE0BJO01010'}],[{isin:'INE0BJO01010',sharesOutstanding:100,effectiveDate:'2026-09-01',source:'https://www.bseindia.com/notice.pdf'},{isin:'INE0BJO01010',sharesOutstanding:200,effectiveDate:'2026-10-28',source:'https://nsearchives.nseindia.com/notice.pdf'},{isin:'INE0BJO01010',sharesOutstanding:300,effectiveDate:'2026-12-01',source:'https://www.bseindia.com/future.pdf'},{isin:'INE0BJO01010',sharesOutstanding:400,effectiveDate:'2026-10-29',source:'https://fake.example/notice.pdf'}],'2026-11-01')`,ctx);assert.equal(result[0].verifiedSharesOutstanding,200);assert.equal(result[0].shareCountDate,'2026-10-28')});
test('recent IPO window uses three calendar months and excludes future listings',()=>{assert.equal(vm.runInContext("isRecentIPO({verifiedListingDate:'2026-08-01'},new Date('2026-11-01T06:00:00Z'))",ctx),true);assert.equal(vm.runInContext("isRecentIPO({verifiedListingDate:'2026-07-31'},new Date('2026-11-01T06:00:00Z'))",ctx),false);assert.equal(vm.runInContext("isRecentIPO({verifiedListingDate:'2026-11-02'},new Date('2026-11-01T06:00:00Z'))",ctx),false)});

test('refreshing share counts preserves verified IPO classification',()=>{const result=vm.runInContext(`attachOfficialShares([{isin:'INE0BJO01010',verifiedListingDate:'2026-10-28'}],[{isin:'INE0BJO01010',sharesOutstanding:100,effectiveDate:'2026-10-30',source:'https://www.nseindia.com/reference'}],'2026-11-01')`,ctx);assert.equal(result[0].verifiedListingDate,'2026-10-28')});
const {historyStartDate}=await import('./kite.mjs');
test('history windows use exact calendar periods and month-end clamping in IST',()=>{assert.equal(historyStartDate('1M',new Date('2026-11-01T06:00:00Z')),'2026-10-01');assert.equal(historyStartDate('6M',new Date('2026-11-01T06:00:00Z')),'2026-05-01');assert.equal(historyStartDate('1Y',new Date('2026-11-01T06:00:00Z')),'2025-11-01');assert.equal(historyStartDate('1M',new Date('2026-03-31T06:00:00Z')),'2026-02-28');assert.equal(historyStartDate('YTD',new Date('2026-12-31T20:00:00Z')),'2027-01-01')});
test('native INR market cap is invariant to the display FX reference',()=>{const a=vm.runInContext("calculateLiveMarketCap({ticker:'TEST.NS',verifiedSharesOutstanding:1000000,shareCountDate:'2026-10-28'},1200,90,'2026-10-30')",ctx),b=vm.runInContext("calculateLiveMarketCap({ticker:'TEST.NS',verifiedSharesOutstanding:1000000,shareCountDate:'2026-10-28'},1200,100,'2026-10-30')",ctx);assert.equal(a.capINR,1200000000);assert.equal(a.capINR,b.capINR);assert.equal(b.capUSD*100*1e9,b.capINR)});
test('official sector data replaces name guesses and keeps banks distinct',()=>{assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'Financial Services',industry:'Private Banks'})",ctx),'Banking');assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'Telecommunication',industry:'Telecom - Cellular & Fixed line services'})",ctx),'Telecom');assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'Capital Goods'})",ctx),'Industrials');assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'unknown'})",ctx),null)});
test('business support is not mistaken for a port operator',()=>{assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'Services',industry:'Business Support Services'})",ctx),'Industrials');assert.equal(vm.runInContext("groupedExchangeSector({exchangeSector:'Services',industry:'Port & Port services'})",ctx),'Transport & travel')});

test('historical lookup resolves an ISIN without a live quote, preferring NSE and allowing BSE-only listings',async()=>{
 const {KiteMarket}=await import('./kite.mjs');const market=new KiteMarket({listings:[]},'/tmp');
 market.registry=new Map([[1,{isin:'A',exchange:'BSE',instrumentToken:1}],[2,{isin:'A',exchange:'NSE',instrumentToken:2}],[3,{isin:'B',exchange:'BSE',instrumentToken:3}]]);
 for(const token of [1,2,3])market.historyCache.set(token+':1M',{at:Date.now(),day:new Date(Date.now()+330*60000).toISOString().slice(0,10),value:{schemaVersion:2,token,isin:market.registry.get(token).isin,points:[]}});
 assert.equal((await market.history(null,'1M','A')).token,2);assert.equal((await market.history(null,'1M','B')).token,3);
 await assert.rejects(market.history(null,'1M','UNKNOWN'),/not available/);
});

test('displayed ticker follows the actual Indian quote without changing the saved company identity',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('function stockTickerLabel('),end=app.indexOf('\n',start),context=vm.createContext({});vm.runInContext(app.slice(start,end),context);
 context.stock={ticker:'HDB',liveSymbol:'HDFCBANK',liveSource:'NSE'};assert.equal(vm.runInContext('stockTickerLabel(stock)',context),'HDFCBANK.NS');assert.equal(context.stock.ticker,'HDB');
 context.stock={ticker:'NSE.BO',liveSymbol:'NSE',liveSource:'BSE'};assert.equal(vm.runInContext('stockTickerLabel(stock)',context),'NSE.BO');
 context.stock={ticker:'HDB'};assert.equal(vm.runInContext('stockTickerLabel(stock)',context),'HDB');
});

test('official reference prices value new listings without a connected broker and preserve native INR market cap',()=>{
 vm.runInContext(`globalThis.referenceRows=attachOfficialShares([{ticker:'JPL.NS',isin:'INE0BJO01010',cap:null,price:null,directoryOnly:true,exchangeListings:[{exchange:'NSE',symbol:'JPL'}]}],[{isin:'INE0BJO01010',name:'Jio Platforms Limited',sharesOutstanding:1000,effectiveDate:'2026-11-02',referencePriceINR:1436,symbol:'JPL',source:'https://www.nseindia.com/api/quote'}],'2026-11-02')`,ctx);
 vm.runInContext('applyReferenceValuations(referenceRows,100)',ctx);assert.equal(ctx.referenceRows[0].cap,.00001436);assert.equal(ctx.referenceRows[0].price,14.36);assert.equal(ctx.referenceRows[0].liveCapINR,1436000);assert.equal(ctx.referenceRows[0].referenceValuation,true);assert.equal(ctx.referenceRows[0].change,null);
 vm.runInContext('applyReferenceValuations(referenceRows,80)',ctx);assert.equal(ctx.referenceRows[0].liveCapINR,1436000);assert.ok(Math.abs(ctx.referenceRows[0].cap*80*1e9-1436000)<1e-6);
});
test('reviewed BSE-only quote source stays separate from official outstanding-share source',()=>{
 vm.runInContext(`globalThis.bseRows=attachOfficialShares([{ticker:'NSE.BO',isin:'INE721I01024',cap:null,exchangeListings:[{exchange:'BSE',symbol:'NSE'}]}],[{isin:'INE721I01024',sharesOutstanding:2475000000,effectiveDate:'2026-09-24',referencePriceINR:1776.2,referencePriceDate:'2026-11-02',referencePriceExchange:'BSE',referencePriceSymbol:'NSE',referencePriceSource:'https://www.business-standard.com/markets/nse.html',source:'https://www.bseindia.com/notice.pdf'}],'2026-11-02');applyReferenceValuations(bseRows,100)`,ctx);
 assert.equal(ctx.bseRows[0].cap,43.96095);assert.equal(ctx.bseRows[0].referenceQuote.provider,'Business Standard');assert.equal(ctx.bseRows[0].shareCountSource,'https://www.bseindia.com/notice.pdf');
});
test('a reference quote predating the outstanding share count cannot manufacture a market cap',()=>{
 vm.runInContext(`globalThis.oldRows=attachOfficialShares([{ticker:'TEST.NS',isin:'INE123A01010',cap:null,exchangeListings:[{exchange:'NSE',symbol:'TEST'}]}],[{isin:'INE123A01010',sharesOutstanding:1000,effectiveDate:'2026-11-02',referencePriceINR:20,referencePriceDate:'2026-10-30',source:'https://www.nseindia.com/notice'}],'2026-11-02');applyReferenceValuations(oldRows,100)`,ctx);assert.equal(ctx.oldRows[0].cap,null);
});

test('lightweight polling retains complete quotes and status while omitting the unchanged directory',async()=>{
 const {KiteMarket}=await import('./kite.mjs');const market=new KiteMarket({listings:[]},'/unused');
 market.registry.set(1,{symbol:'TEST',exchange:'NSE'});market.quotes.set(1,{price:100,symbol:'TEST'});
 const full=market.payload(),light=market.payload({includeListings:false});
 assert.equal(full.listings.length,1);assert.equal('listings' in light,false);assert.deepEqual(light.quotes,full.quotes);assert.deepEqual(light.status,full.status);
});

test('index packets use the separate 28/32-byte layout and never supply equity volume or shares',()=>{
 for(const length of [28,32]){const frame=Buffer.alloc(length+4);frame.writeUInt16BE(1);frame.writeUInt16BE(length,2);frame.writeUInt32BE(999,4);frame.writeInt32BE(2500000,8);frame.writeInt32BE(2550000,12);frame.writeInt32BE(2490000,16);frame.writeInt32BE(2495000,20);frame.writeInt32BE(2480000,24);if(length===32)frame.writeUInt32BE(1700000000,32);
 const [index]=parseKiteFrame(frame,new Map([[999,{kind:'index',exchange:'NSE',symbol:'NIFTY 50'}]]));assert.equal(index.price,25000);assert.equal(index.previousClose,24800);assert.equal(index.open,24950);assert.equal(index.currency,'POINTS');assert.equal(index.volume,undefined);assert.ok(Math.abs(index.change-200/24800*100)<1e-10);assert.equal(index.lastTrade,length===32?new Date(1700000000000).toISOString():null);assert.equal(parseKiteFrame(frame,new Map([[999,{exchange:'NSE',symbol:'NOT-INDEX'}]])).length,0);
 }
});

test('login states are unpredictable, bounded, expire and cannot be replayed',async()=>{
 const {KiteMarket}=await import('./kite.mjs'),market=new KiteMarket({listings:[]},'/tmp');market.apiKey='public-test-key';let first;for(let i=0;i<40;i++){const login=market.login();first??=login.state;assert.match(login.state,/^[a-f0-9]{48}$/);assert.equal(new URL(login.url).hostname,'kite.zerodha.com')}
 assert.equal(market.pending.size,32);assert.equal(market.pending.has(first),false);const active=market.login().state;await assert.rejects(market.authenticate('',active),/expired/);assert.equal(market.pending.has(active),false);await assert.rejects(market.authenticate('not-a-real-token',active),/expired/);const expired=market.login().state;market.pending.set(expired,Date.now()-600001);await assert.rejects(market.authenticate('not-a-real-token',expired),/expired/);
});
test('private session replacement is atomic, restrictive and does not follow an existing session symlink',async()=>{
 const {saveKiteSession}=await import('./kite.mjs'),{mkdtemp,writeFile,readFile,symlink,stat,rm,readdir}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),path=await import('node:path');const folder=await mkdtemp(path.join(tmpdir(),'isv-session-'));
 try{const unrelated=path.join(folder,'unrelated.txt');await writeFile(unrelated,'unchanged');await symlink(unrelated,path.join(folder,'kite-session.json'));await saveKiteSession(folder,{apiKey:'test-public-key',accessToken:'test-private-fixture'});assert.equal(await readFile(unrelated,'utf8'),'unchanged');assert.equal((await stat(path.join(folder,'kite-session.json'))).mode&0o777,0o600);assert.equal(JSON.parse(await readFile(path.join(folder,'kite-session.json'),'utf8')).accessToken,'test-private-fixture');assert.equal((await readdir(folder)).filter(n=>n.endsWith('.tmp')).length,0)}finally{await rm(folder,{recursive:true,force:true})}
});
test('a valid one-time login exchanges only the checksum, persists privately and never exposes the session in public payloads',async()=>{
 const {KiteMarket}=await import('./kite.mjs'),{mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),path=await import('node:path'),{createHash}=await import('node:crypto');const folder=await mkdtemp(path.join(tmpdir(),'isv-login-')),market=new KiteMarket({listings:[]},folder),previousFetch=globalThis.fetch;
 market.apiKey='test-public-key';market.secret='test-secret-fixture';market.start=async()=>{};let calls=0;globalThis.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.kite.trade/session/token');assert.equal(options.method,'POST');assert.equal(options.body.get('checksum'),createHash('sha256').update(market.apiKey+'test-request-token'+market.secret).digest('hex'));assert.equal(options.body.has('api_secret'),false);return {ok:true,json:async()=>({data:{access_token:'test-session-fixture'}})}};
 try{const {state}=market.login();await market.authenticate('test-request-token',state);assert.equal(calls,1);assert.equal(market.pending.has(state),false);const publicPayload=JSON.stringify(market.payload());assert.equal(publicPayload.includes('test-session-fixture'),false);assert.equal(publicPayload.includes('test-secret-fixture'),false);await assert.rejects(market.authenticate('test-request-token',state),/expired/);assert.equal(calls,1)}finally{globalThis.fetch=previousFetch;await rm(folder,{recursive:true,force:true})}
});

test('index history resolves only registered indices and returns points separately from equities',async()=>{
 const {KiteMarket}=await import('./kite.mjs'),market=new KiteMarket({listings:[]},'/tmp');market.indexRegistry.set(256265,{kind:'index',exchange:'NSE',symbol:'NIFTY 50',instrumentToken:256265});market.flushHistoryCache=async()=>{};const paths=[];market.api=async path=>{paths.push(path);return {json:async()=>({data:{candles:[['2026-10-30T00:00:00+05:30',1,1,1,25000,0],['2026-11-02T00:00:00+05:30',1,1,1,25100,0]]}})}};const history=await market.history(null,'1M',null,{index:'NSE:NIFTY 50'});assert.equal(history.currency,'POINTS');assert.equal(history.index,'NSE:NIFTY 50');assert.equal(history.points[1].price,25100);assert.equal(market.registry.size,0);assert.ok(paths[0].includes('/256265/day'));assert.equal(await market.history(null,'1M',null,{index:'NSE:NIFTY 50'}),history);await assert.rejects(market.history(null,'1M',null,{index:'BSE:UNKNOWN'}),/not available/);
});

test('full daily history supplies shorter timelines without extra provider requests and retains candle fields',async()=>{
 const {KiteMarket}=await import('./kite.mjs'),market=new KiteMarket({listings:[]},'/tmp');market.registry.set(1,{isin:'TEST',exchange:'NSE',symbol:'TEST',instrumentToken:1});market.flushHistoryCache=async()=>{};let calls=0;
 const today=new Date(Date.now()+330*60000).toISOString().slice(0,10);market.api=async()=>{calls++;return {json:async()=>({data:{candles:[[today+'T00:00:00+05:30',100,120,90,110,12345]]}})}};
 const daily=await market.history(null,'1M','TEST');assert.deepEqual(daily.points[0],{time:today+'T00:00:00+05:30',open:100,high:120,low:90,price:110,volume:12345});assert.equal(daily.schemaVersion,2);
 market.historyCache.set('1:MAX',{at:Date.now(),day:today,value:{...daily,range:'MAX',coverageFrom:'1990-01-01'}});
 const before=calls;for(const range of ['6M','YTD','1Y','5Y']){const history=await market.history(null,range,'TEST');assert.equal(history.range,range);assert.equal(history.points[0].volume,12345)}assert.equal(calls,before);
 assert.equal(historyStartDate('MAX'),'1990-01-01');
});


test('exact market caps cannot combine post-action shares with an older or undated quote',()=>{
 ctx.row={ticker:'TEST.NS',verifiedSharesOutstanding:2000,shareCountDate:'2026-11-02',cap:5,price:10};
 for(const at of [null,'','invalid','2026-02-31','2026-11-01','2026-11-01T18:00:00Z']){ctx.at=at;assert.equal(vm.runInContext('calculateLiveMarketCap(row,50,100,at)',ctx),null)}
 ctx.at='2026-11-01T19:00:00Z';const value=vm.runInContext('calculateLiveMarketCap(row,50,100,at)',ctx);assert.equal(value.capINR,100000);assert.equal(value.estimated,false);
 ctx.row.shareCountDate='2026-02-31';assert.equal(vm.runInContext("calculateLiveMarketCap(row,50,100,'2026-11-02')",ctx),null);
});

test('broker refresh passes actual quote dates through exact-cap calculation for live and reference fallbacks',async()=>{
 const ui=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),stock={ticker:'TEST.NS',isin:'INE123A01010',verifiedSharesOutstanding:2000,shareCountDate:'2026-11-02',referencePriceINR:50,referenceQuote:{date:'2026-11-01',source:'https://www.nseindia.com/',provider:'NSE'}},sandbox=vm.createContext({stocks:[stock],snapshotStocks:[],fx:100,quotePulseTracker:{observe:()=>new Map()},applyDerivedMetrics(){},db:{},updateFeedLabel(){}});
 vm.runInContext(await readFile(new URL('./dist/live-valuation.js',import.meta.url),'utf8'),sandbox);vm.runInContext(ui.slice(ui.indexOf('function applyKiteQuotes('),ui.indexOf('function kiteTopStatus(')),sandbox);
 sandbox.payload={quotes:[],status:{}};vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.cap,null);assert.equal(stock.liveCapINR,null);
 sandbox.payload.quotes=[{isin:stock.isin,exchange:'NSE',symbol:'TEST',price:50,lastTrade:'2026-11-01T10:00:00+05:30'}];vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.cap,null);
 sandbox.payload.quotes[0].lastTrade='2026-11-02T10:00:00+05:30';vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.liveCapINR,100000);assert.equal(stock.liveCapEstimated,false);
 sandbox.payload.quotes=[];stock.referenceQuote.date='2026-11-02';vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.liveCapINR,100000);
});


test('same-date official share-count conflicts are order-independent and a newer agreement resolves them',()=>{
 const first={isin:'INE123A01010',sharesOutstanding:1000,effectiveDate:'2026-11-02',source:'https://www.nseindia.com/notice'},second={...first,sharesOutstanding:2000,source:'https://www.bseindia.com/notice'};
 for(const records of [[first,second],[second,first]]){
  ctx.rows=[{ticker:'TEST.NS',isin:first.isin,cap:5,price:10,verifiedSharesOutstanding:500,referenceValuation:true,liveCapINR:5000}];ctx.records=records;
  vm.runInContext("attachOfficialShares(rows,records,'2026-11-04')",ctx);const row=ctx.rows[0];assert.equal(row.verifiedSharesOutstanding,null);assert.equal(row.shares,null);assert.equal(row.cap,null);assert.equal(row.shareCountConflict.sources.length,2);
  assert.equal(vm.runInContext("calculateLiveMarketCap(rows[0],50,100,'2026-11-04')",ctx),null);
  ctx.records=[...records,{...first,effectiveDate:'2026-11-03',sharesOutstanding:2100}];vm.runInContext("attachOfficialShares(rows,records,'2026-11-04')",ctx);assert.equal(row.shareCountConflict,null);assert.equal(row.verifiedSharesOutstanding,2100);assert.equal(vm.runInContext("calculateLiveMarketCap(rows[0],50,100,'2026-11-04').capINR",ctx),105000);
 }
 ctx.records=[{...first,effectiveDate:'2026-02-31'}];ctx.rows=[{isin:first.isin}];vm.runInContext("attachOfficialShares(rows,records,'2026-11-04')",ctx);assert.equal(ctx.rows[0].verifiedSharesOutstanding,undefined);
});


test('dual-listed companies use newest valid trade and share conflicts block broker fallback estimates',async()=>{
 const ui=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),stock={ticker:'TEST.NS',isin:'INE123A01010',verifiedSharesOutstanding:1000,shareCountDate:'2026-11-02'},baseline={ticker:stock.ticker,cap:10,price:20},sandbox=vm.createContext({stocks:[stock],snapshotStocks:[baseline],fx:100,quotePulseTracker:{observe:()=>new Map()},applyDerivedMetrics(){},db:{},updateFeedLabel(){}});
 vm.runInContext(await readFile(new URL('./dist/live-valuation.js',import.meta.url),'utf8'),sandbox);vm.runInContext(ui.slice(ui.indexOf('function applyKiteQuotes('),ui.indexOf('function kiteTopStatus(')),sandbox);
 const nse={isin:stock.isin,exchange:'NSE',symbol:'TEST',price:100,lastTrade:'2026-11-04T09:30:00+05:30'},bse={...nse,exchange:'BSE',symbol:'500001',price:105,lastTrade:'2026-11-04T09:31:00+05:30'};sandbox.payload={quotes:[nse,bse],status:{}};vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.price,105);assert.equal(stock.quoteExchange,'BSE');assert.equal(stock.liveCapINR,105000);
 sandbox.payload.quotes=[bse,{...nse,lastTrade:'2026-11-04T04:01:00Z'}];vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.quoteExchange,'NSE');
 sandbox.payload.quotes=[{...nse,lastTrade:'invalid'},bse,{...bse,price:0,lastTrade:'2026-11-04T10:00:00+05:30'}];vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.price,105);
 stock.shareCountConflict={date:'2026-11-04',sources:['NSE','BSE']};stock.verifiedSharesOutstanding=null;vm.runInContext('applyKiteQuotes(payload)',sandbox);assert.equal(stock.liveCapINR,null);assert.equal(stock.cap,10);assert.equal(stock.liveCapEstimated,false);
});


test('reference prices reject impossible or inconsistent trading dates without discarding valid share counts',()=>{
 const base={isin:'INE123A01010',sharesOutstanding:1000,effectiveDate:'2026-02-01',referencePriceINR:100,source:'https://www.nseindia.com/notice'};
 for(const patch of [{referencePriceDate:'2026-02-31'},{referencePriceDate:'2026-02-28',referencePriceAt:'invalid'},{referencePriceDate:'2026-02-28',referencePriceAt:'2026-03-01T10:00:00+05:30'},{referencePriceDate:'2026-02-28',referencePriceAt:'2026-02-27T18:00:00Z'}]){
  ctx.record={...base,...patch};const result=vm.runInContext("attachOfficialShares([{ticker:'TEST.NS',isin:'INE123A01010',cap:null,exchangeListings:[{exchange:'NSE',symbol:'TEST'}]}],[record],'2026-03-02')",ctx);assert.equal(result[0].verifiedSharesOutstanding,1000);assert.equal(result[0].referenceQuote,null);ctx.rows=result;vm.runInContext('applyReferenceValuations(rows,100)',ctx);assert.equal(result[0].cap,null);
 }
 ctx.record={...base,referencePriceDate:'2026-02-28',referencePriceAt:'2026-02-27T20:00:00Z'};const valid=vm.runInContext("attachOfficialShares([{ticker:'TEST.NS',isin:'INE123A01010',cap:null,exchangeListings:[{exchange:'NSE',symbol:'TEST'}]}],[record],'2026-03-02')",ctx);assert.equal(valid[0].referenceQuote.date,'2026-02-28');ctx.rows=valid;vm.runInContext('applyReferenceValuations(rows,100)',ctx);assert.equal(valid[0].liveCapINR,100000);
});


test('permanent ranking market cap pulses with optional metrics selected and consumes each movement once',async()=>{
 const source=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),calls=[],cells={price:{field:'price'},change:{field:'change'},cap:{field:'cap'}},row={querySelector(selector){if(selector==='[data-company]')return {dataset:{company:'1'}};return cells[selector.match(/data-field="(.*?)"/)?.[1]]}},stock={rank:1,ticker:'TEST.NS'};
 const sandbox=vm.createContext({tab:'rankings',metric:'revenue',stocks:[stock],pendingQuotePulses:new Map(),document:{querySelectorAll:()=>[row]},pulseQuoteElement:(cell,direction)=>{if(cell&&direction)calls.push([cell.field,direction])}});vm.runInContext(source.slice(source.indexOf('function paintQuotePulses('),source.indexOf("let kiteCompareRange=")),sandbox);
 for(const direction of ['up','down']){sandbox.pendingQuotePulses.set(stock.ticker,{price:direction,cap:direction});vm.runInContext('paintQuotePulses()',sandbox);assert.deepEqual(calls.splice(0),[['price',direction],['change',direction],['cap',direction]]);assert.equal(sandbox.pendingQuotePulses.size,0);vm.runInContext('paintQuotePulses()',sandbox);assert.equal(calls.length,0)}
});
