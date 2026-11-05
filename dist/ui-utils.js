// Shared boundaries for saved preferences and HTML/CSV presentation.
function normalizePreference(value,fallback){
 if(value==null)return fallback;
 if(Array.isArray(fallback))return Array.isArray(value)?[...new Set(value.filter(item=>typeof item==='string'&&item.length<=160))]:fallback;
 if(fallback!==null&&typeof fallback!=='object')return typeof value===typeof fallback?value:fallback;
 if(fallback&&typeof fallback==='object')return typeof value==='object'&&!Array.isArray(value)?value:fallback;
 return value;
}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function csvCell(value){let text=String(value??'');if(typeof value==='string'&&/^\s*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}

// Compare native INR values only. A reconnect, exchange switch or initial quote establishes a new baseline.
function createQuotePulseTracker(){
 let previous=new Map();
 const direction=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&a!==b?(b>a?'up':'down'):null;
 return {observe(rows){const next=new Map(),changes=new Map();for(const s of rows){if(!s.liveSource)continue;const current={source:s.liveSource,symbol:s.liveSymbol,price:s.sourcePriceINR,cap:s.liveCapINR},old=previous.get(s.ticker);next.set(s.ticker,current);if(old&&old.source===current.source&&old.symbol===current.symbol){const price=direction(old.price,current.price),cap=direction(old.cap,current.cap);if(price||cap)changes.set(s.ticker,{price,cap})}}previous=next;return changes}};
}

function matchesListingScope(stock,scope,mode){
 if(scope==='All listings')return true;
 if(mode==='live')return stock.exchange===scope;
 const exchange=stock.liveSource||stock.quoteExchange;
 const indian=exchange==='NSE'||exchange==='BSE'||/\.(NS|BO)$/.test(stock.ticker);
 return scope==='Indian listings'?indian:scope==='Depositary receipts'?!indian:true;
}

function safeExternalURL(value,fallback=''){
 if(typeof value!=='string'||/[\u0000-\u0020\u007f]/.test(value))return fallback;
 try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:fallback}catch{return fallback}
}
function externalHref(value){return escapeHtml(safeExternalURL(value,'#about'))}

// Keep in-page chart navigation local and bring its controls into keyboard reach.
function navigateChartSection(section){
 if(!section)return;
 if(!section.hasAttribute('tabindex'))section.setAttribute('tabindex','-1');
 section.focus({preventScroll:true});
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 section.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
}

// Collapse typing bursts, respect input-method composition, and ignore removed views.
function bindDebouncedInput(input,update,delay=100){
 let timer,composing=false;
 const cancel=()=>clearTimeout(timer);
 const schedule=event=>{cancel();if(composing||event.isComposing)return;timer=setTimeout(()=>{if(input.isConnected)update(event)},delay)};
 input.oncompositionstart=()=>{composing=true;cancel()};
 input.oncompositionend=event=>{composing=false;schedule(event)};
 input.oninput=schedule;
}
