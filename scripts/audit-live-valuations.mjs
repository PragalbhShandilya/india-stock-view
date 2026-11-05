// Read-only production-path audit. Quote data stays in memory; only aggregate results are saved.
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
const read=async file=>JSON.parse(await readFile(new URL('../'+file,import.meta.url),'utf8'));
const response=await fetch('http://127.0.0.1:4174/api/market',{signal:AbortSignal.timeout(15000)});
if(!response.ok)throw Error('Local quote feed unavailable: '+response.status);
const payload=await response.json();if(!Array.isArray(payload.quotes))throw Error('Invalid quote response');
let master;try{master=await read('.local/master.json')}catch{master=await read('dist/instruments.json')}
const snapshot=await read('dist/data.json'),official=await read('dist/official-shares.json'),reviewed=await read('dist/reviewed-shares.json');
const ctx=vm.createContext({URL,stocks:[],snapshotStocks:snapshot.stocks,directory:master.listings,records:[...official.records,...reviewed.records],payload,quotePulseTracker:{observe:()=>new Map()},applyDerivedMetrics(){},db:{},updateFeedLabel(){}});
for(const file of ['ranking-universe.js','live-valuation.js','fx-reference.js'])vm.runInContext(await readFile(new URL('../dist/'+file,import.meta.url),'utf8'),ctx);
vm.runInContext('fx=FX_REFERENCE.rate;stocks=attachOfficialShares(mergeRankingUniverse(snapshotStocks,directory),records)',ctx);
const ui=await readFile(new URL('../dist/kite-ui.js',import.meta.url),'utf8');vm.runInContext(ui.slice(ui.indexOf('function applyKiteQuotes('),ui.indexOf('function kiteTopStatus(')),ctx);vm.runInContext('applyKiteQuotes(payload)',ctx);
const report={at:new Date().toISOString(),provider:payload.status?.provider,quotes:payload.quotes.length,companies:0,matchedQuotes:0,exactCaps:0,estimatedCaps:0,datedSourceCaps:0,missingCaps:0,shareCountConflicts:0,quotePredatesShares:0,unresolved:0,failures:[],limitations:['Single current local-feed observation; no claim of complete exchange coverage or independently verified outstanding shares.','USD reconciliation uses the bundled dated FX reference, not a fresh FX observation.']};
const quoteDate=value=>{const n=typeof value==='string'?Date.parse(value):NaN;return Number.isFinite(n)?new Date(n+19800000).toISOString().slice(0,10):null};
for(const s of ctx.stocks){if(!s.isin){report.unresolved++;continue}report.companies++;if(s.shareCountConflict)report.shareCountConflicts++;
 const candidates=payload.quotes.filter(q=>q.isin===s.isin&&Number.isFinite(q.price)&&q.price>0&&['NSE','BSE'].includes(q.exchange));
 const times=candidates.map(q=>Date.parse(q.lastTrade)).filter(Number.isFinite),newest=times.length?Math.max(...times):null;
 if(candidates.length){report.matchedQuotes++;if(newest!==null&&Date.parse(s.lastTrade)!==newest)report.failures.push({ticker:s.ticker,reason:'Did not select latest trade'});if(!candidates.some(q=>q.exchange===s.quoteExchange&&q.symbol===s.quoteSymbol&&q.price===s.price))report.failures.push({ticker:s.ticker,reason:'Selected quote identity/price mismatch'})}
 const date=quoteDate(s.quoteAsOf);if(s.verifiedSharesOutstanding&&date&&date<s.shareCountDate)report.quotePredatesShares++;
 if(s.liveCapINR!=null){if(s.liveCapEstimated)report.estimatedCaps++;else{report.exactCaps++;const expected=s.sourcePriceINR*s.verifiedSharesOutstanding;if(!Number.isFinite(expected)||Math.abs(expected-s.liveCapINR)>Math.max(1,expected)*1e-12||!date||date<s.shareCountDate||s.shareCountConflict)report.failures.push({ticker:s.ticker,reason:'Invalid exact market cap inputs/calculation'});const fx=vm.runInContext('fx',ctx);if(Math.abs(s.cap-s.liveCapINR/fx/1e9)>Math.max(1,s.cap)*1e-12)report.failures.push({ticker:s.ticker,reason:'USD conversion mismatch'})}}
 else if(s.cap!=null)report.datedSourceCaps++;else report.missingCaps++;
}
await writeFile(new URL('../.local/live-valuation-audit.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failures.length)process.exitCode=1;
