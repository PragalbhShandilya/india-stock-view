// Preserve source quote identities, and attach directory entries by equity ISIN.
function mergeRankingUniverse(snapshot, directory) {
  const groups=new Map();
  for(const entry of directory){if(!entry.isin)continue;if(!groups.has(entry.isin))groups.set(entry.isin,[]);groups.get(entry.isin).push(entry)}
  const aliases={HDB:'HDFCBANK',IBN:'ICICIBANK',INFY:'INFY',WIT:'WIPRO',RDY:'DRREDDY'};
  const represented=new Set();
  const result=snapshot.map(stock=>{
    const symbol=aliases[stock.ticker]||stock.ticker.replace(/\.(NS|BO)$/,'');
    const exchange=stock.ticker.endsWith('.BO')?'BSE':'NSE';
    const entry=directory.find(d=>d.symbol===symbol&&d.exchange===exchange);
    if(entry)represented.add(entry.isin);
    return {...stock,isin:entry?.isin||null,exchangeListings:entry?groups.get(entry.isin):[],directoryOnly:false};
  });
  const additions=[];
  for(const [isin,entries] of groups){if(represented.has(isin))continue;const entry=entries.find(e=>e.exchange==='NSE')||entries[0];additions.push({name:entry.name,ticker:entry.symbol+(entry.exchange==='NSE'?'.NS':'.BO'),isin,exchangeListings:entries,directoryOnly:true,cap:null,price:null,change:null,sector:'Unclassified'})}
  additions.sort((a,b)=>a.name.localeCompare(b.name));
  return [...result,...additions].map((stock,i)=>({...stock,rank:i+1}));
}
