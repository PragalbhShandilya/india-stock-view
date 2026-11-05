import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('./dist/chart-interactions.js',import.meta.url),'utf8');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attrs={};this.style={};this.classList={add(){}};this.offsetWidth=100;this.offsetHeight=50;this.hidden=false}
 append(...nodes){this.children.push(...nodes)}prepend(node){this.children.unshift(node)}setAttribute(k,v){this.attrs[k]=v}addEventListener(k,fn){this.events[k]=fn}
}
function harness(){const parent=new Element('div'),svg=new Element('svg');svg.parentElement=parent;svg.closest=()=>null;svg.getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});svg.viewBox={baseVal:{width:100}};svg.createSVGPoint=()=>({matrixTransform(){return {x:this.x}}});svg.getScreenCTM=()=>({inverse(){return {}}});svg.focus=()=>{};svg.setPointerCapture=()=>{};svg.hasPointerCapture=()=>false;
 const series=[{name:'<Company>',color:'#123',format:v=>v+'%',difference:(a,b)=>(b-a)+'%',points:[{x:0,y:90,value:10,label:'1 Nov 2026'},{x:100,y:20,value:20,label:'2 Nov 2026'}]}];
 const document={createElement:tag=>new Element(tag),createElementNS:(ns,tag)=>new Element(tag),querySelectorAll:()=>[],activeElement:svg};const ctx=vm.createContext({document,window:{addEventListener(){},innerWidth:1000,innerHeight:800},escapeHtml:v=>String(v).replaceAll('<','&lt;'),requestAnimationFrame:fn=>fn(),svg,series,parent});vm.runInContext(source,ctx);return {ctx,svg,parent,series};}
test('chart data alternative is lazy, semantic, text-safe and uses source observations',()=>{const h=harness(),details=vm.runInContext('appendChartDataTable(parent,series)',h.ctx);assert.equal(details.children.length,1);details.events.toggle();assert.equal(details.children.length,1);details.open=true;details.events.toggle();assert.equal(details.children.length,2);const table=details.children[1].children[0];assert.equal(table.children[0].textContent,'<Company>');const heads=table.children[1].children[0].children;assert.deepEqual(heads.map(n=>[n.textContent,n.scope]),[['Date / time','col'],['Value','col']]);const rows=table.children[2].children;assert.deepEqual(rows.map(r=>r.children.map(c=>c.textContent)),[['1 Nov 2026','10%'],['2 Nov 2026','20%']]);assert.equal(rows[0].children[0].scope,'row');details.events.toggle();assert.equal(details.children.length,2)});
test('keyboard focus exposes latest observation and cancelled pointer gestures clear selection state',()=>{const h=harness();vm.runInContext('attachChartInteraction(svg,series,{left:0,right:100,top:0,bottom:100})',h.ctx);const tooltip=h.parent.children.find(n=>n.className==='chart-tooltip');assert.equal(h.svg.attrs.role,'group');h.svg.events.focus();assert.equal(tooltip.hidden,false);assert.match(tooltip.innerHTML,/2 Nov 2026/);h.svg.events.keydown({key:'Home',preventDefault(){}});assert.match(tooltip.innerHTML,/1 Nov 2026/);h.svg.events.pointerdown({button:0,clientX:0,clientY:50,pointerId:1,preventDefault(){}});h.svg.events.pointerup({clientX:100,clientY:50,pointerId:1});assert.match(tooltip.innerHTML,/10%/);h.svg.events.pointercancel();assert.equal(tooltip.hidden,true);h.svg.events.pointermove({clientX:0,clientY:50});assert.equal(tooltip.hidden,false);assert.match(tooltip.innerHTML,/1 Nov 2026/);assert.ok(!tooltip.innerHTML.includes('→'));h.svg.events.keydown({key:'Escape'});assert.equal(tooltip.hidden,true);h.svg.events.blur();assert.equal(tooltip.hidden,true);h.svg.events.focus();assert.equal(tooltip.hidden,false)});

test('scatter data alternative uses the plotted subset, signed values, units and estimated cap labels',async()=>{
 const audit=await readFile(new URL('./dist/chart-audit.js',import.meta.url),'utf8');
 const ctx=vm.createContext({document:{createElement:tag=>new Element(tag)},amount:value=>'$'+value,parent:new Element('section'),points:[{name:'<Loss company>',earnings:-20,cap:100,liveCapEstimated:true},{name:'Other company',earnings:30,cap:200}]});
 vm.runInContext(audit.slice(audit.indexOf('function appendScatterDataTable(')),ctx);
 const details=vm.runInContext("appendScatterDataTable(parent,points,'earnings','Pretax profit · TTM','USD')",ctx);
 assert.equal(details.children.length,1);assert.match(details.children[0].textContent,/2 companies/);
 details.events.toggle();assert.equal(details.children.length,1);details.open=true;details.events.toggle();
 const scroll=details.children[1],table=scroll.children[0];assert.equal(scroll.tabIndex,0);assert.equal(scroll.attrs.role,'region');
 assert.match(table.children[0].textContent,/USD/);
 assert.deepEqual(table.children[1].children[0].children.map(x=>x.scope),['col','col','col']);
 assert.deepEqual(table.children[2].children.map(r=>r.children.map(c=>c.textContent)),[['<Loss company>','$-20','≈ $100'],['Other company','$30','$200']]);
 assert.equal(table.children[2].children[0].children[0].scope,'row');details.events.toggle();assert.equal(details.children.length,2);
 assert.equal(vm.runInContext("appendScatterDataTable(parent,[],'earnings','Profit','USD')",ctx),undefined);
 assert.match(audit,/appendScatterDataTable\(stage,g\.points,scatterMetric,label,currency,/);
});

test('comparison interaction uses all observation positions and leaves unavailable endpoints blank',()=>{
 const h=harness();h.series.push({name:'Later index',color:'#456',format:v=>v+'%',difference:(a,b)=>(b-a)+'%',points:[{x:50,y:50,value:0,label:'Midpoint'},{x:100,y:20,value:20,label:'2 Nov 2026'}]});
 vm.runInContext('attachChartInteraction(svg,series,{left:0,right:100,top:0,bottom:100})',h.ctx);const tooltip=h.parent.children.find(n=>n.className==='chart-tooltip');
 h.svg.events.keydown({key:'Home',preventDefault(){}});assert.match(tooltip.innerHTML,/Later index<\/span><b>—<\/b>/);
 h.svg.events.keydown({key:'ArrowRight',preventDefault(){}});assert.match(tooltip.innerHTML,/Midpoint/);assert.match(tooltip.innerHTML,/0%/);assert.match(tooltip.innerHTML,/&lt;Company><\/span><b>—<\/b>/);
 h.svg.events.keydown({key:'Home',preventDefault(){}});h.svg.events.keydown({key:'End',shiftKey:true,preventDefault(){}});assert.match(tooltip.innerHTML,/Later index<\/span><b>—<\/b>/);
});

test('historical candle table preserves open/high/low/close and volume without inventing missing fields',()=>{
 const h=harness();h.series[0].formatPrice=v=>'₹'+v;Object.assign(h.series[0].points[0],{open:90,high:120,low:80,price:100,volume:12345});const details=vm.runInContext('appendChartDataTable(parent,series)',h.ctx);details.open=true;details.events.toggle();const table=details.children[1].children[0];assert.deepEqual(table.children[1].children[0].children.map(n=>n.textContent),['Date / time','Value','Open','High','Low','Close','Volume']);assert.deepEqual(table.children[2].children[0].children.map(n=>n.textContent),['1 Nov 2026','10%','₹90','₹120','₹80','₹100','12,345']);assert.equal(table.children[2].children[1].children.at(-1).textContent,'—');
});


test('price chart redraw restores focused plot without taking focus from external controls',async()=>{
 const ui=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8');
 const implementation=ui.slice(ui.indexOf('function restorePriceChartFocus('),ui.indexOf('const previousRenderCompare='));
 let calls=0,options;const canvas={isConnected:true,querySelector:()=>({focus(value){calls++;options=value}})},ctx=vm.createContext({canvas});
 vm.runInContext(implementation,ctx);vm.runInContext('restorePriceChartFocus(canvas,false)',ctx);assert.equal(calls,0);
 vm.runInContext('restorePriceChartFocus(canvas,true)',ctx);assert.equal(calls,1);assert.equal(options.preventScroll,true);
 canvas.isConnected=false;vm.runInContext('restorePriceChartFocus(canvas,true)',ctx);assert.equal(calls,1);
 assert.ok(ui.includes("const plotFocused=document.activeElement===canvas.querySelector('.price-history-chart')"));
 assert.ok(ui.includes('restorePriceChartFocus(canvas,plotFocused)'));
});


test('price-chart resize observers release replaced drawings and ignore queued stale callbacks',async()=>{
 const ui=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),observers=[];
 class FakeResizeObserver{constructor(callback){this.callback=callback;this.disconnected=false;observers.push(this)}observe(target){this.target=target}disconnect(){this.disconnected=true}}
 let draws=0;const canvas={isConnected:true},next={isConnected:true},ctx=vm.createContext({ResizeObserver:FakeResizeObserver,canvas,next,redraw:()=>draws++});
 vm.runInContext(ui.slice(ui.indexOf('let priceChartResizeObserver='),ui.indexOf('function restorePriceChartFocus(')),ctx);
 vm.runInContext('observePriceChartSize(canvas,redraw)',ctx);observers[0].callback();assert.equal(draws,1);
 vm.runInContext('observePriceChartSize(next,redraw)',ctx);assert.equal(observers[0].disconnected,true);observers[0].callback();assert.equal(draws,1);observers[1].callback();assert.equal(draws,2);
 next.isConnected=false;observers[1].callback();assert.equal(observers[1].disconnected,true);assert.equal(draws,2);assert.equal(vm.runInContext('priceChartResizeObserver',ctx),null);
 assert.match(ui,/function renderKiteHistoryValues[^]*?priceChartResizeObserver\?\.disconnect\(\);priceChartResizeObserver=null;/);
});


test('binary observation lookup matches exhaustive nearest search including endpoints, ties and sparse gaps',()=>{
 const ctx=vm.createContext({});vm.runInContext(source.slice(source.indexOf('function nearestChartObservation('),source.indexOf('function attachChartInteraction(')),ctx);
 for(const points of [[],[{x:7}],[{x:0},{x:2},{x:20}],Array.from({length:1606},(_,i)=>({x:i*i/100}))]){
  ctx.points=points;
  for(let x=-1;x<=26000;x+=37.5){ctx.x=x;const expected=points.length?points.reduce((a,p)=>Math.abs(p.x-x)<Math.abs(a.x-x)?p:a):null;assert.equal(vm.runInContext('nearestChartObservation(points,x)',ctx),expected)}
 }
 ctx.points=[{x:0},{x:10}];assert.equal(vm.runInContext('nearestChartObservation(points,5)',ctx).x,0);
 let reads=0;const points=Array.from({length:100000},(_,i)=>({get x(){reads++;return i}}));ctx.points=points;assert.equal(vm.runInContext('nearestChartObservation(points,50000.2)',ctx).x,50000);assert.ok(reads<30);
});


test('scatter redraw preserves the roving company and focused mark without stealing external focus',async()=>{
 const code=await readFile(new URL('./dist/chart-audit.js',import.meta.url),'utf8'),document={activeElement:null};let focused=null;
 const point=rank=>({dataset:{company:rank},matches:()=>true,setAttribute(key,value){this[key]=value},focus(options){focused=this;this.options=options}}),old=point('2'),first=point('1'),second=point('2');let points=[first,old];
 const stage={isConnected:true,contains:node=>points.includes(node),querySelector:()=>points.find(p=>p.tabindex==='0')||null,querySelectorAll:()=>points},ctx=vm.createContext({document,stage});vm.runInContext(code.slice(code.indexOf('function captureScatterKeyboardState('),code.indexOf('function renderAuditedScatter(')),ctx);
 document.activeElement=old;ctx.state=vm.runInContext('captureScatterKeyboardState(stage)',ctx);points=[first,second];vm.runInContext('restoreScatterKeyboardState(stage,state)',ctx);assert.equal(focused,second);assert.equal(second.tabindex,'0');assert.equal(first.tabindex,'-1');assert.equal(second.options.preventScroll,true);
 document.activeElement={};focused=null;ctx.state=vm.runInContext('captureScatterKeyboardState(stage)',ctx);points=[point('1'),point('2')];vm.runInContext('restoreScatterKeyboardState(stage,state)',ctx);assert.equal(focused,null);assert.equal(points[1].tabindex,'0');
 ctx.state={rank:'missing',focused:true};vm.runInContext('restoreScatterKeyboardState(stage,state)',ctx);assert.equal(focused,points[0]);
});


test('scatter data alternative restores open state and table focus/scroll when the plot redraws',async()=>{
 const code=await readFile(new URL('./dist/chart-audit.js',import.meta.url),'utf8');let focus;
 const table={scrollTop:120,scrollLeft:35,focus(options){focus={target:'table',options}}},summary={focus(options){focus={target:'summary',options}}},document={activeElement:table},details={open:true},stage={isConnected:true,contains:()=>true,querySelector:selector=>selector==='.chart-data-scroll'?table:selector==='summary'?summary:selector==='.chart-data-details'?details:null,querySelectorAll:()=>[]};
 const ctx=vm.createContext({document,stage});vm.runInContext(code.slice(code.indexOf('function captureScatterKeyboardState('),code.indexOf('function renderAuditedScatter(')),ctx);ctx.state=vm.runInContext('captureScatterKeyboardState(stage)',ctx);assert.equal(ctx.state.detailsOpen,true);assert.equal(ctx.state.detailFocus,'table');table.scrollTop=0;table.scrollLeft=0;vm.runInContext('restoreScatterKeyboardState(stage,state)',ctx);assert.equal(table.scrollTop,120);assert.equal(table.scrollLeft,35);assert.equal(focus.target,'table');assert.equal(focus.options.preventScroll,true);
 const h=harness();vm.runInContext(code.slice(code.indexOf('function appendScatterDataTable(')),h.ctx);h.ctx.amount=value=>'$'+value;
 const expanded=vm.runInContext("appendScatterDataTable(parent,[{name:'Test',cap:10,revenue:2}],'revenue','Revenue','USD',{open:true})",h.ctx);assert.equal(expanded.open,true);assert.equal(expanded.children.length,2);expanded.events.toggle();assert.equal(expanded.children.length,2);
});


test('line-chart data tables restore open state and per-company focus/scroll after redraw',()=>{
 const h=harness();const details=vm.runInContext('appendChartDataTable(parent,series,{open:true})',h.ctx);assert.equal(details.open,true);assert.equal(details.children.length,2);details.events.toggle();assert.equal(details.children.length,2);
 const regions=['A chart data','B chart data'].map(label=>({label,scrollTop:120,scrollLeft:40,getAttribute:()=>label,focus(options){this.focusOptions=options}})),summary={},parent={isConnected:true,querySelector:selector=>selector==='.chart-data-details'?{open:true,querySelector:()=>summary}:summary,querySelectorAll:()=>regions};h.ctx.parent=parent;h.ctx.document.activeElement=regions[1];h.ctx.state=vm.runInContext('captureChartDataState(parent)',h.ctx);regions.forEach(region=>{region.scrollTop=0;region.scrollLeft=0});vm.runInContext('restoreChartDataState(parent,state)',h.ctx);assert.equal(regions[1].scrollTop,120);assert.equal(regions[1].scrollLeft,40);assert.equal(regions[1].focusOptions.preventScroll,true);
 regions[1].focusOptions=null;h.ctx.document.activeElement={};h.ctx.state=vm.runInContext('captureChartDataState(parent)',h.ctx);vm.runInContext('restoreChartDataState(parent,state)',h.ctx);assert.equal(regions[1].focusOptions,null);
});
