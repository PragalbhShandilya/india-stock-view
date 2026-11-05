// Only dated, official exchange records are eligible for exact share-count calculations.
let officialShareRecords=[],officialIPORecords=[],reviewedShareRecords=[],supplementalIPORecords=[];
function attachIPOListings(stocks,records){const dates=new Map(records.filter(r=>r.listingType==='IPO'&&(r.source==='https://www.nseindia.com/api/public-past-issues'||/^https:\/\/ipocentral\.in\/(sme-)?ipo-\d{4}\/$/.test(r.source)||r.source?.startsWith('https://zerodha.com/ipo/'))).map(r=>[r.isin,r]));for(const s of stocks){const r=dates.get(s.isin);if(r){s.verifiedListingDate=r.listingDate;s.ipoSource=r.source;s.ipoSourceTitle=r.sourceTitle;if(s.directoryOnly&&r.name)s.name=r.name;if(!s.logo&&r.logo)s.logo=r.logo}}return stocks}

function groupedExchangeSector(record){
 const sector=String(record.exchangeSector||'').toLowerCase(),industry=String(record.industry||'').toLowerCase();
 if(sector==='financial services')return /banks?/.test(industry)?'Banking':'Financial services';
 if(/automobile/.test(sector))return 'Automotive';if(/information technology/.test(sector))return 'Technology';if(/healthcare/.test(sector))return 'Healthcare';if(/telecommunication/.test(sector))return 'Telecom';if(sector==='realty')return 'Real estate';if(/oil gas|power|utilities/.test(sector))return 'Energy';
 if(/fast moving consumer|consumer durables|consumer goods|textiles|forest materials/.test(sector))return 'Consumer goods';
 if(/consumer services|media entertainment/.test(sector))return /hotel|tour|travel|resort/.test(industry)?'Transport & travel':'Retail & internet';
 if(sector==='services')return /transport|logistics|shipping|\bports?\b|airport|airline/.test(industry)?'Transport & travel':'Industrials';
 if(/capital goods|chemicals|construction|metals/.test(sector))return 'Industrials';if(sector==='diversified')return 'Diversified';return record.sector||null;
}
function attachOfficialShares(stocks,records,asOf=new Date().toISOString().slice(0,10)){
 const latest=new Map(),quotes=new Map();
 for(const r of records){
  let url;try{url=new URL(r.source)}catch{continue}
  if(!/^(www\.)?(bseindia\.com|nseindia\.com|nsearchives\.nseindia\.com)$/.test(url.hostname)||url.protocol!=='https:'||!/^INE[A-Z0-9]{9}$/.test(r.isin)||!Number.isSafeInteger(r.sharesOutstanding)||r.sharesOutstanding<=0||!/^\d{4}-\d{2}-\d{2}$/.test(r.effectiveDate)||valuationQuoteDate(r.effectiveDate)!==r.effectiveDate||r.effectiveDate>asOf)continue;
  const current=latest.get(r.isin);
  if(!current||current.effectiveDate<r.effectiveDate)latest.set(r.isin,r);
  else if(current.effectiveDate===r.effectiveDate&&current.sharesOutstanding!==r.sharesOutstanding)latest.set(r.isin,{...current,conflictingShares:true,conflictSources:[...new Set([...(current.conflictSources||[current.source]),r.source])]});
  const quoteDate=r.referencePriceDate||r.effectiveDate,quoteSource=r.referencePriceSource||r.source;let quoteURL;try{quoteURL=new URL(quoteSource)}catch{continue}
  if(Number.isFinite(r.referencePriceINR)&&r.referencePriceINR>0&&/^\d{4}-\d{2}-\d{2}$/.test(quoteDate)&&valuationQuoteDate(quoteDate)===quoteDate&&(!r.referencePriceAt||valuationQuoteDate(r.referencePriceAt)===quoteDate)&&quoteDate<=asOf&&quoteURL.protocol==='https:'&&/^(www\.)?(bseindia\.com|nseindia\.com|nsearchives\.nseindia\.com|business-standard\.com)$/.test(quoteURL.hostname)){
   const quote={priceINR:r.referencePriceINR,date:quoteDate,at:r.referencePriceAt||null,source:quoteSource,provider:quoteURL.hostname.includes('business-standard')?'Business Standard':quoteURL.hostname.includes('nseindia')?'NSE':'BSE',exchange:r.referencePriceExchange||(quoteURL.hostname.includes('nseindia')?'NSE':'BSE'),symbol:r.referencePriceSymbol||r.symbol||null,change:Number.isFinite(r.referenceChangePercent)?r.referenceChangePercent:null,volume:Number.isFinite(r.referenceVolume)?r.referenceVolume:null};
   if(!quotes.has(r.isin)||quotes.get(r.isin).date<quote.date)quotes.set(r.isin,quote);
  }
 }
 for(const stock of stocks){const r=latest.get(stock.isin);if(r){
  if(r.conflictingShares){
   stock.shareCountConflict={date:r.effectiveDate,sources:r.conflictSources};
   stock.verifiedSharesOutstanding=null;stock.shares=null;
   if(stock.referenceValuation||stock.liveCapINR!=null){stock.cap=null;stock.liveCapINR=null;stock.referenceValuation=false}
   continue;
  }
  stock.shareCountConflict=null;if(stock.directoryOnly&&r.name)stock.name=r.name;const officialSector=groupedExchangeSector(r);if(officialSector){stock.sector=officialSector;stock.sectorSource=r.source;}stock.verifiedSharesOutstanding=r.sharesOutstanding;stock.shares=r.sharesOutstanding;if(r.industry)stock.officialIndustry=r.industry;stock.referenceQuote=quotes.get(stock.isin)||null;stock.referencePriceINR=stock.referenceQuote?.priceINR??null;stock.shareCountDate=r.effectiveDate;stock.shareCountSource=r.source;stock.shareCountSourceTitle=r.sourceTitle;if(r.listingType==='IPO')stock.verifiedListingDate=r.listingDate}}
 return stocks;
}
function applyReferenceValuations(rows,usdINR){
 if(!(Number.isFinite(usdINR)&&usdINR>0))return rows;
 for(const stock of rows){const quote=stock.referenceQuote;if(stock.shareCountConflict||!quote||quote.date<stock.shareCountDate||!(stock.verifiedSharesOutstanding>0))continue;
  const listing=stock.exchangeListings?.find(l=>l.exchange===quote.exchange);if(!listing)continue;
  quote.symbol=quote.symbol||listing.symbol;stock.referenceValuation=true;stock.quoteSource=quote.source;stock.quoteAsOf=quote.at||quote.date;stock.quoteExchange=quote.exchange;stock.quoteSymbol=quote.symbol;stock.sourcePriceINR=quote.priceINR;stock.price=quote.priceINR/usdINR;
  stock.cap=quote.priceINR*stock.verifiedSharesOutstanding/usdINR/1e9;stock.liveCapEstimated=false;stock.liveCapINR=quote.priceINR*stock.verifiedSharesOutstanding;
  stock.liveCapBasis='Dated '+quote.provider+' reference price as of '+quote.date+' × official outstanding shares as of '+stock.shareCountDate;
  stock.change=quote.change;stock.volume=quote.volume;stock.lastTrade=quote.at;
 }
 return rows;
}
function valuationQuoteDate(value){
 if(typeof value!=='string'||!value)return null;
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)){const time=Date.parse(value);return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?value:null}
 const time=Date.parse(value);if(!Number.isFinite(time))return null;
 return new Date(time+330*60000).toISOString().slice(0,10);
}
function calculateLiveMarketCap(stock,priceINR,usdINR,quoteAsOf=null){
 if(stock.shareCountConflict)return null;
 if(!Number.isFinite(priceINR)||priceINR<=0||!Number.isFinite(usdINR)||usdINR<=0)return null;
 // Overseas receipts are not interchangeable with the Indian ordinary share.
 if(!/\.(NS|BO)$/.test(stock.ticker||''))return null;
 if(Number.isFinite(stock.verifiedSharesOutstanding)&&stock.verifiedSharesOutstanding>0){
  const sharesDate=valuationQuoteDate(stock.shareCountDate),quoteDate=valuationQuoteDate(quoteAsOf);
  if(!sharesDate||!quoteDate||quoteDate<sharesDate)return null;
  return {capINR:priceINR*stock.verifiedSharesOutstanding,capUSD:priceINR*stock.verifiedSharesOutstanding/usdINR/1e9,estimated:false,basis:'Official outstanding shares as of '+stock.shareCountDate+' × latest INR price',shareCountDate:stock.shareCountDate,source:stock.shareCountSource};
 }
 if(!(stock.cap>0&&stock.price>0))return null;
 const impliedShares=stock.cap*1e9/stock.price;
 return {capINR:impliedShares*priceINR,capUSD:impliedShares*priceINR/usdINR/1e9,estimated:true,basis:'Price-scaled estimate: fixed implied shares from dated market cap and domestic price; not adjusted for share-count changes',impliedShares};
}

function isRecentIPO(stock,now=new Date()){
 if(!stock.verifiedListingDate)return false;
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const [year,month,day]=today.split('-').map(Number),cutoff=new Date(Date.UTC(year,month-4,1));
 const lastDay=new Date(Date.UTC(cutoff.getUTCFullYear(),cutoff.getUTCMonth()+1,0)).getUTCDate();
 cutoff.setUTCDate(Math.min(day,lastDay));
 return stock.verifiedListingDate>=cutoff.toISOString().slice(0,10)&&stock.verifiedListingDate<=today;
}
