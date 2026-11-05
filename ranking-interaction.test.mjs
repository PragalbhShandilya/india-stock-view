import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8');
const source=app.slice(app.indexOf('function captureRankingInteraction(){'),app.indexOf('function announceRanking('));
function harness(){
 const table={scrollLeft:190,scrollTop:120,getBoundingClientRect:()=>({left:10,right:370}),querySelector:()=>({getBoundingClientRect:()=>({right:210})})};
 const content={contains:()=>true},nodes=new Map([['.ranking-table',table],['#content',content]]),document={activeElement:null,querySelectorAll:()=>[]};
 const context=vm.createContext({document,CSS:{escape:v=>v},$:key=>nodes.get(key)});vm.runInContext(source,context);
 const control=(attribute,value,index=4)=>({id:'',isConnected:true,hasAttribute:key=>key===attribute,getAttribute:key=>key===attribute?value:null,closest:()=>({cellIndex:index}),getBoundingClientRect:()=>({left:400-table.scrollLeft,right:428-table.scrollLeft}),focus(options){this.focusOptions=options;document.activeElement=this}});
 return {table,document,nodes,context,control,capture:()=>vm.runInContext('captureRankingInteraction()',context),restore(state,keep=false){context.state=state;vm.runInContext('restoreRankingInteraction(state,'+keep+')',context)}};
}
test('ranking rebuild restores the equivalent sort control without losing horizontal position or scrolling the page',()=>{
 const h=harness(),old=h.control('data-sort-column','column:ps');h.document.activeElement=old;const state=h.capture();old.isConnected=false;const next=h.control('data-sort-column','column:ps');h.nodes.set('[data-sort-column="column:ps"]',next);h.table.scrollLeft=0;h.restore(state);assert.equal(h.document.activeElement,next);assert.equal(next.focusOptions.preventScroll,true);assert.equal(h.table.scrollLeft,182);assert.ok(next.getBoundingClientRect().left>=218);
});
test('removing a focused column falls back to a surviving removal control and finally permanent market-cap sort',()=>{
 const h=harness(),old=h.control('data-remove-metric','ps'),revenue=h.control('data-remove-metric','revenue');h.document.activeElement=old;h.document.querySelectorAll=()=>[revenue,old];const state=h.capture();old.isConnected=false;h.document.querySelectorAll=()=>[revenue];h.restore(state,true);assert.equal(h.document.activeElement,revenue);assert.equal(h.table.scrollTop,120);
 const cap=h.control('data-sort-column','metric');h.document.querySelectorAll=()=>[];h.nodes.set('[data-sort-column="metric"]',cap);h.restore(state);assert.equal(h.document.activeElement,cap);
});

test('unmatched legacy source identities remain searchable but cannot receive current ranks',async()=>{
 const rank=await readFile(new URL('./dist/rank-movement.js',import.meta.url),'utf8');
 const rows=[{ticker:'LEGACY.NS',name:'Legacy Company',isin:null,rank:1,cap:500},{ticker:'CURRENT.NS',name:'Current Company',isin:'INE000000001',rank:2,cap:100},{ticker:'MISSING.NS',name:'Missing Company',isin:'INE000000002',rank:3,cap:null}];
 const ctx=vm.createContext({rows,stocks:rows,tab:'rankings',rankingListingScope:'all',query:'',sector:'All sectors',listing:'All listings',feedMode:'kite',sortColumn:'metric',sortAsc:false,metric:'cap',watch:new Set(),compare:[],rankSortMap:{},stockTickerLabel:s=>s.ticker,matchesListingScope:()=>true});
 vm.runInContext(rank,ctx);const state=vm.runInContext("buildRankState(null,rows,'cap',false,'2026-11-03')",ctx);ctx.state=state;ctx.stock=rows[0];
 assert.deepEqual({...state.current.ranks},{'CURRENT.NS':1});assert.match(vm.runInContext('rankMovementBadge(stock,state)',ctx),/identity is unverified/);
 vm.runInContext(app.slice(app.indexOf('function chosen(){'),app.indexOf('\nlet rankSortMap=')),ctx);
 assert.deepEqual(Array.from(vm.runInContext('chosen().map(s=>s.ticker)',ctx)),['CURRENT.NS','MISSING.NS','LEGACY.NS']);
 ctx.query='legacy';assert.equal(vm.runInContext('chosen()[0].ticker',ctx),'LEGACY.NS');
 ctx.query='';ctx.sortColumn='name';ctx.sortAsc=true;assert.equal(vm.runInContext('chosen().length',ctx),3);
 const company=await readFile(new URL('./dist/company-page.js',import.meta.url),'utf8');vm.runInContext(company.slice(company.indexOf('function companyRank('),company.indexOf('\nfunction renderStockPage(')),ctx);assert.equal(vm.runInContext('companyRank(rows[0])',ctx),null);assert.equal(vm.runInContext('companyRank(rows[1])',ctx),1);
 assert.match(app,/isv-rank-history:v3:/);assert.match(app,/Identity unverified/);
});

test('trend sort calculates each eligible return once and keeps missing values last in both directions',()=>{
 const rows=Array.from({length:5500},(_,i)=>({ticker:'S'+i,name:'Company '+i,isin:'ISIN'+i,rank:i+1,trend:i===0?null:Math.sin(i)}));
 let calls=0;const ctx=vm.createContext({stocks:rows,tab:'rankings',rankingListingScope:'all',query:'',sector:'All sectors',listing:'All listings',feedMode:'kite',sortColumn:'trend',sortAsc:false,metric:'cap',watch:new Set(),compare:[],rankSortMap:{},stockTickerLabel:s=>s.ticker,matchesListingScope:()=>true,zerodhaTrendReturn:s=>{calls++;return s.trend}});
 vm.runInContext(app.slice(app.indexOf('function chosen(){'),app.indexOf('\nlet rankSortMap=')),ctx);
 for(const ascending of [false,true]){calls=0;ctx.sortAsc=ascending;const sorted=vm.runInContext('chosen()',ctx);assert.equal(calls,rows.length);assert.equal(sorted.at(-1).ticker,'S0');for(let i=1;i<sorted.length-1;i++)assert.ok(ascending?sorted[i-1].trend<=sorted[i].trend:sorted[i-1].trend>=sorted[i].trend)}
});

test('company metric navigation preserves page/strip position and keyboard focus without affecting new-company navigation',()=>{
 let focused=false,target=0;const nextLink={getAttribute:()=> '#stock/TEST.NS/revenue',focus(options){focused=options.preventScroll}},tabs={scrollLeft:85,querySelector:()=>({getAttribute:()=> '#stock/TEST.NS/price'}),querySelectorAll:()=>[nextLink],contains:()=>true};
 const ctx=vm.createContext({tab:'stock',routeScrollHint:{to:'#stock/TEST.NS/revenue',top:260},location:{hash:'#stock/TEST.NS/revenue'},rankingViewStates:new Map(),rankingViewSignature:()=>'',page:1,document:{activeElement:{}},$:selector=>selector==='.stock-tabs'?tabs:null,window:{scrollY:0,scrollTo(options){target=options.top}},render(){tabs.scrollLeft=0}});
 vm.runInContext(app.slice(app.indexOf('function handleRouteChange(){'),app.indexOf('\ndocument.body.classList.add',app.indexOf('function handleRouteChange(){'))),ctx);vm.runInContext('handleRouteChange()',ctx);assert.equal(target,260);assert.equal(tabs.scrollLeft,85);assert.equal(focused,true);
 ctx.location.hash='#stock/OTHER.NS/price';vm.runInContext('handleRouteChange()',ctx);assert.equal(target,0);
});

test('opening a company focuses its heading and returning restores the original ranking control and offsets',()=>{
 const state=new Map(),table={scrollTop:120,scrollLeft:75},heading={matches:()=>true,setAttribute(k,v){this[k]=v},focus(options){this.focusOptions=options}},button={focus(options){this.focusOptions=options}};
 const ctx=vm.createContext({tab:'rankings',location:{hash:'#stock/TEST.NS/price'},routeScrollHint:{from:'',to:'#stock/TEST.NS/price',top:350},rankingViewStates:state,rankingViewSignature:()=> 'filters',captureRankingInteraction:()=>({selector:'[data-company="1"]'}),page:2,document:{activeElement:button},$:selector=>selector==='.ranking-table'?table:selector==='#content h1'?heading:selector==='[data-company="1"]'?button:null,window:{scrollY:0,scrollTo(){}},render(){}});
 vm.runInContext(app.slice(app.indexOf('function handleRouteChange(){'),app.indexOf('\ndocument.body.classList.add',app.indexOf('function handleRouteChange(){'))),ctx);vm.runInContext('handleRouteChange()',ctx);assert.equal(heading.tabindex,'-1');assert.equal(heading.focusOptions.preventScroll,true);assert.equal(state.get('rankings').focus,'[data-company="1"]');assert.equal(state.get('rankings').top,350);
 ctx.tab='stock';ctx.location.hash='#rankings';table.scrollTop=0;table.scrollLeft=0;vm.runInContext('handleRouteChange()',ctx);assert.equal(button.focusOptions.preventScroll,true);assert.equal(table.scrollTop,120);assert.equal(table.scrollLeft,75);assert.equal(ctx.page,2);
});

test('popstate restores the displayed route once and the following hashchange does not render it twice',()=>{
 const handlers={},ctx=vm.createContext({renderedRoute:'#stock/TEST.NS/price',location:{hash:'#rankings'},window:{addEventListener:(type,fn)=>handlers[type]=fn},calls:0});
 vm.runInContext('function handleRouteChange(){calls++;renderedRoute=location.hash}',ctx);
 const start=app.indexOf('const routeEvent=');vm.runInContext(app.slice(start,app.indexOf("$('#export').onclick",start)),ctx);handlers.popstate();ctx.window.onhashchange();assert.equal(ctx.calls,1);ctx.location.hash='#compare';ctx.window.onhashchange();assert.equal(ctx.calls,2);
});

test('partial-source loading cannot persist rank movement or replace the last complete comparison',async()=>{
 const writes=[],stored=new Map(),rows=[{ticker:'A',isin:'A',rank:1,cap:100},{ticker:'B',isin:'B',rank:2,cap:50}],ctx=vm.createContext({metric:'cap',feedMode:'snapshot',stocks:rows,sourceSupportingPending:false,sourceLoadWarnings:[],Date,read:(key,fallback)=>stored.get(key)||fallback,save:(key,value)=>{writes.push(value);stored.set(key,value)}});
 vm.runInContext(await readFile(new URL('./dist/rank-movement.js',import.meta.url),'utf8'),ctx);vm.runInContext(app.slice(app.indexOf('function currentRankingState(){'),app.indexOf('\nfunction renderRows(){')),ctx);
 const initial=vm.runInContext('currentRankingState()',ctx);assert.equal(writes.length,1);assert.equal(initial.current.ranks.A,1);
 ctx.sourceSupportingPending=true;rows[1].cap=200;const partial=vm.runInContext('currentRankingState()',ctx);assert.equal(partial.current.ranks.B,1);assert.equal(partial.provisional,true);assert.equal(partial.previous,null);assert.equal(writes.length,1);
 rows[0].cap=300;ctx.sourceSupportingPending=false;const complete=vm.runInContext('currentRankingState()',ctx);assert.equal(writes.length,2);assert.equal(complete.current.ranks.A,1);assert.equal(complete.previous.ranks.A,1);ctx.state=complete;ctx.stock=rows[0];assert.ok(!vm.runInContext('rankMovementBadge(stock,state)',ctx).includes('rank-shift'));
 ctx.sourceLoadWarnings=['Official share counts'];rows[1].cap=400;const failedSource=vm.runInContext('currentRankingState()',ctx);assert.equal(failedSource.provisional,true);assert.equal(writes.length,2);ctx.sourceLoadWarnings=[];const marketChange=vm.runInContext('currentRankingState()',ctx);ctx.state=marketChange;ctx.stock=rows[1];assert.match(vm.runInContext('rankMovementBadge(stock,state)',ctx),/▲ 1/);
});


test('pagination announces the rendered range, focuses the table and respects reduced motion',()=>{
 const source=app.slice(app.indexOf('function changeRankingPage('),app.indexOf('function bindCompanies'));
 for(const reduced of [false,true]){
  let scroll,focus,announcement;
  const ctx=vm.createContext({page:1,PAGE_SIZE:100,renderRows(){ctx.page=Math.min(ctx.page,3)},chosen:()=>Array(245),$:()=>({scrollIntoView(options){scroll=options}}),window:{matchMedia:()=>({matches:reduced})},document:{querySelector:()=>({focus(options){focus=options}})},announceRanking:message=>announcement=message});
  vm.runInContext(source,ctx);vm.runInContext('changeRankingPage(9)',ctx);
  assert.equal(ctx.page,3);assert.equal(scroll.behavior,reduced?'auto':'smooth');assert.equal(focus.preventScroll,true);assert.equal(announcement,'Page 3. Showing 201–245 of 245 companies.');
 }
 assert.ok(app.includes('aria-label="Page ${n}"'));assert.ok(app.includes('aria-current="page"'));
});
