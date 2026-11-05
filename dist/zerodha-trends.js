const zerodhaTrendCache=new Map();
let trendReadInFlight=false,lastTrendRequest='',lastTrendAt=0;
function trendIndiaDate(value){const time=new Date(value).getTime();return Number.isFinite(time)?new Date(time+330*60000).toISOString().slice(0,10):null}
function zerodhaTrendPoints(stock,now=new Date()){
 const record=stock.zerodhaTrend;if(record?.provider!=='Zerodha Kite'||record.state!=='ready'||!Array.isArray(record.points))return [];
 const end=trendIndiaDate(now),startDate=new Date(end+'T00:00:00Z');startDate.setUTCDate(startDate.getUTCDate()-29);const start=startDate.toISOString().slice(0,10),listed=stock.verifiedListingDate||record.listingDate,from=listed&&listed>start?listed:start,points=new Map();
 for(const point of record.points)if(point.date>=from&&point.date<=end&&Number.isFinite(point.price)&&point.price>0)points.set(point.date,{...point});
 const quoteDate=trendIndiaDate(stock.lastTrade);if(stock.liveSource===record.exchange&&quoteDate&&quoteDate>=from&&quoteDate<=end&&Number.isFinite(stock.sourcePriceINR)&&stock.sourcePriceINR>0){const latest=[...points.keys()].sort().at(-1);if(!latest||quoteDate>=latest)points.set(quoteDate,{date:quoteDate,price:stock.sourcePriceINR})}
 return [...points.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function zerodhaTrendReturn(stock){const points=zerodhaTrendPoints(stock);return points.length>1?(points.at(-1).price/points[0].price-1)*100:Number.isFinite(stock.zerodhaTrendReturnValue)?stock.zerodhaTrendReturnValue:null}
function zerodhaTrendMarkup(stock){
 if(!stock.isin||(typeof STATIC_PREVIEW!=='undefined'&&STATIC_PREVIEW))return '<span class="note" title="No connected Zerodha historical instrument for this company">—</span>';
 const r=stock.zerodhaTrend,points=zerodhaTrendPoints(stock);
 if(!points.length)return `<span class="note trend-placeholder" title="${r?.state==='login_required'?'Connect Zerodha to load history':r?.state==='history_access_required'?'Zerodha historical access must be reconnected or enabled':r?.state==='pending'||!r?'Loading Zerodha history':'Zerodha history unavailable for this listing'}">${r?.state==='pending'||!r?'…':'—'}</span>`;
 const endDate=new Date(trendIndiaDate(new Date())+'T00:00:00Z').getTime(),startDate=endDate-29*86400000,low=Math.min(...points.map(p=>p.price)),high=Math.max(...points.map(p=>p.price)),x=p=>4+Math.max(0,Math.min(29,(new Date(p.date+'T00:00:00Z').getTime()-startDate)/86400000))/29*147,y=p=>high===low?25:45-(p.price-low)/(high-low)*40,change=zerodhaTrendReturn(stock),direction=change>0?'positive':change<0?'negative':'neutral',listed=stock.verifiedListingDate||r.listingDate,label=listed&&listed>=r.windowStart?'Since listing':'30-day trend',description=`${stock.name} · Zerodha · ${label} · ${points[0].date} — ${points.at(-1).date} · ${points.length} trading ${points.length===1?'day':'days'}${change==null?'':' · '+(change>=0?'+':'')+change.toFixed(2)+'%'} · History fetched ${r.asOf||'date unavailable'}`;
 return `<svg class="sparkline zerodha-sparkline ${direction}" viewBox="0 0 155 50" role="img" aria-label="${escapeHtml(description)}"><title>${escapeHtml(description)}</title>${points.length===1?`<circle cx="${x(points[0]).toFixed(2)}" cy="25" r="2.5" fill="currentColor"/>`:`<path d="${points.map((p,i)=>(i?'L':'M')+x(p).toFixed(2)+','+y(p).toFixed(2)).join(' ')}"/>`}</svg>`;
}
function visibleTrendStocks(){const byRank=new Map(stocks.map(s=>[s.rank,s]));return [...document.querySelectorAll('.ranking-table [data-company]')].map(button=>byRank.get(Number(button.dataset.company))).filter(Boolean)}
function refreshVisibleTrendCells(){const byRank=new Map(stocks.map(s=>[s.rank,s]));document.querySelectorAll('.ranking-table tbody tr').forEach(row=>{const s=byRank.get(Number(row.querySelector('[data-company]')?.dataset.company));const cell=row.querySelector('[data-field="trend"]');if(s&&cell){const markup=zerodhaTrendMarkup(s);if(cell.innerHTML!==markup)cell.innerHTML=markup}})}
async function refreshZerodhaTrends(){
 if(STATIC_PREVIEW||document.hidden||!['rankings','watchlist'].includes(tab)||trendReadInFlight)return;
 const rows=visibleTrendStocks(),isins=[...new Set(rows.map(s=>s.isin).filter(Boolean))],signature=isins.join(',');
 if(!isins.length)return;if(signature===lastTrendRequest&&Date.now()-lastTrendAt<4500)return;
 trendReadInFlight=true;lastTrendRequest=signature;lastTrendAt=Date.now();
 try{const response=await fetch('/api/trends?'+new URLSearchParams({isins:signature}),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error();const data=await response.json();if(!Array.isArray(data.records))throw Error();window.zerodhaTrendStatus=data.status;for(const s of stocks)s.zerodhaTrendReturnValue=Number.isFinite(data.returns?.[s.isin])?data.returns[s.isin]:null;for(const r of data.records)if(r.provider==='Zerodha Kite'&&typeof r.isin==='string')zerodhaTrendCache.set(r.isin,r);for(const s of stocks)s.zerodhaTrend=s.isin?zerodhaTrendCache.get(s.isin):{state:'unsupported',provider:'Zerodha Kite',points:[]};if(sortColumn==='trend'&&!document.activeElement?.closest('.ranking-table'))renderRows();else refreshVisibleTrendCells()}
 catch{for(const s of rows)if(!s.zerodhaTrend)s.zerodhaTrend={state:'unavailable',provider:'Zerodha Kite',points:[]};refreshVisibleTrendCells()}
 finally{trendReadInFlight=false}
}
const rankingRowsBeforeTrends=renderRows;renderRows=function(){for(const s of stocks)if(s.isin&&zerodhaTrendCache.has(s.isin))s.zerodhaTrend=zerodhaTrendCache.get(s.isin);rankingRowsBeforeTrends();refreshZerodhaTrends()};
setInterval(refreshZerodhaTrends,5000);
