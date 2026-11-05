import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const ctx=vm.createContext({Date,Intl});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),ctx);
test('nice axes cover all observations, have round ticks and handle flat/negative series',()=>{for(const values of [[100,101,109],[-10,-2,5],[5,5],[0,0],[.001,.002]]){ctx.values=values;const s=vm.runInContext('niceChartScale(values)',ctx);assert.ok(s.min<=Math.min(...values));assert.ok(s.max>=Math.max(...values));assert.ok(s.max>s.min);assert.ok(s.ticks.length>=2&&s.ticks.length<=10);assert.ok(s.ticks.every(Number.isFinite))}});
test('comparison series retain their own first observation and normalize independently',()=>{ctx.items=[{name:'A',points:[{time:'2026-10-01',price:100},{time:'2026-10-02',price:110},{time:'2026-10-03',price:121}]},{name:'B',points:[{time:'2026-10-02',price:200},{time:'2026-10-03',price:180}]}];const s=vm.runInContext('preparePriceSeries(items,{comparison:true})',ctx);assert.equal(s[0].points.length,3);assert.equal(s[1].points.length,2);assert.equal(s[0].points[0].value,0);assert.equal(s[1].points[0].value,0);assert.ok(Math.abs(s[0].points[2].value-21)<1e-9);assert.ok(Math.abs(s[1].points[1].value+10)<1e-9);assert.notEqual(s[0].points[0].time,s[1].points[0].time)});
test('invalid quotes and duplicates cannot distort line geometry',()=>{ctx.items=[{points:[{time:'bad',price:100},{time:'2026-01-01',price:0},{time:'2026-01-02',price:20},{time:'2026-01-02',price:22}]}];const s=vm.runInContext('preparePriceSeries(items)',ctx);assert.equal(s[0].points.length,1);assert.equal(s[0].points[0].value,22)});
test('intraday markers display IST times; endpoints are retained on narrow charts',()=>{const label=vm.runInContext("chartTimeLabel('2026-10-30T03:45:00Z','1D')",ctx);assert.match(label,/9:15/);ctx.points=Array.from({length:76},(_,i)=>({time:new Date(Date.UTC(2026,9,30,3,45+i*5)).toISOString()}));const ticks=vm.runInContext("chartObservationTicks(points,'1D',320)",ctx);assert.equal(ticks[0].index,0);assert.equal(ticks.at(-1).index,75);assert.ok(ticks.length<=3)});
const mapCtx=vm.createContext({});vm.runInContext(await readFile(new URL('./dist/market-map.js',import.meta.url),'utf8'),mapCtx);
test('treemap preserves market-cap areas and labels remain ordered by cap',()=>{mapCtx.rows=[{cap:60},{cap:30},{cap:10}];const cells=vm.runInContext('marketMapLayout(rows)',mapCtx);assert.equal(cells.length,3);for(const c of cells)assert.ok(Math.abs(c.w*c.h/420000-c.stock.cap/100)<1e-9);assert.ok(cells.every(c=>c.w>0&&c.h>0))});
test('market-map colors keep white labels legible, including hover brightening',()=>{for(let v=-3;v<=3;v+=.1){mapCtx.change=v;const hex=vm.runInContext('marketMapColor(change)',mapCtx);const rgb=hex.slice(1).match(/../g).map(h=>Math.min(255,parseInt(h,16)*1.04)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const lum=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;assert.ok(1.05/(lum+.05)>=4.5,hex)}});
const scatterContext=vm.createContext({renderCharts(){}});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),scatterContext);vm.runInContext(await readFile(new URL('./dist/chart-audit.js',import.meta.url),'utf8'),scatterContext);
test('narrow scatter axes retain zero and negative bounds, and do not clip losses',()=>{scatterContext.rows=[{cap:166,earnings:30},{cap:10,earnings:-2.5},{cap:2,earnings:.05}];const g=vm.runInContext("scatterGeometry(rows,'earnings',325,'symlog')",scatterContext);assert.ok(g.xTicks.includes(0));assert.ok(g.xTicks.some(v=>v<0));for(const r of scatterContext.rows){assert.ok(g.x(r.earnings)>=g.left);assert.ok(g.y(r.cap)>=g.top);assert.ok(g.y(r.cap)<=g.bottom)}});
test('aggregate chart denominators exclude unmatched source entries and duplicate identities',()=>{ctx.rows=[{isin:'A',cap:10},{isin:'A',cap:10},{isin:'B',cap:20},{isin:null,cap:1000},{isin:'C',cap:null}];const universe=vm.runInContext('marketChartUniverse(rows)',ctx);assert.equal(universe.length,2);assert.equal(universe.reduce((n,r)=>n+r.cap,0),30)});
test('narrow market maps reflow into balanced rectangles without changing area weights',()=>{mapCtx.rows=Array.from({length:30},(_,i)=>({cap:1,rank:i}));const cells=vm.runInContext('marketMapLayout(rows,360,420)',mapCtx);assert.equal(cells.length,30);for(const c of cells){assert.ok(Math.abs(c.w*c.h-360*420/30)<1e-6);assert.ok(c.x+c.w<=360+1e-6&&c.y+c.h<=420+1e-6);assert.ok(Math.max(c.w/c.h,c.h/c.w)<2)}});

test('medium ranges place month-only ticks on the first of calendar months in IST',()=>{
 ctx.points=['2026-05-15T03:45:00Z','2026-06-02T03:45:00Z','2026-07-02T03:45:00Z','2026-08-03T03:45:00Z','2026-09-02T03:45:00Z','2026-10-30T03:45:00Z'].map(time=>({time}));
 for(const range of ['6M','YTD','1Y']){ctx.range=range;const ticks=vm.runInContext('chartObservationTicks(points,range,800)',ctx);assert.deepEqual(Array.from(ticks,t=>t.label),['Jun','Jul','Aug','Sep','Oct']);for(const t of ticks){const local=new Date(Date.parse(t.time)+330*60000);assert.equal(local.getUTCDate(),1);assert.equal(local.getUTCHours(),0);assert.ok(t.index>=0&&t.index<ctx.points.length-1)}assert.ok(ticks[0].index>0&&ticks[0].index<1,'non-trading month boundary is interpolated rather than moved to a quote');}
});
test('long ranges label only calendar years at 1 January, with responsive spacing',()=>{
 ctx.points=Array.from({length:8},(_,i)=>({time:`${2019+i}-10-30T03:45:00Z`}));
 for(const range of ['5Y','MAX']){ctx.range=range;const ticks=vm.runInContext('chartObservationTicks(points,range,330)',ctx);assert.ok(ticks.length<=4);for(const t of ticks){assert.match(t.label,/^\d{4}$/);const local=new Date(Date.parse(t.time)+330*60000);assert.equal(local.getUTCMonth(),0);assert.equal(local.getUTCDate(),1);assert.equal(local.getUTCHours(),0);}}
});
test('5D axis uses one date per session and never substitutes a closing time label',()=>{
 ctx.points=Array.from({length:5},(_,i)=>[`2026-10-${26+i}T03:45:00Z`,`2026-10-${26+i}T09:40:00Z`]).flat().map(time=>({time}));
 const ticks=vm.runInContext("chartObservationTicks(points,'5D',800)",ctx);assert.equal(ticks.length,5);assert.equal(new Set(ticks.map(t=>t.label)).size,5);assert.ok(ticks.every(t=>!/:|am|pm/i.test(t.label)));assert.equal(ticks.at(-1).label,'30 Oct');
 assert.match(vm.runInContext("chartTimeLabel(points.at(-1).time,'5D',true)",ctx),/03:10 pm/i);
});

test('5Y/MAX use the each series’ last trading observation per IST week without changing calendar-axis rules',async()=>{
 const points=[{time:'2026-10-26T00:00:00+05:30',price:100},{time:'2026-10-29T00:00:00+05:30',price:110},{time:'2026-10-30T00:00:00+05:30',price:120},{time:'2026-11-02T00:00:00+05:30',price:130},{time:'2026-11-03T00:00:00+05:30',price:140}];
 const local=vm.createContext({points});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),local);for(const range of ['5Y','MAX']){local.range=range;const result=vm.runInContext('preparePriceSeries([{points},{points:points.filter(p=>p.price!==120)}],{comparison:true,range})',local);assert.equal(result[0].points.length,2);assert.equal(result[0].points[0].price,120);assert.equal(result[0].points[1].price,140);assert.equal(result[0].points[0].value,0);assert.equal(result[1].points[1].time,result[0].points[1].time)}assert.equal(vm.runInContext('preparePriceSeries([{points}],{range:"1Y"})[0].points.length',local),5);
});

test('shared comparison axis places later histories at their own dates and keeps calendar year spacing',async()=>{
 const ctx=vm.createContext({});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),ctx);
 ctx.series=[{points:[{time:'2020-01-01'},{time:'2021-01-01'},{time:'2022-01-01'}]},{points:[{time:'2021-01-01'},{time:'2021-06-01'},{time:'2022-01-01'}]}];
 const scale=vm.runInContext('priceChartTimeScale(series,"MAX")',ctx);assert.equal(scale.points.length,4);assert.equal(scale.fraction('2020-01-01'),0);assert.equal(scale.fraction('2022-01-01'),1);assert.ok(scale.fraction('2021-01-01')>.49&&scale.fraction('2021-01-01')<.51);assert.ok(scale.fraction('2021-06-01')>scale.fraction('2021-01-01'));
});

test('price domains never imply negative prices, while return comparisons retain signed losses',()=>{
 for(const values of [[.01,20],[1,1],[0,.001],[.3,14]]){ctx.values=values;const scale=vm.runInContext('niceChartScale(values,{nonNegative:true})',ctx);assert.ok(scale.min>=0);assert.ok(scale.min<=Math.min(...values));assert.ok(scale.max>=Math.max(...values));assert.ok(scale.ticks.every(v=>v>=0))}
 ctx.values=[-30,5];assert.ok(vm.runInContext('niceChartScale(values,{includeZero:true}).min',ctx)<0);
});


test('market map secondary labels remain opaque and legible through gradient and hover composites',async()=>{
 const css=await readFile(new URL('./dist/style.css',import.meta.url),'utf8');
 for(const selector of ['.treemap-tile .tile-name','.treemap-tile .tile-cap']){let opacity;for(const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)){if(m[1].trim()===selector){const v=m[2].match(/opacity:([.0-9]+)/);if(v)opacity=Number(v[1])}}assert.equal(opacity,1,selector)}
 const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 for(const change of [null,NaN,-100,100,...Array.from({length:601},(_,i)=>(i-300)/100)]){mapCtx.change=change;const hex=vm.runInContext('marketMapColor(change)',mapCtx),base=hex.slice(1).match(/../g).map(v=>parseInt(v,16));for(const gradient of [0,10/255])for(const brightness of [1,1.04]){const bg=base.map(c=>Math.min(255,(c+(255-c)*gradient)*brightness));assert.ok(1.05/(luminance(bg)+.05)>=4.5,hex+' '+gradient+' '+brightness)}}
});


test('chart labels reuse five formatter styles without changing IST dates or intraday detail',async()=>{
 let created=0;class Formatter extends Intl.DateTimeFormat{constructor(...args){super(...args);created++}}
 const labels=vm.createContext({Intl:{DateTimeFormat:Formatter}});vm.runInContext(await readFile(new URL('./dist/chart-core.js',import.meta.url),'utf8'),labels);
 for(let i=0;i<10;i++)for(const range of ['1D','5D','1M','6M','YTD','1Y','5Y','MAX']){labels.range=range;for(const full of [false,true]){labels.full=full;const actual=vm.runInContext("chartTimeLabel('2026-11-01T20:00:00Z',range,full)",labels);const options={timeZone:'Asia/Kolkata',...(full?{day:'numeric',month:'short',year:'numeric',hour:range==='1D'||range==='5D'?'2-digit':undefined,minute:range==='1D'||range==='5D'?'2-digit':undefined}:range==='1D'?{hour:'numeric',minute:'2-digit'}:{day:'numeric',month:'short',...(['1Y','5Y','MAX'].includes(range)?{year:'2-digit'}:{})})};assert.equal(actual,new Date('2026-11-01T20:00:00Z').toLocaleString('en-IN',options))}}
 assert.equal(created,5);assert.equal(vm.runInContext("chartTimeLabel('invalid','MAX')",labels),'Invalid Date');
});
