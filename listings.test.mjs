import test from 'node:test';import assert from 'node:assert/strict';import {diffListings,parseCSV} from './listings.mjs';
test('separates new equity from a second exchange listing',()=>{const previous=[{exchange:'NSE',symbol:'OLD',isin:'INE1'}];const next=[...previous,{exchange:'BSE',symbol:'OLD',isin:'INE1'},{exchange:'NSE',symbol:'NEW',isin:'INE2'}];const changes=diffListings(previous,next,'2026-10-30T00:00:00Z');assert.deepEqual(changes.map(c=>c.type),['additional_listing','new_security']);assert.ok(changes.every(c=>c.listingDate===null));assert.equal(diffListings(previous,previous,'today').length,0)});
test('parses quoted broker CSV fields without treating prices as live quotes',()=>{const r=parseCSV('exchange,tradingsymbol,name,instrument_type\nNSE,ABC,"ABC, Limited",EQ\n');assert.equal(r[0].name,'ABC, Limited');assert.equal(r[0].tradingsymbol,'ABC')});

test('reviewed ticker changes merge by verified ISIN without duplicating a company or breaking its saved identity',async()=>{
 const {readFile}=await import('node:fs/promises'),vm=await import('node:vm'),ctx=vm.createContext({});vm.runInContext(await readFile(new URL('./dist/ranking-universe.js',import.meta.url),'utf8'),ctx);
 ctx.saved=[{ticker:'LTIM.NS',name:'LTIMindtree',cap:14,revenue:4}];ctx.directory=[{symbol:'LTM',name:'LTM LIMITED',exchange:'NSE',isin:'INE214T01019'},{symbol:'LTM',name:'LTM LIMITED',exchange:'BSE',isin:'INE214T01019'}];
 const rows=vm.runInContext("mergeRankingUniverse(saved,directory,'2026-11-02')",ctx);assert.equal(rows.length,1);assert.equal(rows[0].ticker,'LTM.NS');assert.equal(rows[0].sourceTicker,'LTIM.NS');assert.equal(rows[0].currentTicker,'LTM.NS');assert.equal(rows[0].name,'LTM Limited');assert.equal(rows[0].revenue,4);assert.equal(rows[0].exchangeListings.length,2);assert.ok(rows[0].aliases.includes('LTIMindtree'));
 ctx.saved.push({ticker:'LTM.NS',name:'LTM Limited',revenue:5});const merged=vm.runInContext("mergeRankingUniverse(saved,directory,'2026-11-02')",ctx);assert.equal(merged.length,1);assert.equal(merged[0].ticker,'LTM.NS');assert.equal(merged[0].revenue,5);ctx.rows=merged;assert.equal(vm.runInContext("resolveStockIdentity(rows,'LTIM.NS').ticker",ctx),'LTM.NS');assert.equal(vm.runInContext("canonicalSavedTickers(rows,['LTIM.NS','LTM.NS']).join(',')",ctx),'LTM.NS');ctx.saved.pop();ctx.directory[0].isin='WRONG';const mismatched=vm.runInContext("mergeRankingUniverse(saved,directory,'2026-11-02')",ctx);assert.equal(mismatched[0].isin,null);
 const before=vm.runInContext("mergeRankingUniverse(saved,directory,'2026-01-01')",ctx);assert.equal(before[0].currentTicker,undefined);
});

test('reviewed name changes canonicalise bookmarks and saved selections only after the effective date and ISIN match',async()=>{
 const {readFile}=await import('node:fs/promises'),vm=await import('node:vm'),ctx=vm.createContext({});vm.runInContext(await readFile(new URL('./dist/ranking-universe.js',import.meta.url),'utf8'),ctx);
 const changes=vm.runInContext('Object.entries(reviewedSymbolChanges)',ctx);
 for(const [old,change]of changes){ctx.saved=[{ticker:old,name:'Former company',cap:2,revenue:1}];ctx.directory=[{symbol:change.symbol,exchange:change.exchange,isin:change.isin}];ctx.date=change.effectiveDate;
 const rows=vm.runInContext('mergeRankingUniverse(saved,directory,date)',ctx),ticker=change.symbol+'.NS';assert.equal(rows.length,1,old);assert.equal(rows[0].ticker,ticker);assert.equal(rows[0].isin,change.isin);assert.equal(rows[0].sourceTicker,old);ctx.rows=rows;ctx.old=old;ctx.current=ticker;assert.equal(vm.runInContext('resolveStockIdentity(rows,old).ticker',ctx),ticker);assert.equal(vm.runInContext('canonicalSavedTickers(rows,[old,current]).length',ctx),1);
 ctx.directory[0].isin='DIFFERENT';assert.equal(vm.runInContext('mergeRankingUniverse(saved,directory,date)[0].isin',ctx),null);ctx.directory[0].isin=change.isin;assert.equal(vm.runInContext("mergeRankingUniverse(saved,directory,'2000-01-01')[0].ticker",ctx),old);
 }
});

test('headline market totals use distinct verified companies and exclude unresolved or non-finite valuations',async()=>{
 const {readFile}=await import('node:fs/promises'),vm=await import('node:vm'),ctx=vm.createContext({rows:[{isin:'A',cap:10,change:1},{isin:'A',cap:10,change:1},{isin:'B',cap:0,change:-2},{isin:'C',cap:NaN,change:null},{ticker:'OLD',cap:100,change:8}]});vm.runInContext(await readFile(new URL('./dist/ranking-universe.js',import.meta.url),'utf8'),ctx);const s=vm.runInContext('rankingMarketSummary(rows)',ctx);assert.equal(s.cap,10);assert.equal(s.companies,3);assert.equal(s.valued,1);assert.equal(s.advancers,1);assert.equal(s.decliners,1);assert.equal(s.unresolved,1);
});


test('company universe excludes rights entitlements from fresh and cached sources while retaining ordinary and SME equities',async()=>{
 const {normalizeMaster,isRightsEntitlement}=await import('./listings.mjs'),{readFile}=await import('node:fs/promises'),vm=await import('node:vm');
 const fixtures=[['SHIVAM-RE1','SHIVAM AUTOTECH LTD','BE',true],['URBAN-RE','URBAN ENVIRO WASTE LTD','ST',true],['ABC','ABC Rights Entitlement','EQ',true],['RELIANCE','RELIANCE INDUSTRIES','EQ',false],['SME','SME COMPANY','ST',false],['ORDINARY','ORDINARY COMPANY','BE',false],['REPCOHOME','REPCO HOME FINANCE','EQ',false]];
 const raw=fixtures.map(([symbol,name,group],i)=>({trading_symbol:symbol,name,instrument_type:group,segment:'NSE_EQ',exchange:'NSE',isin:'INE'+i}));
 assert.deepEqual(normalizeMaster(raw).map(r=>r.symbol),['RELIANCE','SME','ORDINARY','REPCOHOME']);
 const ctx=vm.createContext({});vm.runInContext(await readFile(new URL('./dist/ranking-universe.js',import.meta.url),'utf8'),ctx);
 for(const [symbol,name,,excluded] of fixtures){for(const row of [{symbol,name},{ticker:symbol+'.NS',name},{ticker:symbol+'.BO',name}]){ctx.row=row;assert.equal(isRightsEntitlement(row),excluded);assert.equal(vm.runInContext('isRightsEntitlementListing(row)',ctx),excluded)}}
 ctx.directory=raw.map(r=>({symbol:r.trading_symbol,name:r.name,exchange:r.exchange,isin:r.isin}));ctx.snapshot=ctx.directory.map(r=>({ticker:r.symbol+'.NS',name:r.name,cap:1}));
 for(const directory of [ctx.directory,[...ctx.directory].reverse()]){ctx.directory=directory;const rows=vm.runInContext('mergeRankingUniverse(snapshot,directory)',ctx);assert.deepEqual(Array.from(rows,r=>r.ticker),['RELIANCE.NS','SME.NS','ORDINARY.NS','REPCOHOME.NS']);assert.ok(rows.every(r=>r.isin))}
});


test('indexed company matching preserves first listing and reviewed ISIN selection among duplicate symbols',async()=>{
 const {readFile}=await import('node:fs/promises'),vm=await import('node:vm'),ctx=vm.createContext({snapshot:[{ticker:'TEST.NS',name:'Test'},{ticker:'LTIM.NS',name:'Former LTI'}],directory:[{exchange:'NSE',symbol:'TEST',isin:'INE123A01010',name:'First'},{exchange:'BSE',symbol:'TEST',isin:'INE999A01010',name:'Other exchange'},{exchange:'NSE',symbol:'TEST',isin:'INE777A01010',name:'Duplicate'},{exchange:'NSE',symbol:'LTM',isin:'INE000A01010',name:'Wrong ISIN'},{exchange:'NSE',symbol:'LTM',isin:'INE214T01019',name:'Verified renamed company'}]});
 vm.runInContext(await readFile(new URL('./dist/ranking-universe.js',import.meta.url),'utf8'),ctx);const rows=vm.runInContext("mergeRankingUniverse(snapshot,directory,'2026-11-05')",ctx);assert.equal(rows[0].isin,'INE123A01010');assert.equal(rows[1].isin,'INE214T01019');assert.equal(rows[1].ticker,'LTM.NS');assert.equal(rows[1].sourceTicker,'LTIM.NS');assert.equal(rows.length,5);
});
