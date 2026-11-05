metrics.turnover='Traded value';
const previousAmount=amount;amount=function(n,kind='cap'){if(kind==='turnover')return n==null?'—':currency==='INR'?formatINR(n):formatUSD(n/fx);if(feedMode==='kite'&&kind==='price')return n==null?'—':currency==='INR'?formatINR(n,false):formatUSD(n/fx);return previousAmount(n,kind)};
const previousStockPrice=stockPrice;stockPrice=function(s){return feedMode==='kite'?amount(s.price,'price'):previousStockPrice(s)};
const quotePulseTracker=createQuotePulseTracker();
let pendingQuotePulses=new Map();
function applyKiteQuotes(payload){const baselines=new Map(snapshotStocks.map(s=>[s.ticker,s]));const byISIN=new Map();for(const q of payload.quotes){if(!byISIN.has(q.isin))byISIN.set(q.isin,[]);byISIN.get(q.isin).push(q)}for(const s of stocks){const match=selectLatestKiteQuote(byISIN.get(s.isin)||[]),baseline=baselines.get(s.ticker)||baselines.get(s.sourceTicker);s.cap=baseline?.cap??null;s.liveCapEstimated=false;s.liveCapINR=null;s.liveCapBasis='Dated financial-source market cap';s.shares=s.verifiedSharesOutstanding??baseline?.shares??null;s.price=match?.price??s.referencePriceINR??null;s.change=match?.change??null;s.volume=match?.volume??null;s.averagePriceINR=match?.averagePrice??null;s.turnover=match?.turnover??null;s.lastTrade=match?.lastTrade||null;s.instrumentToken=match?.instrumentToken||null;s.liveSource=match?match.exchange:null;s.liveSymbol=match?.symbol||null;s.quoteSource=match?'Zerodha Kite':s.referenceQuote?.source||null;s.quoteAsOf=match?.lastTrade||s.referenceQuote?.at||s.referenceQuote?.date||null;s.quoteExchange=match?.exchange||s.referenceQuote?.exchange||null;s.quoteSymbol=match?.symbol||s.referenceQuote?.symbol||null;s.sourcePriceINR=match?.price??s.referencePriceINR??null;s.referenceValuation=!match&&Boolean(s.referenceQuote);if(match||s.referencePriceINR>0){const value=calculateLiveMarketCap({...baseline,ticker:s.verifiedSharesOutstanding&&match?match.symbol+(match.exchange==='NSE'?'.NS':'.BO'):s.ticker,verifiedSharesOutstanding:s.verifiedSharesOutstanding,shareCountDate:s.shareCountDate,shareCountSource:s.shareCountSource,shareCountConflict:s.shareCountConflict},match?.price??s.referencePriceINR,fx,match?(match.lastTrade||''):(s.referenceQuote?.at||s.referenceQuote?.date||''));if(value){s.cap=value.capUSD;s.liveCapINR=value.capINR;s.liveCapEstimated=value.estimated;s.liveCapBasis=value.basis+(!match?' · '+(s.referenceQuote?.provider||'Exchange')+' reference price as of '+(s.referenceQuote?.date||s.shareCountDate):'')}}}applyDerivedMetrics(stocks,db?.financialCoverage);pendingQuotePulses=quotePulseTracker.observe(stocks);feedStatus=payload.status;feedMode='kite';updateFeedLabel()}
function selectLatestKiteQuote(quotes){
 const timestamp=quote=>{const time=typeof quote.lastTrade==='string'?Date.parse(quote.lastTrade):NaN;return Number.isFinite(time)?time:-Infinity};
 return quotes.filter(quote=>Number.isFinite(quote.price)&&quote.price>0&&['NSE','BSE'].includes(quote.exchange)).slice().sort((a,b)=>timestamp(b)-timestamp(a)||(a.exchange==='NSE'?0:1)-(b.exchange==='NSE'?0:1))[0];
}
function kiteTopStatus(){const dates=stocks.map(s=>s.lastTrade?new Date(s.lastTrade).getTime():NaN).filter(Number.isFinite),latest=dates.length?Math.max(...dates):null;const age=latest==null?Infinity:Date.now()-latest,fresh=age>=0&&age<120000;return fresh&&feedStatus?.authenticated&&feedStatus?.received>0&&feedStatus?.connections>0&&marketSession().state==='open'?'Live · Zerodha':latest?new Date(latest).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}):'Zerodha · waiting for quotes'}
const previousFeedLabel=updateFeedLabel;updateFeedLabel=function(){if(feedMode!=='kite'){previousFeedLabel();return}$('#feed-state').textContent=kiteTopStatus();$('#feed-state').classList.toggle('feed-connected',$('#feed-state').textContent.startsWith('Live'));$('#currency').disabled=false};
const previousFeedPanel=showFeedPanel;showFeedPanel=function(){if(feedStatus?.provider!=='Zerodha Kite'){previousFeedPanel();return}$('#feed-panel').innerHTML=`<section class="feed-card"><strong>Zerodha Kite · ${feedStatus.authenticated?'Connected account':'Sign-in required'}</strong><p>Official share counts: ${new Set(officialShareRecords.map(r=>r.isin)).size.toLocaleString('en-IN')} companies. ${window.officialShareCoverage?.state==='running'?'Exchange reference refresh is running. ':''}BSE-only gaps remain pending where the official source is unavailable. Market data is read by the local backend. Credentials are never sent to the public website. ${feedStatus.received||0} quotes received; ${feedStatus.subscribed||0} instrument subscriptions.${window.zerodhaTrendStatus?' Zerodha 30-day histories: '+Number(window.zerodhaTrendStatus.available||0).toLocaleString('en-IN')+' of '+Number(window.zerodhaTrendStatus.eligible||0).toLocaleString('en-IN')+' matched companies loaded.':''} ${feedStatus.unsubscribed?'Some listings exceed Kite’s 9,000-instrument streaming limit.':''}</p><a class="kite-connect-button" href="/api/kite/login">${feedStatus.authenticated?'Reconnect Zerodha':'Connect Zerodha'}</a></section><p class="note">Prices and volume: Zerodha when connected. Dated reference quotes can also come from official exchange records and reviewed Business Standard pages; the quote source is recorded in each value’s details. Financial statements: existing financial source. Market caps use official dated share counts where verified (source details in the value’s hover text). These counts require updates after capital changes. Market caps marked ≈ are price-scaled estimates based on fixed implied shares from dated prices; share-count changes are not known. ADR-based market caps keep their original value. The exchange is currently ${marketSession().state==='open'?'open':'closed'}.</p><p class="note">IPO dates: <a href="https://www.nseindia.com/api/public-past-issues" target="_blank" rel="noopener">NSE history</a>, <a href="https://zerodha.com/ipo/" target="_blank" rel="noopener">Zerodha calendar</a>, <a href="https://ipocentral.in/ipo-2026/" target="_blank" rel="noopener">IPO Central</a>. Reviewed BSE notices: ${reviewedShareRecords.map(r=>`<a href="${externalHref(r.source)}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a>`).join(', ')}. ${reviewedShareRecords.filter(r=>r.referencePriceSource).map(r=>`<a href="${externalHref(r.referencePriceSource)}" target="_blank" rel="noopener">${escapeHtml(r.name)} · dated price source ↗</a>`).join(' ')} Kite login sessions expire daily. Reconnect when prompted. No order-placement functionality is used.</p>`};
function markEstimatedCaps(){const byRank=new Map(stocks.map(s=>[s.rank,s]));document.querySelectorAll('.ranking-table tbody tr').forEach(row=>{const button=row.querySelector('[data-company]'),s=byRank.get(Number(button?.dataset.company));if(s?.cap!=null&&metric==='cap'){const cell=row.querySelector('td[data-field="cap"]');if(cell){cell.title=s.liveCapBasis||'Dated financial-source market cap';cell.innerHTML=metricValue(s,'cap');if(s.referenceValuation)cell.title+=' · Quote source: '+s.referenceQuote.source;if(s.shareCountSource&&!s.liveCapEstimated)cell.title+=' · '+s.verifiedSharesOutstanding.toLocaleString('en-IN')+' shares · '+(s.shareCountSourceTitle||'Official exchange reference')}}});}
const previousRenderRows=renderRows;renderRows=function(){previousRenderRows();markEstimatedCaps()};
function refreshKiteView(){const table=$('.ranking-table'),scroll=table?{top:table.scrollTop,left:table.scrollLeft}:null;if(['rankings','watchlist'].includes(tab)){updateStats();if(document.activeElement?.closest('.ranking-table'))refreshFocusedRankingValues();else renderRows();if(scroll){const next=$('.ranking-table');next.scrollTop=scroll.top;next.scrollLeft=scroll.left}}else if(tab==='stock'){const ticker=decodeURIComponent(location.hash.split('/')[1]||''),s=resolveStockIdentity(stocks,ticker);if(s){const cards=document.querySelectorAll('.stock-overview strong');if(cards[0]){cards[0].textContent=(s.liveCapEstimated?'≈ ':'')+amount(s.cap);cards[0].title=s.liveCapBasis||''}if(cards[1])cards[1].textContent=stockPrice(s);if(cards[2])cards[2].innerHTML=changeBadge(s)}}else if(tab==='compare'){const selected=compare.map(t=>comparisonCandidates().find(s=>s.ticker===t)).filter(s=>s&&!s.isIndex),keys=comparisonMetricEntries(selected).map(([key])=>key);document.querySelectorAll('.compare-table tbody tr').forEach((row,i)=>{const key=keys[i]||'price';selected.forEach((s,j)=>{if(row.cells[j+1])row.cells[j+1].innerHTML=comparisonMetricValue(s,key)})})}else if(tab==='index'){return}else if(tab==='charts'){if(document.querySelector('.stock-treemap:hover,.scatter-stage:hover,.chart-bar-list:hover,.donut-wrap:hover,.sector-chart-legend:hover')||document.activeElement?.closest('.charts-workspace'))return;renderCharts();document.querySelector('.charts-workspace')?.classList.add('chart-live-refresh')}else render();paintQuotePulses()}
// Keep focused row controls in place while quotes update. Reordering resumes after focus leaves.
function refreshFocusedRankingValues(){
 const byRank=new Map(stocks.map(s=>[s.rank,s]));
 document.querySelectorAll('.ranking-table tbody tr').forEach(row=>{const s=byRank.get(Number(row.querySelector('[data-company]')?.dataset.company));if(!s)return;
 row.querySelectorAll('[data-field]').forEach(cell=>{const key=cell.dataset.field;if(key==='trend')return;cell.innerHTML=key==='price'?stockPrice(s):key==='change'?changeBadge(s):metricValue(s,key)});
 });markEstimatedCaps();if(typeof refreshVisibleTrendCells==='function')refreshVisibleTrendCells();
}
function pulseQuoteElement(element,direction){
 if(!element||!direction)return;
 element.classList.remove('quote-up','quote-down');
 // Retrigger only for another actual price movement, including repeated rises/falls.
 void element.offsetWidth;element.classList.add('quote-'+direction);
 element.addEventListener('animationend',()=>element.classList.remove('quote-up','quote-down'),{once:true});
}
function paintQuotePulses(){
 if(!pendingQuotePulses.size)return;
 const byRank=new Map(stocks.map(s=>[s.rank,s]));
 document.querySelectorAll('.ranking-table tbody tr').forEach(row=>{const s=byRank.get(Number(row.querySelector('[data-company]')?.dataset.company)),move=pendingQuotePulses.get(s?.ticker);if(!move)return;
 pulseQuoteElement(row.querySelector('[data-field="price"]'),move.price);pulseQuoteElement(row.querySelector('[data-field="change"]'),move.price);pulseQuoteElement(row.querySelector('[data-field="cap"]'),move.cap);
 });
 if(tab==='stock'){const ticker=decodeURIComponent(location.hash.split('/')[1]||''),move=pendingQuotePulses.get(resolveStockIdentity(stocks,ticker)?.ticker),cards=document.querySelectorAll('.stock-overview strong');if(move){pulseQuoteElement(cards[0],move.cap);pulseQuoteElement(cards[1],move.price);pulseQuoteElement(cards[2],move.price)}}
 if(tab==='compare'){const selected=compare.map(t=>comparisonCandidates().find(s=>s.ticker===t)).filter(s=>s&&!s.isIndex),keys=comparisonMetricEntries(selected).map(([key])=>key);document.querySelectorAll('.compare-table tbody tr').forEach((row,i)=>{const key=keys[i]||'price';if(!['cap','price'].includes(key))return;selected.forEach((s,j)=>pulseQuoteElement(row.cells[j+1],pendingQuotePulses.get(s.ticker)?.[key]))})}
 pendingQuotePulses.clear();
}
let kiteCompareRange='1M',kiteStockRange='1M',kiteChartRequest=0;
const priceHistoryRequests=new Map();
function validateHistoricalPoints(points){
 if(!Array.isArray(points))throw Error('Invalid historical data');
 let previousTime=-Infinity;
 for(const point of points){
  if(!point||typeof point!=='object'||Array.isArray(point))throw Error('Invalid historical data');
  const time=typeof point.time==='string'?Date.parse(point.time):NaN;
  const validPrice=value=>Number.isFinite(value)&&value>0;
  if(!Number.isFinite(time)||time<=previousTime||!validPrice(point.price))throw Error('Invalid historical data');
  if(['open','high','low'].some(key=>point[key]!=null&&!validPrice(point[key])))throw Error('Invalid historical data');
  if(point.volume!=null&&(!Number.isFinite(point.volume)||point.volume<0))throw Error('Invalid historical data');
  if(point.high!=null&&[point.price,point.open,point.low].some(value=>Number.isFinite(value)&&value>point.high))throw Error('Invalid historical data');
  if(point.low!=null&&[point.price,point.open,point.high].some(value=>Number.isFinite(value)&&value<point.low))throw Error('Invalid historical data');
  previousTime=time;
 }
}
function validateHistoricalIdentity(data,stock,range){
 const matchesInstrument=stock.historyIndex
  ? data.index===stock.historyIndex&&data.currency==='POINTS'
  : data.currency==='INR'&&(!stock.isin||data.isin===stock.isin);
 if(data.provider!=='Zerodha Kite'||data.range!==range||!matchesInstrument)
  throw Error('Historical instrument or currency does not match the selected chart. Please try again.');
}
async function fetchPriceHistory(stock,range){
 const instrument=stock.historyIndex?{index:stock.historyIndex}:stock.instrumentToken?{token:stock.instrumentToken}:{isin:stock.isin};
 const response=await fetch('/api/kite/history?'+new URLSearchParams({...instrument,range}),{signal:AbortSignal.timeout(20000)});
 const data=await response.json();
 if(!response.ok){
  const error=Error(typeof data?.error==='string'?data.error:'History unavailable');
  error.status=response.status;throw error;
 }
 if(!data)throw Error('Invalid historical data');
 validateHistoricalPoints(data.points);
 validateHistoricalIdentity(data,stock,range);
 return data;
}
async function getPriceHistory(stock,range){
 const key=(stock.historyIndex||stock.isin||stock.instrumentToken)+':'+range;
 if(priceHistoryRequests.has(key))return priceHistoryRequests.get(key);
 const request=fetchPriceHistory(stock,range);
 priceHistoryRequests.set(key,request);
 // Expiry and rejection may release only the request that they own.
 const release=()=>{if(priceHistoryRequests.get(key)===request)priceHistoryRequests.delete(key)};
 setTimeout(release,['1D','5D'].includes(range)?60000:600000);
 request.catch(release);
 return request;
}

async function loadKiteComparison(selected,range=kiteCompareRange,target=null){
 const indexChart=selected.length===1&&selected[0].isIndex,stockChart=Boolean(target),card=target||document.querySelector('.compare-overlay');if(!card)return;const previousChart=card.querySelector('.price-history-chart')?card.querySelector('.kite-history-content')?.innerHTML:'';card.dataset.chartTitle=stockChart?(indexChart?'Index history · ':'Price history · ')+selected[0].name:'Price performance';const request=++kiteChartRequest,comparison=!stockChart;
 if(!card.querySelector('.kite-history-content'))card.innerHTML=`<div class="overlay-heading"><h3>${comparison?'Price performance':indexChart?'Index history':'Price history'}</h3><span class="chart-unit-label">${comparison?'Change (%)':indexChart?'Points':currency}</span></div>${chartTimelineControls('data-kite-range',range,CHART_TIMELINES)}<div class="kite-history-content" aria-busy="true"><p class="note chart-loading" role="status">Loading price history…</p></div>`;
 card.querySelectorAll('[data-kite-range]').forEach(button=>{const active=button.dataset.kiteRange===range;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
 card.querySelectorAll('[data-kite-range]').forEach(button=>button.onclick=()=>{if(stockChart)kiteStockRange=button.dataset.kiteRange;else kiteCompareRange=button.dataset.kiteRange;loadKiteComparison(selected,button.dataset.kiteRange,target)});
 const pendingHolder=card.querySelector('.kite-history-content');pendingHolder.setAttribute('aria-busy','true');pendingHolder.querySelector('.history-loading-overlay')?.remove();if(previousChart){pendingHolder.classList.add('history-transitioning');pendingHolder.insertAdjacentHTML('afterbegin','<p class="history-loading-overlay" role="status">Loading '+escapeHtml(range)+'…</p>')}else pendingHolder.innerHTML='<p class="note chart-loading" role="status">Loading price history…</p>';
 const palette=document.body.classList.contains('dark')?['#7aaeff','#e5b85c','#58d7a3','#c79bff']:['#397de0','#b57100','#168163','#a24bd0'];
 // Commit one complete batch so faster responses cannot reveal lines separately.
 const jobs=selected.map(async(s,i)=>{if(!s.instrumentToken&&!s.isin&&!s.historyIndex)return {s,error:'No historical instrument is available.'};try{return {s,color:palette[i],dash:['','6 3','2 3','8 3 2 3'][i],data:await getPriceHistory(s,range)}}catch(error){return {s,error:error.message,status:error.status}}});
 preloadChartTimelines(selected);
 const values=await Promise.all(jobs);
 if(request!==kiteChartRequest||!document.contains(card))return;
 requestAnimationFrame(()=>{if(request===kiteChartRequest&&document.contains(card))renderKiteHistoryValues(selected,range,target,card,comparison,values,0)});
}
const chartPreloadTimes=new Map();
function preloadChartTimelines(selected){
 if(STATIC_PREVIEW)return;
 const isins=selected.map(s=>s.isin).filter(Boolean),indices=selected.map(s=>s.historyIndex).filter(Boolean),key=isins.join(',')+'|'+indices.join(','),started=Date.now();
 if(key==='|'||started-(chartPreloadTimes.get(key)||0)<600000)return;
 chartPreloadTimes.set(key,started);
 fetch('/api/kite/preload?'+new URLSearchParams({isins:isins.join(','),indices:indices.join(',')}),{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(async response=>{
  if(!response.ok)throw Error('History warming unavailable');
  const data=await response.json();if(!Number.isInteger(data?.queued)||data.queued<1||data.queued>4)throw Error('History warming was not acknowledged');
 }).catch(()=>{if(chartPreloadTimes.get(key)===started)chartPreloadTimes.delete(key)});
}

function renderKiteHistoryValues(selected,range,target,card,comparison,values,pending){
 priceChartResizeObserver?.disconnect();priceChartResizeObserver=null;
 const indexChart=selected.length===1&&selected[0].isIndex,holder=card.querySelector('.kite-history-content'),priorSVG=holder.querySelector('.price-history-chart')?.cloneNode(true);holder.setAttribute('aria-busy',String(pending>0));
 const good=values.filter(v=>v.data?.points.length>1),errors=values.filter(v=>!v.data?.points.length||v.data.points.length<2);
 if(!good.length&&pending)return;
 holder.classList.remove('history-transitioning');
 if(!good.length){
  const authNeeded=errors.some(v=>v.status===401),unavailable=errors.every(v=>/Instrument is not available|No historical instrument/i.test(v.error||'')),empty=errors.every(v=>!v.error);
  const message=authNeeded?'Reconnect Zerodha to load historical prices. Historical-data access must be enabled for your app.':unavailable?'This listing has no matching Zerodha historical instrument. Its current or former ticker may have changed.':empty?'Zerodha returned fewer than two observations for this period. Try a longer range.':'Zerodha history is temporarily unavailable. Try again in a moment.';
  holder.innerHTML='<div class="chart-empty"><strong>Price history unavailable</strong><p>'+message+'</p>'+(authNeeded?'<a class="primary-link" href="/api/kite/login">Connect Zerodha</a>':!unavailable&&!empty?'<button data-retry-history>Try again</button>':'')+'</div>';
  const retry=holder.querySelector('[data-retry-history]');if(retry)retry.onclick=()=>loadKiteComparison(selected,range,target);return;
 }

 const prepared=preparePriceSeries(good.map(v=>({name:v.s.name,ticker:v.s.ticker,color:v.color,dash:v.dash,isIndex:v.s.isIndex,points:v.data.points})),{comparison,range}),series=prepared.filter(s=>s.points.length>=2);for(const sparse of prepared.filter(s=>s.points.length<2))errors.push({s:sparse,error:'Fewer than two weekly observations are available. Try a shorter timeline for daily data.'});if(!series.length){holder.innerHTML='<div class="chart-empty"><strong>Not enough history</strong><p>'+(['5Y','MAX'].includes(range)?'Fewer than two weekly observations are available. Try a shorter timeline for daily data.':'Fewer than two trading observations are available. Try another timeline.')+'</p></div>';return}
 const displayAxisPrice=p=>currency==='INR'?formatINR(p,false):formatUSD(p),displayPrice=p=>displayAxisPrice(currency==='INR'?p:p/fx),percent=v=>(v>0?'+':'')+v.toFixed(2)+'%';
 for(const s of series){if(!comparison&&!s.isIndex&&currency==='USD')for(const p of s.points)p.value/=fx;const priceFormat=s.isIndex?indexLevel:displayPrice;s.format=comparison?percent:s.isIndex?indexLevel:displayAxisPrice;s.formatPrice=priceFormat;s.difference=(a,b,pa,pb)=>{const pct=(pb.price/pa.price-1)*100,delta=pb.price-pa.price;return (delta>=0?'+':'−')+priceFormat(Math.abs(delta))+' ('+percent(pct)+')'};for(const p of s.points)p.label=chartTimeLabel(p.time,range,true)}
 holder.innerHTML=`<div class="chart-summary" aria-live="polite"></div><div class="price-chart-canvas"></div><div class="overlay-legend"></div><p class="note chart-history-note">${comparison?'Each line starts at 0% on its own first available observation. ':''}Zerodha${selected.length===1&&selected[0].liveSymbol?' · '+escapeHtml(selected[0].liveSource+':'+selected[0].liveSymbol):''} · ${range==='1D'||range==='5D'?'5-minute observations · trading sessions only':['5Y','MAX'].includes(range)?'Weekly observations · last available trading day per week':'Daily observations · trading sessions only'}${range==='MAX'?' · Provider history requested from 1990; availability varies by instrument':''}. ${series.map(s=>escapeHtml(s.name)+": "+s.points.length.toLocaleString()).join(" · ")} observations.</p>${pending?'<p class="chart-partial" role="status">Loading '+pending+' remaining '+(pending===1?'company':'companies')+'…</p>':''}${errors.map(v=>`<p class="chart-data-warning">${escapeHtml(v.s.name)}: ${escapeHtml(v.error||'Insufficient history for this period.')}</p>`).join('')}`;
 const timeScale=priceChartTimeScale(series,range),timeline=timeScale.points;const summary=holder.querySelector('.chart-summary'),last=timeline.at(-1);if(['1D','5D'].includes(range)){const date=new Date(last.time),minute=(date.getUTCHours()*60+date.getUTCMinutes()+330)%1440;if(minute<925&&last.time.slice(0,10)<new Date().toISOString().slice(0,10)){const note=document.createElement('p');note.className='chart-coverage-note';note.textContent='Provider history ends before this session’s closing candle. The latest quote may be newer.';holder.querySelector('.chart-history-note').after(note)}}summary.textContent=chartTimeLabel(timeline[0].time,range,true)+' — '+chartTimeLabel(last.time,range,true);
 const legend=holder.querySelector('.overlay-legend');series.forEach((s,i)=>{const button=document.createElement('button');button.className='overlay-toggle';button.dataset.seriesDash=s.dash||'none';button.setAttribute('aria-pressed','true');button.innerHTML=`<i style="border-top:2px ${s.dash==='2 3'?'dotted':s.dash?'dashed':'solid'} ${s.color};background:transparent"></i><span>${escapeHtml(s.name)}</span><b>${comparison?percent(s.points.at(-1).value):s.formatPrice(s.points.at(-1).price)}</b>`;button.onclick=()=>{const active=button.getAttribute('aria-pressed')!=='true';if(!active&&series.filter(s=>!s.hidden).length===1)return;s.hidden=!active;button.setAttribute('aria-pressed',String(active));draw()};legend.append(button)});
 const canvas=holder.querySelector('.price-chart-canvas');let drawnWidth=0;
 function draw(){if(!canvas.isConnected)return;const plotFocused=document.activeElement===canvas.querySelector('.price-history-chart'),dataState=captureChartDataState(canvas);const previousSVG=canvas.querySelector('.price-history-chart')?.cloneNode(true)||priorSVG;const visible=series.filter(s=>!s.hidden),width=Math.max(280,Math.round(canvas.clientWidth||800)),height=width<500?285:330,left=width<500?65:78,right=18,top=28,bottom=height-46,plot=width-left-right,points=timeline,scale=niceChartScale(visible.flatMap(s=>s.points.map(p=>p.value)),{includeZero:comparison,count:5,nonNegative:!comparison});
 for(const s of visible)for(let i=0;i<s.points.length;i++){const p=s.points[i];p.x=left+timeScale.fraction(p.time)*plot;p.y=bottom-(p.value-scale.min)/(scale.max-scale.min)*(bottom-top)}
 drawnWidth=width;const ticks=chartObservationTicks(points,range,width),axis=v=>indexChart?indexLevel(v):comparison?(Math.abs(v)<1e-8?'0%':v.toLocaleString('en-IN',{maximumFractionDigits:2})+'%'):(currency==='INR'?formatINR(v):formatUSD(v)),zero=bottom-(0-scale.min)/(scale.max-scale.min)*(bottom-top);
 canvas.innerHTML=`<svg class="overlay-chart price-history-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${comparison?'Comparable price performance':indexChart?'Index level in points':'Share price in '+currency} from ${escapeHtml(points[0].label)} to ${escapeHtml(points.at(-1).label)}"><text class="chart-axis-unit" x="${left}" y="15">${comparison?'Change (%)':indexChart?'Points':currency+' price'}</text>${scale.ticks.map(v=>{const y=bottom-(v-scale.min)/(scale.max-scale.min)*(bottom-top);return `<line class="chart-gridline" x1="${left}" x2="${width-right}" y1="${y}" y2="${y}"/><text x="${left-10}" y="${y+4}" text-anchor="end">${escapeHtml(axis(v))}</text>`}).join('')}${comparison?`<line class="chart-zero-line" x1="${left}" x2="${width-right}" y1="${zero}" y2="${zero}"/>`:''}${ticks.map((t,i)=>{const x=left+(t.calendar?timeScale.fraction(t.time):t.index/(points.length-1))*plot;return `<line class="chart-axis-tick" x1="${x}" x2="${x}" y1="${bottom}" y2="${bottom+5}"/><text x="${x}" y="${bottom+23}" text-anchor="${x-left<18?'start':width-right-x<18?'end':'middle'}">${escapeHtml(t.label)}</text>`}).join('')}${visible.map(s=>`<path class="overlay-series" d="${s.points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ')}" fill="none" stroke="${s.color}" stroke-dasharray="${s.dash||'none'}"/>`).join('')}<text class="chart-timezone" x="${width-right}" y="${height-3}" text-anchor="end">${range==='1D'?'Time (IST)':['6M','YTD','1Y'].includes(range)?'Months · 1st (IST)':['5Y','MAX'].includes(range)?'Years · 1 Jan (IST)':'Trading dates (IST)'}</text></svg>`;
 attachChartInteraction(canvas.querySelector('svg'),visible,{left,right:width-right,top,bottom},{dataState});animateChartSwap(canvas,previousSVG);restorePriceChartFocus(canvas,plotFocused);}
 draw();observePriceChartSize(canvas,()=>{if(Math.max(280,Math.round(canvas.clientWidth))!==drawnWidth)draw()});
}
let priceChartResizeObserver=null;
// Navigation owns disposal; shared history requests may still complete into their cache.
function disposePriceChart(){
 ++kiteChartRequest;
 priceChartResizeObserver?.disconnect();
 priceChartResizeObserver=null;
}
function observePriceChartSize(canvas,redraw){
 priceChartResizeObserver?.disconnect();
 const observer=new ResizeObserver(()=>{
  if(priceChartResizeObserver!==observer)return;
  if(!canvas.isConnected){observer.disconnect();priceChartResizeObserver=null;return}
  redraw();
 });
 priceChartResizeObserver=observer;observer.observe(canvas);
}
function restorePriceChartFocus(canvas,plotFocused){
 if(plotFocused&&canvas.isConnected)canvas.querySelector('.price-history-chart')?.focus({preventScroll:true});
}
const previousRenderCompare=renderCompare;renderCompare=function(){previousRenderCompare();if(!STATIC_PREVIEW){const selected=compare.map(t=>comparisonCandidates().find(s=>s.ticker===t)).filter(Boolean);if(selected.length)loadKiteComparison(selected)}};

const companyPageBeforePreload=renderStockPage;
renderStockPage=function(s,key){companyPageBeforePreload(s,key);if(!STATIC_PREVIEW&&s.isin)preloadChartTimelines([s])};

const previousCompanyMetric=renderCompanyMetric;renderCompanyMetric=function(s,key){previousCompanyMetric(s,key);if(s.referenceValuation){const price=document.querySelectorAll('.stock-overview strong')[1];if(price)price.title='As of '+s.referenceQuote.date+' · '+s.referenceQuote.source;const cap=document.querySelector('.stock-overview strong');if(cap)cap.title=s.liveCapBasis+' · '+s.shareCountSource;}if(!STATIC_PREVIEW&&key==='price'){const target=document.querySelector('.stock-chart-card');if(target)loadKiteComparison([s],kiteStockRange,target)}if(feedMode==='kite'&&s.liveCapEstimated){const value=document.querySelector('.stock-overview strong');if(value){value.textContent='≈ '+amount(s.cap);value.title=s.liveCapBasis}if(key==='cap'){const current=document.querySelector('.stock-current>strong');if(current){current.textContent='≈ '+amount(s.cap);current.title=s.liveCapBasis}}}};

async function refreshOfficialShareData(){
 if(document.hidden||!stocks.length)return;
 try{const response=await fetch('official-shares.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});if(!response.ok)return;const data=await response.json();const ipoResponse=await fetch('ipo-listings.json',{cache:'no-cache',signal:AbortSignal.timeout(15000)});if(ipoResponse.ok){const ipos=await ipoResponse.json();officialIPORecords=[...supplementalIPORecords,...(ipos.records||[])];attachIPOListings(stocks,officialIPORecords)}const signature=JSON.stringify(data.records);if(signature===window.officialSharesSignature)return;window.officialSharesSignature=signature;officialShareRecords=[...(data.records||[]),...reviewedShareRecords];window.officialShareCoverage=data.coverage;attachOfficialShares(stocks,officialShareRecords);if(feedMode==='kite'){const payload=await readFeed();if(payload?.status?.authenticated){applyKiteQuotes(payload);refreshKiteView()}}else{applyReferenceValuations(stocks,fx);render()}}catch{}
}
setInterval(refreshOfficialShareData,300000);

function revalueNativeCaps(){if(feedMode==='kite')for(const s of stocks)if(Number.isFinite(s.liveCapINR))s.cap=s.liveCapINR/fx/1e9}
