// One stable scrolling strip; quote updates replace values without restarting the animation.
let tickerMembers=[],tickerIndexQuotes=[],tickerSignature='',tickerProvider='';
let tickerStockQuotes=new Map(),tickerMovementVersion=0;const tickerMovements=new Map();
const tickerIndexNames=['NIFTY 50','SENSEX','NIFTY BANK','NIFTY NEXT 50','NIFTY IT','NIFTY MIDCAP 100','NIFTY SMLCAP 100'];
function shuffleTickerMembers(records,random=Math.random){
 const shuffled=records.slice();for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}return shuffled;
}
function tickerRows(){
 const byISIN=new Map();for(const stock of stocks)if(stock.isin)byISIN.set(stock.isin,stock);
 const indices=tickerIndexNames.map(symbol=>{const q=tickerIndexQuotes.find(q=>q.symbol===symbol);return {key:'index:'+symbol,label:symbol,price:q?.price??null,change:q?.change??null,index:true,asOf:q?.lastTrade||q?.receivedAt,source:q?.source}});
 const companies=tickerMembers.map(member=>{const stock=byISIN.get(member.isin),quote=tickerStockQuotes.get(member.isin),price=quote?.price??stock?.sourcePriceINR??stock?.referencePriceINR,change=quote?quote.change:stock?.change;return {key:member.isin,label:member.symbol,price:Number.isFinite(price)&&price>0?price:null,change:Number.isFinite(change)?change:null,index:false,ticker:stock?.ticker||member.symbol+'.NS',asOf:quote?.lastTrade||quote?.receivedAt||stock?.quoteAsOf,source:quote?(quote.source||tickerProvider):stock?.quoteSource,name:stock?.name||member.name}});
 return [...indices,...companies];
}
function updateTickerQuotes(payload){
 if(payload.status?.refreshFailed)return;
 const note=(key,previous,next)=>{if(tickerProvider&&tickerProvider!==payload.status?.provider)return;if(!previous||previous.exchange!==next.exchange||previous.symbol!==next.symbol||!Number.isFinite(previous.price)||!Number.isFinite(next.price)||next.price<=0||next.price===previous.price)return;tickerMovements.set(key,{direction:next.price>previous.price?'up':'down',version:++tickerMovementVersion})};
 const wanted=new Set(tickerMembers.map(member=>member.isin)),next=new Map();for(const quote of payload.quotes||[]){if(!wanted.has(quote.isin))continue;const old=next.get(quote.isin);if(!old||quote.exchange==='NSE'&&old.exchange!=='NSE')next.set(quote.isin,quote)}
 for(const [isin,quote]of next)note(isin,tickerStockQuotes.get(isin),quote);
 const indices=Array.isArray(payload.indices)?payload.indices:[];for(const quote of indices)note('index:'+quote.symbol,tickerIndexQuotes.find(old=>old.symbol===quote.symbol),quote);
 tickerStockQuotes=next;tickerIndexQuotes=indices;tickerProvider=payload.status?.provider||'Market data';
}
function pulseTickerPrice(price,movement){
 if(!movement||typeof price.animate!=='function'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const up=movement.direction==='up',color=up?'#168163':'#cf4055',background=up?'rgba(22,129,99,.16)':'rgba(207,64,85,.16)';
 price.animate([{color,textShadow:'0 0 8px '+color,backgroundColor:background},{color:'var(--ink)',textShadow:'0 0 0 transparent',backgroundColor:'transparent'}],{duration:1100,easing:'ease-out'});
}
function tickerQuoteText(row){
 const price=Number.isFinite(row.price)?(row.index?'':currency==='USD'?'$':'₹')+(row.price/(row.index||currency!=='USD'?1:fx)).toLocaleString(row.index||currency!=='USD'?'en-IN':'en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 const change=Number.isFinite(row.change)?(row.change>0?'▲ +':row.change<0?'▼ −':'')+Math.abs(row.change).toFixed(2)+'%':'—';
 return {price,change,direction:row.change>0?'positive':row.change<0?'negative':'',details:[row.name||row.label,row.index?'Index points':currency+' share price',row.source||'Price unavailable',row.asOf?new Date(row.asOf).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'}):''].filter(Boolean).join(' · ')};
}
function bindTickerDrag(holder){
 for(const selector of ['.ticker-window','.ticker-index-line']){const viewport=holder.querySelector(selector),track=selector==='.ticker-window'?holder.querySelector('.ticker-track'):null;let drag=null,suppressClick=false;
 const finish=event=>{if(!drag||event.pointerId!==drag.id)return;drag=null;holder.classList.remove('ticker-dragging');if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId)};
 viewport.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;suppressClick=false;const animation=track?.getAnimations()[0],duration=animation?.effect?.getComputedTiming().duration,width=holder.querySelector('.ticker-band').getBoundingClientRect().width;drag={id:event.pointerId,x:event.clientX,time:Number(animation?.currentTime)||0,animation,duration,width,left:viewport.scrollLeft};holder.classList.add('ticker-dragging');});
 viewport.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const delta=event.clientX-drag.x;if(!suppressClick&&Math.abs(delta)<=5)return;if(!suppressClick){suppressClick=true;if(!viewport.hasPointerCapture(event.pointerId))viewport.setPointerCapture(event.pointerId)}if(drag.animation&&drag.width>0&&Number.isFinite(drag.duration)&&drag.duration>0)drag.animation.currentTime=tickerDragTime(drag.time,delta,drag.width,drag.duration);else viewport.scrollLeft=drag.left-delta});
 // An uncommitted press leaving the strip must not leave its animation paused.
 viewport.addEventListener('pointerleave',event=>{if(drag&&!suppressClick)finish(event)});
 viewport.addEventListener('dragstart',event=>event.preventDefault());
 viewport.addEventListener('click',event=>{if(suppressClick&&event.detail!==0){event.preventDefault();event.stopPropagation();suppressClick=false}},true);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,finish);
 }
}
function tickerDragTime(start,delta,width,duration){const next=start-delta/width*duration;return ((next%duration)+duration)%duration}
function renderMarketTicker(){
 const holder=document.querySelector('#market-ticker');if(!holder||!tickerMembers.length)return;
 const rows=tickerRows(),signature=rows.map(r=>r.key).join('|');holder.hidden=false;
 if(signature!==tickerSignature){
  tickerSignature=signature;
  const item=(row,i,index=false)=>{const href=index?'#index/'+encodeURIComponent((row.label==='SENSEX'?'BSE:':'NSE:')+row.label):'#stock/'+encodeURIComponent(row.ticker)+'/price';return '<span role="listitem"><a class="'+(index?'ticker-index-item':'ticker-item')+'" href="'+href+'" data-ticker-row="'+i+'"><span class="ticker-symbol">'+escapeHtml(row.label)+'</span><span class="ticker-values"><b class="ticker-price"></b><span class="ticker-change"></span></span></a></span>'};
  const indices=rows.slice(0,tickerIndexNames.length).map((r,i)=>item(r,i,true)).join(''),items=rows.slice(tickerIndexNames.length).map((r,i)=>item(r,i+tickerIndexNames.length)).join('');
  holder.innerHTML='<div class="ticker-index-line" tabindex="0" role="list" aria-label="Indian indices, in points. Drag or scroll for more.">'+indices+'</div><div class="ticker-stock-line"><span class="ticker-kicker">NIFTY 50<small class="ticker-currency-label">STOCKS · '+currency+'</small></span><div class="ticker-window" tabindex="0" role="region" aria-label="Nifty 50 stock prices in shuffled order. Drag to browse, hover or focus to pause."><div class="ticker-track" style="--ticker-duration:'+Math.max(60,tickerMembers.length*4)+'s"><div class="ticker-band" role="list" aria-label="Nifty 50 prices">'+items+'</div><div class="ticker-band ticker-copy" aria-hidden="true" inert>'+items+'</div></div></div></div>';
  bindTickerDrag(holder);
 }
 const unit=holder.querySelector('.ticker-currency-label');if(unit&&unit.textContent!=='STOCKS · '+currency)unit.textContent='STOCKS · '+currency;
 holder.querySelectorAll('[data-ticker-row]').forEach(item=>{const row=rows[Number(item.dataset.tickerRow)],value=tickerQuoteText(row);if(item.title!==value.details)item.title=value.details;const price=item.querySelector('.ticker-price');if(price.textContent!==value.price)price.textContent=value.price;const movement=tickerMovements.get(row.key);if(movement&&item.dataset.pulseVersion!==String(movement.version)){item.dataset.pulseVersion=String(movement.version);pulseTickerPrice(price,movement)}const change=item.querySelector('.ticker-change');if(change.textContent!==value.change)change.textContent=value.change;if(change.className!=='ticker-change '+value.direction)change.className='ticker-change '+value.direction});
 preserveTickerItemWidths(holder);
}
const tickerPreviousRender=render;render=function(){tickerPreviousRender();renderMarketTicker()};
const tickerPreviousApplyQuotes=applyKiteQuotes;applyKiteQuotes=function(payload){updateTickerQuotes(payload);tickerPreviousApplyQuotes(payload);renderMarketTicker()};
const tickerPreviousReadFeed=readFeed;readFeed=async function(){const payload=await tickerPreviousReadFeed();updateTickerQuotes(payload);renderMarketTicker();if(tab==='index'){const id=indexRouteIdentity(location.hash),index=indexInstrument(id);if(index){const level=document.querySelector('[data-index-level]'),change=document.querySelector('[data-index-change]');if(level)level.textContent=indexLevel(index.price);if(change)change.innerHTML=changeBadge(index)}}return payload};
fetch('nifty50.json',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(!Array.isArray(data.records)||data.records.length!==50||data.records.some(r=>!/^IN[A-Z0-9]{10}$/.test(r.isin)||typeof r.symbol!=='string'))throw Error();tickerMembers=shuffleTickerMembers(data.records);renderMarketTicker()}).catch(()=>{const holder=document.querySelector('#market-ticker');if(holder)holder.hidden=true});

function indexInstrument(id){const symbol=String(id).replace(/^(NSE|BSE):/,'');if(!tickerIndexNames.includes(symbol)||(symbol==='SENSEX'?'BSE:':'NSE:')+symbol!==id)return null;const quote=tickerIndexQuotes.find(q=>q.symbol===symbol);return {ticker:'INDEX:'+id,historyIndex:id,name:symbol,isIndex:true,price:quote?.price??null,change:quote?.change??null,instrumentToken:quote?.instrumentToken,lastTrade:quote?.lastTrade}}
function comparisonCandidates(){return [...tickerIndexNames.map(name=>indexInstrument((name==='SENSEX'?'BSE:':'NSE:')+name)),...stocks]}
function indexLevel(value){return Number.isFinite(value)?value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})+' pts':'—'}
const tickerStockPrice=stockPrice;stockPrice=function(s){return s.isIndex?indexLevel(s.price):tickerStockPrice(s)};
function renderIndexPage(id){const index=indexInstrument(id);tab='index';document.body.classList.add('stock-view');document.querySelectorAll('[data-tab]').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current')});$('#export').hidden=true;$('#section-title').textContent=index?.name||'Index not found';if(!index){$('#content').innerHTML='<section class="card"><h2>Index not found</h2><a href="#rankings">Back to rankings</a></section>';return}$('#content').innerHTML='<div class="stock-breadcrumb"><a href="#rankings">← Rankings</a></div><section class="stock-header"><h1>'+escapeHtml(index.name)+'</h1><p>Index level · points</p><div class="index-overview"><div class="index-quote"><strong data-index-level>'+indexLevel(index.price)+'</strong> <span data-index-change>'+changeBadge(index)+'</span></div><div class="index-actions"><button id="compare-index">'+(compare.includes(index.ticker)?'Remove from comparison':'Add to comparison')+'</button> <a href="#compare">Open comparison →</a></div></div></section><section class="card stock-chart-card"></section>';$('#compare-index').onclick=()=>{if(compare.includes(index.ticker))compare=compare.filter(t=>t!==index.ticker);else{if(compare.length>=4){toast('Remove an item from comparison before adding another.');return}compare.push(index.ticker)}save('isv-compare',compare);renderIndexPage(id)};if(!STATIC_PREVIEW)loadKiteComparison([index],kiteStockRange,document.querySelector('.stock-chart-card'));else document.querySelector('.stock-chart-card').innerHTML='<p>Connect the local Zerodha backend to load index history.</p>'}

// Measure the former typography once, so larger text never widens the stock strip.
function preserveTickerItemWidths(holder){
 const items=[...holder.querySelectorAll('.ticker-item[data-ticker-row]')],groups=new Map(),widths=new Map();
 for(const item of items){const fixed=item.style.getPropertyValue('--ticker-item-width');if(fixed)widths.set(item.dataset.tickerRow,parseFloat(fixed));else{const key=item.dataset.tickerRow;if(!groups.has(key))groups.set(key,{items:[]});groups.get(key).items.push(item)}}
 // Write all probes first, read all geometry next, then remove/apply in one batch.
 for(const [key,group]of groups){if(widths.has(key))continue;const item=group.items[0],copy=item.cloneNode(true);copy.removeAttribute('data-ticker-row');copy.removeAttribute('href');copy.setAttribute('aria-hidden','true');Object.assign(copy.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:'max-content',maxWidth:'none',flexDirection:'row',alignItems:'center',gap:'var(--ticker-old-gap,7px)'});const symbol=copy.querySelector('.ticker-symbol');symbol.style.fontSize='9px';symbol.style.flex='0 1 auto';symbol.style.width='auto';symbol.style.maxWidth='91px';copy.querySelector('.ticker-price').style.fontSize='10px';copy.querySelector('.ticker-price').style.minWidth='var(--ticker-old-price-min,54px)';copy.querySelector('.ticker-change').style.fontSize='9px';copy.querySelector('.ticker-change').style.minWidth='var(--ticker-old-change-min,53px)';item.parentElement.append(copy);group.probe=copy}
 for(const [key,group]of groups)if(group.probe)widths.set(key,group.probe.getBoundingClientRect().width);
 for(const group of groups.values())group.probe?.remove();
 for(const [key,group]of groups){const width=widths.get(key);if(width>0)for(const item of group.items)item.style.setProperty('--ticker-item-width',width+'px')}
}

function indexRouteIdentity(hash){try{return decodeURIComponent(String(hash).replace(/^#index\//,''))}catch{return ''}}
