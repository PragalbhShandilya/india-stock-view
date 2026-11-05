import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const context=vm.createContext({URL});
const requireUtils=await readFile(new URL('./dist/ui-utils.js',import.meta.url),'utf8');
vm.runInContext(requireUtils,context);
test('invalid stored preference types fall back rather than breaking application startup',()=>{
 assert.equal(vm.runInContext("normalizePreference('true',false)",context),false);
 assert.equal(vm.runInContext("normalizePreference({},'USD')",context),'USD');
 assert.equal(vm.runInContext("normalizePreference(null,'USD')",context),'USD');
 assert.equal(vm.runInContext("normalizePreference({},[]).length",context),0);
 assert.equal(vm.runInContext("normalizePreference(['A',{},'A',null,'B'],[]).join(',')",context),'A,B');
});
test('HTML output escapes quotes and markup while preserving the original displayed text',()=>{
 context.value='A&B "<img src=x onerror=alert(1)>"';
 assert.equal(vm.runInContext('escapeHtml(value)',context),'A&amp;B &quot;&lt;img src=x onerror=alert(1)&gt;&quot;');
 assert.equal(vm.runInContext('escapeHtml(null)',context),'');
});
test('CSV exports neutralize text formulas but keep numeric values and quoted names intact',()=>{
 for(const input of ['=1+1','+SUM(A1:A2)','  @IMPORTXML("url")','-HYPERLINK("url")']){context.input=input;assert.ok(vm.runInContext('csvCell(input)',context).startsWith('"\''));}
 context.input=-12.5;assert.equal(vm.runInContext('csvCell(input)',context),'"-12.5"');
 context.input='A "quoted", company';assert.equal(vm.runInContext('csvCell(input)',context),'"A ""quoted"", company"');
});

test('initial data failure clears the busy state and provides a working retry action',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),start=app.indexOf('let sourceLoadInFlight='),end=app.indexOf('\nif(document.readyState',start),content={innerHTML:'',busy:false,setAttribute(){this.busy=true},removeAttribute(){this.busy=false}},retry={};
 let fail=true,renders=0;const ctx=vm.createContext({db:null,AbortSignal,fetch:async name=>{if(fail)throw Error('offline');return {ok:true,json:async()=>name==='data.json'?{stocks:[{name:'Test',ticker:'TEST.NS'}]}:name==='instruments.json'?{listings:[]}:{records:[]}}},$:selector=>selector==='#content'?content:selector==='#data-availability'?null:retry,attachIPOListings:v=>v,attachOfficialShares:v=>v,mergeRankingUniverse:()=>[],canonicalSavedTickers:(_,v)=>v,watch:new Set(),initLive(){},render(){renders++},compare:[],getSector:()=>''});
 vm.runInContext(await readFile(new URL('./dist/data-loader.js',import.meta.url),'utf8'),ctx);vm.runInContext(app.slice(start,end),ctx);await vm.runInContext('loadWebsiteData()',ctx);assert.equal(content.busy,false);assert.match(content.innerHTML,/Try again/);assert.equal(typeof retry.onclick,'function');
 fail=false;await retry.onclick();assert.equal(content.busy,false);assert.equal(renders,1);
});

test('quote pulses follow native movements, never initial values, display FX or source switches',()=>{
 const ctx=vm.createContext({});vm.runInContext(requireUtils,ctx);
 const observe=vm.runInContext('createQuotePulseTracker().observe',ctx);
 const row=(price,cap,extra={})=>({ticker:'A',liveSource:'NSE',liveSymbol:'A',sourcePriceINR:price,liveCapINR:cap,...extra});
 assert.equal(observe([row(100,1000)]).size,0);
 assert.equal(observe([row(100,1000,{price:1.1,cap:.0001})]).size,0);
 assert.equal(observe([row(101,1010)]).get('A').price,'up');
 assert.equal(observe([row(99,990)]).get('A').cap,'down');
 assert.equal(observe([row(null,null)]).size,0);
 assert.equal(observe([row(102,1020)]).size,0);
 assert.equal(observe([row(103,1030,{liveSource:'BSE'})]).size,0);
 assert.equal(observe([row(104,1040,{liveSource:null})]).size,0);
 assert.equal(observe([row(105,1050)]).size,0);
});

test('feed failure preserves provider identity and cannot leave a stale Live label',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),kite=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8');
 const readStart=app.indexOf('async function readFeed(){'),readEnd=app.indexOf('\n',readStart),labelStart=kite.indexOf('function kiteTopStatus(){'),labelEnd=kite.indexOf('\n',labelStart);
 const ctx=vm.createContext({STATIC_PREVIEW:false,feedReadInFlight:null,AbortSignal,fetch:async()=>{throw Error('offline')},feedMode:'kite',feedStatus:{configured:true},stocks:[{lastTrade:new Date().toISOString()}],marketSession:()=>({state:'open'})});
 vm.runInContext(await readFile(new URL('./dist/market-updates.js',import.meta.url),'utf8'),ctx);vm.runInContext('const marketUpdateStore=createMarketDeltaStore();',ctx);vm.runInContext(app.slice(readStart,readEnd)+'\n'+kite.slice(labelStart,labelEnd),ctx);
 const payload=await vm.runInContext('readFeed()',ctx);assert.equal(payload.status.provider,'Zerodha Kite');assert.equal(payload.status.authenticated,false);ctx.feedStatus=payload.status;
 assert.equal(vm.runInContext('kiteTopStatus()',ctx),new Date(ctx.stocks[0].lastTrade).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}));
 ctx.feedStatus={authenticated:true,received:1,connections:3};assert.equal(vm.runInContext('kiteTopStatus()',ctx),'Live · Zerodha');ctx.feedStatus.received=0;assert.ok(!vm.runInContext('kiteTopStatus()',ctx).startsWith('Live'));
});

test('listing filters follow actual exchange quote identity while preserving unmatched overseas receipts',()=>{
 const match=(stock,scope,mode='kite')=>{context.stock=stock;context.scope=scope;context.mode=mode;return vm.runInContext('matchesListingScope(stock,scope,mode)',context)};
 assert.equal(match({ticker:'HDB',liveSource:'NSE'},'Indian listings'),true);
 assert.equal(match({ticker:'HDB',quoteExchange:'NSE'},'Depositary receipts','snapshot'),false);
 assert.equal(match({ticker:'HDB'},'Depositary receipts','snapshot'),true);
 assert.equal(match({ticker:'NSE.BO',liveSource:'BSE'},'Indian listings'),true);
 assert.equal(match({ticker:'TEST',exchange:'BSE'},'BSE','live'),true);
 assert.equal(match({ticker:'TEST',exchange:'BSE'},'NSE','live'),false);
});

test('unavailable browser storage falls back safely and reports an unsaved preference without crashing',async()=>{
 const app=await readFile(new URL('./dist/app.js',import.meta.url),'utf8'),line=app.split('\n').find(line=>line.startsWith('function read(k,d)'));
 const messages=[],ctx=vm.createContext({localStorage:{getItem(){throw Error('denied')},setItem(){throw Error('quota')}},toast:message=>messages.push(message)});
 vm.runInContext(requireUtils+'\n'+line,ctx);
 assert.equal(vm.runInContext("read('isv-currency','USD')",ctx),'USD');
 assert.doesNotThrow(()=>vm.runInContext("save('isv-watch',['TEST.NS'])",ctx));
 assert.equal(messages.length,1);assert.match(messages[0],/could not save/);
});

test('external links reject executable, local, credential-bearing and control-character URLs',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,hi','file:///etc/passwd','http://example.com','https://user:secret@example.com','https://example.com\n/path','//example.com','not a URL']){context.value=value;assert.equal(vm.runInContext("safeExternalURL(value,'#about')",context),'#about')}
 context.value='https://example.com/path?q="<bad>&x=1';const href=vm.runInContext('externalHref(value)',context);assert.ok(href.startsWith('https://'));assert.ok(!href.includes('"'));assert.ok(!href.includes('<'));assert.ok(href.includes('&amp;'));
 context.value='https://nsearchives.nseindia.com/content/circulars/CML73700.pdf';assert.equal(vm.runInContext('safeExternalURL(value)',context),context.value);
});

test('future and invalid trade timestamps cannot report Live',async()=>{
 const kite=await readFile(new URL('./dist/kite-ui.js',import.meta.url),'utf8'),start=kite.indexOf('function kiteTopStatus(){'),end=kite.indexOf('\n',start),ctx=vm.createContext({stocks:[{lastTrade:new Date(Date.now()+3600000).toISOString()},{lastTrade:'invalid'}],feedStatus:{authenticated:true,connections:3,received:1},marketSession:()=>({state:'open'})});vm.runInContext(kite.slice(start,end),ctx);assert.ok(!vm.runInContext('kiteTopStatus()',ctx).startsWith('Live'));ctx.stocks=[{lastTrade:'invalid'},{lastTrade:new Date().toISOString()}];assert.equal(vm.runInContext('kiteTopStatus()',ctx),'Live · Zerodha');ctx.stocks=[{lastTrade:'invalid'}];assert.ok(!vm.runInContext('kiteTopStatus()',ctx).includes('Invalid Date'));
});

test('chart shortcuts move focus before scrolling and respect reduced motion without adding a tab stop',async()=>{
 const source=await readFile(new URL('./dist/ui-utils.js',import.meta.url),'utf8');for(const reduced of [false,true]){const events=[],attrs=new Map(),section={hasAttribute:key=>attrs.has(key),setAttribute:(key,value)=>attrs.set(key,value),focus(options){events.push(['focus',options.preventScroll])},scrollIntoView(options){events.push(['scroll',options.behavior,options.block])}},ctx=vm.createContext({window:{matchMedia:()=>({matches:reduced})},section});vm.runInContext(source,ctx);vm.runInContext('navigateChartSection(section)',ctx);assert.deepEqual(events,[['focus',true],['scroll',reduced?'auto':'smooth','start']]);assert.equal(attrs.get('tabindex'),'-1');attrs.set('tabindex','0');vm.runInContext('navigateChartSection(section)',ctx);assert.equal(attrs.get('tabindex'),'0');vm.runInContext('navigateChartSection(null)',ctx)}
});

test('debounced input coalesces bursts, waits for composition, and ignores detached views',()=>{
 let next=0;const timers=new Map(),ctx=vm.createContext({setTimeout:fn=>{timers.set(++next,fn);return next},clearTimeout:id=>timers.delete(id)});vm.runInContext(requireUtils,ctx);
 const input={isConnected:true},updates=[];ctx.input=input;ctx.update=e=>updates.push(e.value);vm.runInContext('bindDebouncedInput(input,update)',ctx);
 const flush=()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())};
 input.oninput({value:'r'});input.oninput({value:'re'});input.oninput({value:'rel'});assert.equal(timers.size,1);flush();assert.deepEqual(updates,['rel']);
 input.oncompositionstart();input.oninput({value:'composing',isComposing:true});assert.equal(timers.size,0);input.oncompositionend({value:'complete'});flush();assert.deepEqual(updates,['rel','complete']);
 input.oninput({value:'obsolete'});input.isConnected=false;flush();assert.deepEqual(updates,['rel','complete']);
});


test('light and dark small-text palettes meet 4.5:1 contrast across standard surfaces',async()=>{
 const css=await readFile(new URL('./dist/style.css',import.meta.url),'utf8');
 const luminance=hex=>{const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)};
 const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 const palette=selector=>{const tokens={};for(const match of css.replace(/\/\*[^]*?\*\//g,'').replace(/@import[^;]*;/g,'').matchAll(/([^{}]+)\{([^{}]*)\}/g)){if(match[1].trim()!==selector)continue;for(const token of match[2].matchAll(/(--[a-z-]+):(#(?:[a-f0-9]{6}|fff))(?=;|$)/gi))tokens[token[1]]=token[2]==='#fff'?'#ffffff':token[2]}return tokens};
 for(const selector of [':root','body.dark']){const colors=palette(selector);for(const text of ['--ink','--muted','--up','--down'])for(const surface of ['--panel','--bg','--tint'])assert.ok(contrast(colors[text],colors[surface])>=4.5,selector+' '+text+' on '+surface)}
 assert.ok(contrast('#616b78','#f7f8fa')>=4.5);assert.ok(contrast('#a7b4c8','#122035')>=4.5);
 assert.ok(!css.includes('color:#62799b'));
});
