import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./dist/page-metadata.js',import.meta.url),'utf8');
const ctx=vm.createContext({render(){}});vm.runInContext(source,ctx);
test('each top-level route has a distinct title, meaningful description and public URL',()=>{const titles=new Set();for(const key of ['rankings','sectors','charts','compare','watchlist','about']){ctx.route=key;const data=vm.runInContext('pageMetadata(route)',ctx);assert.ok(data.description.length>50);assert.match(data.url,/^https:\/\/pragalbhshandilya.github.io\/india-stock-view\//);titles.add(data.title)}assert.equal(titles.size,6)});
test('company metadata uses the requested identity and handles malformed or missing routes safely',()=>{ctx.rows=[{ticker:'M&M.NS',name:'Mahindra & Mahindra'}];const data=vm.runInContext("pageMetadata('#stock/M%26M.NS/price',rows)",ctx);assert.match(data.title,/Mahindra & Mahindra — Share price/);assert.ok(data.url.endsWith('#stock/M%26M.NS/price'));assert.match(vm.runInContext("pageMetadata('#stock/%ZZ/price').title",ctx),/not found/);assert.match(vm.runInContext("pageMetadata('#unknown').title",ctx),/rankings/)});
test('verified companies get clean canonical identity URLs and old ticker aliases resolve to the current company',()=>{ctx.rows=[{ticker:'LTM.NS',name:'LTM Limited',isin:'INE214T01019',aliases:['LTIM.NS']}];const result=vm.runInContext("pageMetadata('#stock/LTIM.NS/cap',rows)",ctx);assert.ok(result.url.endsWith('/companies/LTM.NS/'));assert.equal(result.shareTitle,'LTM Limited | IndiaStockView');assert.ok(result.description.includes('(LTM.NS)'));assert.equal(vm.runInContext("pageMetadata('watchlist').noindex",ctx),true)});


test('supported indices have distinct clean canonical URLs and unknown indices stay unindexed',()=>{
 const urls=new Set();for(const id of ['NSE:NIFTY 50','BSE:SENSEX','NSE:NIFTY BANK','NSE:NIFTY NEXT 50','NSE:NIFTY IT','NSE:NIFTY MIDCAP 100','NSE:NIFTY SMLCAP 100']){ctx.id=id;const data=vm.runInContext("pageMetadata('#index/'+encodeURIComponent(id))",ctx);assert.ok(data.url.endsWith('/indices/'+encodeURIComponent(id)+'/'));assert.ok(!data.noindex);assert.ok(data.title.includes(id.split(':')[1]));urls.add(data.url)}assert.equal(urls.size,7);assert.equal(vm.runInContext("pageMetadata('#index/UNKNOWN').noindex",ctx),true);
});
