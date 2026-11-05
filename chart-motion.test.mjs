import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./dist/chart-interactions.js',import.meta.url),'utf8'),helper=source.slice(source.indexOf('function animateChartSwap('));
function setup(reduced=false){const classes=new Map(),calls=[],old={attrs:{},classList:{add(){}},setAttribute(k,v){this.attrs[k]=v},removeAttribute(){},querySelectorAll(){return []},animate(frames,timing){calls.push({target:'old',frames,timing});return {finished:Promise.resolve()}},remove(){this.removed=true}},svg={animate(frames,timing){calls.push({target:'new',frames,timing});return {finished:Promise.resolve()}}},canvas={classList:{toggle(k,v){classes.set(k,v)}},querySelector:()=>svg,querySelectorAll:()=>[],append(node){this.exit=node}};const ctx=vm.createContext({window:{matchMedia:()=>({matches:reduced})},canvas,previous:{cloneNode:()=>old}});vm.runInContext(helper,ctx);return {ctx,canvas,old,classes,calls}}
test('chart switches crossfade complete SVGs briefly and remove non-interactive artwork afterward',async()=>{const h=setup();vm.runInContext('animateChartSwap(canvas,previous)',h.ctx);assert.equal(h.calls.length,2);assert.equal(h.calls[0].timing.duration,320);assert.equal(h.old.attrs['aria-hidden'],'true');assert.equal(h.old.attrs.focusable,'false');assert.equal(h.classes.get('chart-first-draw'),false);await new Promise(resolve=>setImmediate(resolve));assert.equal(h.old.removed,true)});
test('reduced motion skips animation and initial charts use only the entry reveal',()=>{const h=setup(true);vm.runInContext('animateChartSwap(canvas,previous)',h.ctx);assert.equal(h.calls.length,0);assert.equal(h.canvas.exit,undefined);assert.equal(h.classes.get('chart-first-draw'),false);const initial=setup();vm.runInContext('animateChartSwap(canvas,null)',initial.ctx);assert.equal(initial.classes.get('chart-first-draw'),true);assert.equal(initial.calls.length,0)});

const kiteSource=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8');
const loadComparison=kiteSource.slice(kiteSource.indexOf('async function loadKiteComparison('),kiteSource.indexOf('\nconst chartPreloadTimes='));
function batchHarness(){
 const requests=[],renders=[],frames=[],holder={innerHTML:'old chart',setAttribute(){},querySelector(){return null},classList:{add(){}},insertAdjacentHTML(){}},card={dataset:{},querySelector(selector){return selector==='.price-history-chart'?{}:holder},querySelectorAll(){return []}};
 const context=vm.createContext({document:{body:{classList:{contains:()=>false}},querySelector:()=>card,contains:()=>true},kiteChartRequest:0,kiteCompareRange:'1M',currency:'USD',escapeHtml:v=>v,preloadChartTimelines(){},getPriceHistory(s,range){return new Promise((resolve,reject)=>requests.push({s,range,resolve,reject}))},requestAnimationFrame:fn=>frames.push(fn),renderKiteHistoryValues:(...args)=>renders.push(args)});
 vm.runInContext(loadComparison,context);return {context,requests,renders,frames,holder};
}
test('comparison waits for every history and reveals all lines in selection order in one frame',async()=>{
 const h=batchHarness();h.context.selected=[{isin:'A'},{isin:'B'},{isin:'C'}];const pending=vm.runInContext('loadKiteComparison(selected,"1M")',h.context);
 h.requests[2].resolve({points:[1,2]});h.requests[0].resolve({points:[1,2]});await new Promise(resolve=>setImmediate(resolve));assert.equal(h.frames.length,0);assert.equal(h.renders.length,0);assert.equal(h.holder.innerHTML,'old chart');
 h.requests[1].resolve({points:[1,2]});await pending;assert.equal(h.frames.length,1);h.frames.shift()();assert.equal(h.renders.length,1);assert.deepEqual(Array.from(h.renders[0][5],v=>v.s.isin),['A','B','C']);assert.equal(h.renders[0][6],0);
});
test('superseded comparison batches cannot render and failures settle with the complete batch',async()=>{
 const h=batchHarness();h.context.selected=[{isin:'A'},{isin:'B'}];const older=vm.runInContext('loadKiteComparison(selected,"1M")',h.context),newer=vm.runInContext('loadKiteComparison(selected,"1Y")',h.context);
 h.requests[0].resolve({points:[1,2]});h.requests[1].resolve({points:[1,2]});await older;assert.equal(h.frames.length,0);
 h.requests[2].resolve({points:[1,2]});h.requests[3].reject(Error('History unavailable'));await newer;assert.equal(h.frames.length,1);h.frames.shift()();assert.equal(h.renders.length,1);assert.equal(h.renders[0][1],'1Y');assert.equal(h.renders[0][5][1].error,'History unavailable');
});

test('individual index charts retain points in USD display and mixed comparisons use percentage performance',async()=>{
 const holder={setAttribute(){},classList:{remove(){}},querySelector(selector){return selector==='.price-history-chart'?null:selector==='.price-chart-canvas'?{isConnected:false}:selector==='.overlay-legend'?{append(){}}:{}}},card={querySelector:()=>holder},index={name:'NIFTY 50',ticker:'INDEX:NSE:NIFTY 50',isIndex:true},stock={name:'Stock',ticker:'TEST.NS'},values=[{s:index,color:'#123',data:{points:[{time:'2026-10-23',price:100},{time:'2026-10-30',price:120}]}},{s:stock,color:'#456',data:{points:[{time:'2026-10-23',price:200},{time:'2026-10-30',price:220}]}}];
 const ctx=vm.createContext({card,values,currency:'USD',fx:100,formatINR:v=>'₹'+v,formatUSD:v=>'$'+v,indexLevel:v=>v+' pts',escapeHtml:v=>v,chartTimeLabel:v=>v,document:{createElement:()=>({dataset:{},setAttribute(){}})},ResizeObserver:class{observe(){}disconnect(){}},animateChartSwap(){}});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),ctx);vm.runInContext('const actualPrepare=preparePriceSeries;preparePriceSeries=(...args)=>(globalThis.captured=actualPrepare(...args));',ctx);vm.runInContext(kiteSource.slice(kiteSource.indexOf('function renderKiteHistoryValues('),kiteSource.indexOf('\nconst previousRenderCompare=')),ctx);
 vm.runInContext('renderKiteHistoryValues([values[0].s],"5Y",{},card,false,[values[0]],0)',ctx);assert.equal(ctx.captured[0].points[0].value,100);assert.equal(ctx.captured[0].formatPrice(100),'100 pts');assert.match(ctx.captured[0].difference(100,120,{price:100},{price:120}),/20 pts/);
 vm.runInContext('renderKiteHistoryValues(values.map(v=>v.s),"5Y",null,card,true,values,0)',ctx);assert.equal(ctx.captured[0].points[0].value,0);assert.ok(Math.abs(ctx.captured[0].points[1].value-20)<1e-8);assert.ok(Math.abs(ctx.captured[1].points[1].value-10)<1e-8);assert.equal(ctx.captured[1].formatPrice(200),'$2');
});


test('a newly listed company with one weekly observation cannot hide other comparison lines',async()=>{
 const holder={setAttribute(){},classList:{remove(){}},querySelector(selector){return selector==='.price-history-chart'?null:selector==='.price-chart-canvas'?{isConnected:false}:selector==='.overlay-legend'?{append(){}}:{}}},card={querySelector:()=>holder};
 const values=[{s:{name:'Established',ticker:'OLD.NS'},color:'#123',data:{points:[{time:'2026-10-23',price:100},{time:'2026-10-30',price:110}]}},{s:{name:'New listing',ticker:'NEW.NS'},color:'#456',data:{points:[{time:'2026-10-29',price:200},{time:'2026-10-30',price:205}]}}];
 const ctx=vm.createContext({card,values,currency:'INR',fx:100,formatINR:v=>'₹'+v,formatUSD:v=>'$'+v,indexLevel:v=>v+' pts',escapeHtml:v=>v,chartTimeLabel:v=>v,document:{createElement:()=>({dataset:{},setAttribute(){}})},ResizeObserver:class{observe(){}disconnect(){}},animateChartSwap(){}});
 vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),ctx);vm.runInContext(kiteSource.slice(kiteSource.indexOf('function renderKiteHistoryValues('),kiteSource.indexOf('\nconst previousRenderCompare=')),ctx);
 for(const range of ['5Y','MAX']){ctx.range=range;vm.runInContext('renderKiteHistoryValues(values.map(v=>v.s),range,null,card,true,values,0)',ctx);assert.match(holder.innerHTML,/price-chart-canvas/);assert.match(holder.innerHTML,/Established: 2/);assert.match(holder.innerHTML,/New listing: Fewer than two weekly observations/);assert.doesNotMatch(holder.innerHTML,/New listing: 1 observations/)}
 vm.runInContext('renderKiteHistoryValues([values[1].s],"MAX",null,card,true,[values[1]],0)',ctx);assert.match(holder.innerHTML,/Not enough history/);assert.doesNotMatch(holder.innerHTML,/price-chart-canvas/);
});


test('page disposal immediately releases chart observation and invalidates pending batches',async()=>{
 let disconnected=0;const h=batchHarness();vm.runInContext('let priceChartResizeObserver={disconnect(){globalThis.disconnected()}};',h.context);h.context.disconnected=()=>disconnected++;
 vm.runInContext(kiteSource.slice(kiteSource.indexOf('function disposePriceChart('),kiteSource.indexOf('function observePriceChartSize(')),h.context);
 h.context.selected=[{isin:'A'}];const pending=vm.runInContext('loadKiteComparison(selected,"1M")',h.context);vm.runInContext('disposePriceChart()',h.context);assert.equal(disconnected,1);assert.equal(vm.runInContext('priceChartResizeObserver',h.context),null);
 h.requests[0].resolve({points:[1,2]});await pending;assert.equal(h.frames.length,0);assert.equal(h.renders.length,0);vm.runInContext('disposePriceChart()',h.context);assert.equal(disconnected,1);
 const ready=vm.runInContext('loadKiteComparison(selected,"1Y")',h.context);h.requests[1].resolve({points:[1,2]});await ready;assert.equal(h.frames.length,1);vm.runInContext('disposePriceChart()',h.context);h.frames.shift()();assert.equal(h.renders.length,0);
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8');assert.match(app,/function render\(\)\{if\(!db\)return;if\(typeof disposePriceChart==='function'\)disposePriceChart\(\);renderedRoute=/);
});
