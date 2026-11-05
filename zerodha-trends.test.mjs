import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {normalizeTrendHistory,trendWindowStart,ZerodhaTrends} from './zerodha-trends.mjs';
import {historyStartDate} from './kite.mjs';
const now=new Date('2026-11-02T09:00:00Z'),entry={isin:'INE002A01018',symbol:'TEST',exchange:'NSE',instrumentToken:1};
const history=points=>({provider:'Zerodha Kite',currency:'INR',points});
test('rolling 30 calendar days use IST boundaries across month/year ends',()=>{assert.equal(trendWindowStart(now),'2026-10-04');assert.equal(historyStartDate('30D',now),'2026-10-04');assert.equal(trendWindowStart(new Date('2026-01-01T00:00:00Z')),'2025-12-03')});
test('new listings use only actual observations since IPO; missing days are never padded',()=>{const r=normalizeTrendHistory(history([{time:'2026-10-02',price:99},{time:'2026-10-29',price:100},{time:'2026-10-30',price:110},{time:'2026-11-02',price:120},{time:'2026-11-03',price:130},{time:'2026-11-01',price:-1}]),entry,{now,listingDate:'2026-10-30'});assert.equal(r.points.length,2);assert.equal(r.points[0].date,'2026-10-30');assert.equal(r.points[1].date,'2026-11-02');assert.equal(r.state,'ready');assert.throws(()=>normalizeTrendHistory({provider:'Other',points:[]},entry,{now}),/Invalid Zerodha/)});
test('one-day and empty provider histories remain one observation or unavailable',()=>{const one=normalizeTrendHistory(history([{time:'2026-11-02',price:10}]),entry,{now,listingDate:'2026-11-02'});assert.equal(one.points.length,1);assert.equal(normalizeTrendHistory(history([]),entry,{now}).state,'unavailable')});
test('market-wide loader deduplicates exchanges, caches restart state and prioritises without batch-enqueuing histories',async()=>{const folder=await mkdtemp(path.join(os.tmpdir(),'isv-trends-'));let calls=0;const kite={accessToken:'test-session',state:'streaming',registry:new Map([[1,entry],[2,{...entry,exchange:'BSE',instrumentToken:2}]]),history:async(token,range)=>{calls++;assert.equal(token,1);assert.equal(range,'30D');return history([{time:'2026-11-02',price:10}])}};const service=new ZerodhaTrends(kite,folder,{now:()=>now});try{await service.run();assert.equal(calls,1);await service.run();assert.equal(calls,1);assert.equal(service.status().eligible,1);assert.equal(service.payload([entry.isin]).records[0].state,'ready');const cached=JSON.parse(await readFile(path.join(folder,'zerodha-trends.json'),'utf8'));assert.equal(cached.records.length,1);assert.equal(JSON.stringify(cached).includes('test-session'),false);const restored=new ZerodhaTrends(kite,folder,{now:()=>now});await restored.initialize();await restored.stop();assert.equal(restored.payload([entry.isin]).records[0].points.length,1)}finally{await service.stop();await rm(folder,{recursive:true,force:true})}});
class FixedDate extends Date{constructor(value){super(value===undefined?now:value)}static now(){return now.getTime()}}
const context=vm.createContext({setInterval(){},renderRows(){},Date:FixedDate,STATIC_PREVIEW:false});vm.runInContext(await readFile(new URL('./dist/ui-utils.js',import.meta.url),'utf8'),context);vm.runInContext(await readFile(new URL('./dist/zerodha-trends.js',import.meta.url),'utf8'),context);
test('sparkline return uses real prices, adds only matched Zerodha quotes, and ignores the legacy graphic',()=>{context.s={...entry,liveSource:'NSE',sourcePriceINR:120,lastTrade:'2026-11-02T09:00:00Z',sparkline:'M0,0 L1,999',zerodhaTrend:normalizeTrendHistory(history([{time:'2026-10-30',price:100}]),entry,{now,listingDate:'2026-10-30'})};assert.ok(Math.abs(vm.runInContext('zerodhaTrendReturn(s)',context)-20)<1e-9);context.s.liveSource='BSE';assert.equal(vm.runInContext('zerodhaTrendReturn(s)',context),null);context.s.zerodhaTrend.points=[{date:'2026-11-02',price:10}];const markup=vm.runInContext('zerodhaTrendMarkup(s)',context);assert.match(markup,/<circle/);assert.doesNotMatch(markup,/<path/);context.s.zerodhaTrend=null;assert.doesNotMatch(vm.runInContext('zerodhaTrendMarkup(s)',context),/<path/)});


test('background returns are supplied for sorting even when their paths are not requested',async()=>{
 const kite={accessToken:null,state:'login_required',registry:new Map([[1,entry]]),quotes:new Map()},service=new ZerodhaTrends(kite,'/unused',{now:()=>now});service.records.set(entry.isin,normalizeTrendHistory(history([{time:'2026-10-30',price:10},{time:'2026-11-02',price:12}]),entry,{now}));const payload=service.payload([]);assert.equal(payload.records.length,0);assert.ok(Math.abs(payload.returns[entry.isin]-20)<1e-9);
});

test('short listing histories occupy their calendar-day share of the common 30-day axis',()=>{
 context.s={...entry,name:'New company',zerodhaTrend:normalizeTrendHistory(history([{time:'2026-10-28',price:10},{time:'2026-11-02',price:11}]),entry,{now,listingDate:'2026-10-28'})};
 const markup=vm.runInContext('zerodhaTrendMarkup(s)',context),match=markup.match(/d="M([\d.]+),[\d.]+ L([\d.]+),/);assert.ok(match);const width=Number(match[2])-Number(match[1]);assert.ok(Math.abs(width-147*5/29)<.02);assert.equal(Number(match[2]),151);assert.ok(Number(match[1])>120);
 context.s.zerodhaTrend=normalizeTrendHistory(history([{time:'2026-11-02',price:10}]),entry,{now,listingDate:'2026-11-02'});assert.match(vm.runInContext('zerodhaTrendMarkup(s)',context),/cx="151.00"/);
});
