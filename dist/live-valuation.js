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
 const latest=new Map();
 for(const r of records){
  let url;try{url=new URL(r.source)}catch{continue}
  if(!/^(www\.)?(bseindia\.com|nseindia\.com|nsearchives\.nseindia\.com)$/.test(url.hostname)||url.protocol!=='https:'||!/^INE[A-Z0-9]{9}$/.test(r.isin)||!Number.isSafeInteger(r.sharesOutstanding)||r.sharesOutstanding<=0||!/^\d{4}-\d{2}-\d{2}$/.test(r.effectiveDate)||r.effectiveDate>asOf)continue;
  if(!latest.has(r.isin)||latest.get(r.isin).effectiveDate<r.effectiveDate)latest.set(r.isin,r);
 }
 for(const stock of stocks){const r=latest.get(stock.isin);if(r){if(stock.directoryOnly&&r.name)stock.name=r.name;const officialSector=groupedExchangeSector(r);if(officialSector){stock.sector=officialSector;stock.sectorSource=r.source;}stock.verifiedSharesOutstanding=r.sharesOutstanding;stock.shares=r.sharesOutstanding;if(r.industry)stock.officialIndustry=r.industry;stock.referencePriceINR=r.referencePriceINR;stock.shareCountDate=r.effectiveDate;stock.shareCountSource=r.source;stock.shareCountSourceTitle=r.sourceTitle;if(r.listingType==='IPO')stock.verifiedListingDate=r.listingDate}}
 return stocks;
}
function calculateLiveMarketCap(stock,priceINR,usdINR){
 if(!Number.isFinite(priceINR)||priceINR<=0||!Number.isFinite(usdINR)||usdINR<=0)return null;
 // Overseas receipts are not interchangeable with the Indian ordinary share.
 if(!/\.(NS|BO)$/.test(stock.ticker||''))return null;
 if(Number.isFinite(stock.verifiedSharesOutstanding)&&stock.verifiedSharesOutstanding>0)return {capINR:priceINR*stock.verifiedSharesOutstanding,capUSD:priceINR*stock.verifiedSharesOutstanding/usdINR/1e9,estimated:false,basis:'Official outstanding shares as of '+stock.shareCountDate+' × latest INR price',shareCountDate:stock.shareCountDate,source:stock.shareCountSource};
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
