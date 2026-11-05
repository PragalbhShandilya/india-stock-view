// Preserve source quote identities, and attach directory entries by equity ISIN.
const reviewedSymbolChanges={
 'ICICIPRULI.NS':{symbol:'ICICILIFE',exchange:'NSE',isin:'INE726G01019',effectiveDate:'2026-10-23',name:'ICICI Life Insurance Limited',nameEffectiveDate:'2026-10-23',source:'https://nsearchives.nseindia.com/content/circulars/FAOP77013.pdf'},
 'WELSPUNIND.NS':{symbol:'WELSPUNLIV',exchange:'NSE',isin:'INE192B01031',effectiveDate:'2023-12-14',name:'Welspun Living Limited',nameEffectiveDate:'2023-12-14',source:'https://nsearchives.nseindia.com/content/circulars/CML59625.pdf'},
 'TIDEWATER.NS':{symbol:'VEEDOL',exchange:'NSE',isin:'INE484C01030',effectiveDate:'2024-10-09',name:'Veedol Corporation Limited',nameEffectiveDate:'2024-10-09',source:'https://nsearchives.nseindia.com/corporate/TIDEWATER_03102024181030_CML64320.pdf'},
 'HSIL.NS':{symbol:'AGI',exchange:'NSE',isin:'INE415A01038',effectiveDate:'2022-05-11',name:'AGI Greenpac Limited',nameEffectiveDate:'2022-05-11',source:'https://archives.nseindia.com/content/circulars/CML52200.pdf'},
 'HIL.NS':{symbol:'BIRLANU',exchange:'NSE',isin:'INE557A01011',effectiveDate:'2025-04-09',name:'BirlaNu Limited',nameEffectiveDate:'2025-03-19',source:'https://cms.birlanu.com/public/media/2025/04/07/se-cl-name-change-communication-dt-04042025signed.pdf'},
 'LTIM.NS':{symbol:'LTM',exchange:'NSE',isin:'INE214T01019',effectiveDate:'2026-02-27',name:'LTM Limited',nameEffectiveDate:'2026-04-17',source:'https://nsearchives.nseindia.com/content/circulars/CML72948.pdf',nameSource:'https://nsearchives.nseindia.com/content/circulars/CML73700.pdf'}
};
// Exclude subscription entitlements, including entries retained in older cached directories.
function isRightsEntitlementListing(row){return /-RE\d*$/i.test(String(row.symbol||row.trading_symbol||row.ticker||'').replace(/\.(NS|BO)$/,''))||/\brights? entitlement\b/i.test(row.name||'')}
function mergeRankingUniverse(snapshot, directory, asOf=new Date().toISOString().slice(0,10)) {
  directory=directory.filter(row=>!isRightsEntitlementListing(row));
  snapshot=snapshot.filter(row=>!isRightsEntitlementListing(row));
  const groups=new Map(),byListing=new Map();
  for(const entry of directory){const key=JSON.stringify([entry.exchange,entry.symbol]);if(!byListing.has(key))byListing.set(key,[]);byListing.get(key).push(entry);if(!entry.isin)continue;if(!groups.has(entry.isin))groups.set(entry.isin,[]);groups.get(entry.isin).push(entry)}
  const aliases={HDB:'HDFCBANK',IBN:'ICICIBANK',INFY:'INFY',WIT:'WIPRO',RDY:'DRREDDY'};
  const represented=new Set();
  const result=snapshot.map(stock=>{
    const reviewed=reviewedSymbolChanges[stock.ticker],change=reviewed?.effectiveDate<=asOf?reviewed:null;
    const symbol=change?.symbol||aliases[stock.ticker]||stock.ticker.replace(/\.(NS|BO)$/,'');
    const exchange=stock.ticker.endsWith('.BO')?'BSE':'NSE';
    const matches=byListing.get(JSON.stringify([exchange,symbol]))||[];
    const entry=change?matches.find(d=>d.isin===change.isin):matches[0];
    if(entry)represented.add(entry.isin);
    return {...stock,...(entry&&change?{name:change.nameEffectiveDate<=asOf?change.name:stock.name,aliases:[...(stock.aliases||[]),stock.name,stock.ticker],sourceTicker:stock.ticker,ticker:entry.symbol+(entry.exchange==='NSE'?'.NS':'.BO'),currentTicker:entry.symbol+(entry.exchange==='NSE'?'.NS':'.BO'),identitySource:change.source,identityNameSource:change.nameSource,identityEffectiveDate:change.effectiveDate}:{}),isin:entry?.isin||null,exchangeListings:entry?groups.get(entry.isin):[],directoryOnly:false};
  });
  const additions=[];
  for(const [isin,entries] of groups){if(represented.has(isin))continue;const entry=entries.find(e=>e.exchange==='NSE')||entries[0];additions.push({name:entry.name,ticker:entry.symbol+(entry.exchange==='NSE'?'.NS':'.BO'),isin,exchangeListings:entries,directoryOnly:true,cap:null,price:null,change:null,sector:'Unclassified'})}
  additions.sort((a,b)=>a.name.localeCompare(b.name));
  const unique=[],byISIN=new Map();
  for(const stock of [...result,...additions]){
    if(!stock.isin||!byISIN.has(stock.isin)){if(stock.isin)byISIN.set(stock.isin,unique.length);unique.push(stock);continue}
    const index=byISIN.get(stock.isin),old=unique[index],currentSymbols=new Set(stock.exchangeListings.map(l=>l.symbol+(l.exchange==='NSE'?'.NS':'.BO'))),preferred=currentSymbols.has(stock.sourceTicker||stock.ticker)&&!currentSymbols.has(old.sourceTicker||old.ticker)?stock:old,other=preferred===stock?old:stock;
    unique[index]={...preferred,aliases:[...new Set([...(preferred.aliases||[]),...(other.aliases||[]),other.ticker,other.name])],identitySource:preferred.identitySource||other.identitySource,identityNameSource:preferred.identityNameSource||other.identityNameSource,identityEffectiveDate:preferred.identityEffectiveDate||other.identityEffectiveDate};
  }
  return unique.map((stock,i)=>({...stock,rank:i+1}));
}

function resolveStockIdentity(rows,ticker){return rows.find(s=>s.ticker===ticker)||rows.find(s=>s.aliases?.includes(ticker))}
function canonicalSavedTickers(rows,tickers){return [...new Set(tickers.map(t=>resolveStockIdentity(rows,t)?.ticker||t))]}

// Match headline totals to the chart universe; unverified legacy rows remain searchable.
function rankingMarketSummary(rows){
 const unique=new Map();for(const row of rows)if(row.isin&&!unique.has(row.isin))unique.set(row.isin,row);
 const companies=[...unique.values()],valued=companies.filter(s=>Number.isFinite(s.cap)&&s.cap>0);
 return {companies:companies.length,valued:valued.length,cap:valued.reduce((sum,s)=>sum+s.cap,0),advancers:companies.filter(s=>Number.isFinite(s.change)&&s.change>0).length,decliners:companies.filter(s=>Number.isFinite(s.change)&&s.change<0).length,unresolved:rows.filter(s=>!s.isin).length};
}
