const SITE_PUBLIC_URL='https://pragalbhshandilya.github.io/india-stock-view/';
const PUBLIC_INDEX_IDS=['NSE:NIFTY 50','BSE:SENSEX','NSE:NIFTY BANK','NSE:NIFTY NEXT 50','NSE:NIFTY IT','NSE:NIFTY MIDCAP 100','NSE:NIFTY SMLCAP 100'];
function pageMetadata(route,rows=[]){
 const name='IndiaStockView';
 const pages={rankings:['Indian stock rankings','Rank Indian companies by market capitalisation, price, daily change and financial metrics. Search, filter and compare available NSE and BSE equities.'],charts:['Indian market charts','Explore market maps, market movers and company valuation charts for Indian equities.'],sectors:['Indian stock market sectors','Explore Indian companies by industry and compare sector market capitalisation and market movements.'],compare:['Compare Indian stocks','Compare Indian companies, financial metrics and historical price performance across multiple time periods.'],watchlist:['Your stock watchlist','Track your selected Indian companies in a watchlist saved in this browser.'],about:['Data sources and methodology','Understand IndiaStockView market-data sources, calculated market capitalisations, financial periods and coverage limitations.']};
 const path=String(route||'rankings').replace(/^#/,'').split('/');
 if(path[0]==='index'){let id;try{id=decodeURIComponent(path[1]||'')}catch{id=''}const label=id.replace(/^(NSE|BSE):/,'');return {title:label+' index chart | '+name,description:'Explore '+label+' historical index levels and compare percentage performance with Indian stocks.',url:PUBLIC_INDEX_IDS.includes(id)?SITE_PUBLIC_URL+'indices/'+encodeURIComponent(id)+'/':SITE_PUBLIC_URL+'#index/'+encodeURIComponent(id),noindex:!PUBLIC_INDEX_IDS.includes(id)}}
 if(path[0]==='stock'){
 let ticker;try{ticker=decodeURIComponent(path[1]||'')}catch{ticker=''}
 const s=rows.find(s=>s.ticker===ticker)||rows.find(s=>s.aliases?.includes(ticker));
 if(s){const metric={price:'Share price',cap:'Market capitalisation',revenue:'Revenue',earnings:'Earnings',pe:'P/E ratio'}[path[2]]||'Financial overview';return {title:s.name+' — '+metric+' | '+name,description:'Explore '+s.name+' ('+s.ticker+') share prices, market capitalisation and available company financials. View dated sources and historical price charts.',shareTitle:s.name+' | '+name,url:s.isin?SITE_PUBLIC_URL+'companies/'+encodeURIComponent(s.ticker)+'/':SITE_PUBLIC_URL+'#stock/'+encodeURIComponent(s.ticker)+'/'+(path[2]||'price')}}
 return {title:'Company not found | '+name,description:'Search Indian stock rankings to find a company and its available financial data.',url:SITE_PUBLIC_URL};
 }
 const key=pages[path[0]]?path[0]:'rankings',value=pages[key];
 return {title:value[0]+' | '+name,description:value[1],url:key==='rankings'?SITE_PUBLIC_URL:SITE_PUBLIC_URL+key+'/',noindex:key==='watchlist'};
}
function applyPageMetadata(data){
 if(typeof publicPathAvailable==='function'&&!publicPathAvailable(data.url))data={...data,url:SITE_PUBLIC_URL+location.hash};
 document.title=data.title;
 document.querySelector('meta[name="robots"]')?.setAttribute('content',data.noindex?'noindex,follow':'index,follow');
 const set=(selector,attribute,value)=>document.querySelector(selector)?.setAttribute(attribute,value);
 set('meta[name="description"]','content',data.description);
 set('meta[property="og:title"]','content',data.shareTitle||data.title);set('meta[property="og:description"]','content',data.description);set('meta[property="og:url"]','content',data.url);
 set('meta[name="twitter:title"]','content',data.shareTitle||data.title);set('meta[name="twitter:description"]','content',data.description);
 set('link[rel="canonical"]','href',data.url.includes('#')?SITE_PUBLIC_URL:data.url);
 if(typeof syncPublicPath==='function')syncPublicPath(data.url);
}
const renderBeforeMetadata=render;render=function(){renderBeforeMetadata();applyPageMetadata(pageMetadata(location.hash,stocks))};
