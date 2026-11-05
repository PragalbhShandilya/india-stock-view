// Isolate public-source failures: usable core data remains available with an explicit notice.
async function loadMarketSources(fetcher=fetch,onCoreReady=null){
 const specs=[['data.json','Company financials','stocks'],['instruments.json','Company directory','listings'],['official-shares.json','Official share counts','records'],['ipo-listings.json','Exchange IPO dates','records'],['reviewed-shares.json','Reviewed company records','records'],['supplemental-ipos.json','Supplementary IPO dates','records']];
 const settled=new Array(specs.length);
 const tasks=specs.map(async([file,,key])=>{const response=await fetcher(file,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Source unavailable');const value=await response.json();if(!value||!Array.isArray(value[key]))throw Error('Invalid source');if(key==='records'&&!value.records.every(r=>r&&typeof r==='object'&&!Array.isArray(r)))throw Error('Invalid supporting records');if(key==='stocks'&&!value.stocks.every(s=>s&&typeof s.name==='string'&&s.name.trim()&&typeof s.ticker==='string'&&s.ticker.trim()&&['source','logo','sparkline'].every(k=>s[k]==null||typeof s[k]==='string')&&['cap','price','change','changeMagnitude','earnings','revenue','pe','dividend','margin','employees','assets','netAssets','liabilities','debt','cash','pb','ps','eps','shares','borrow'].every(k=>s[k]==null||Number.isFinite(s[k]))))throw Error('Invalid company records');if(key==='listings'&&!value.listings.every(s=>s&&typeof s.name==='string'&&typeof s.symbol==='string'&&['NSE','BSE'].includes(s.exchange)))throw Error('Invalid directory records');return value}).map((task,i)=>task.then(value=>settled[i]={status:'fulfilled',value},reason=>settled[i]={status:'rejected',reason}));
 if(onCoreReady){await Promise.all(tasks.slice(0,2));const core=settled.slice(0,2).map((r,i)=>r.status==='fulfilled'?r.value:{[specs[i][2]]:[]});if((core[0].stocks.length||core[1].listings.length)&&tasks.some((_,i)=>i>1&&!settled[i])){const initial={data:specs.map((spec,i)=>settled[i]?.status==='fulfilled'?settled[i].value:{[spec[2]]:[]}),warnings:specs.flatMap((spec,i)=>settled[i]?.status==='rejected'?[spec[1]]:[])};initial.data[0].sources=initial.data[0].sources||{};onCoreReady(initial);}}
 const results=await Promise.all(tasks);
 const warnings=results.flatMap((r,i)=>r.status==='rejected'?[specs[i][1]]:[]);
 const data=results.map((r,i)=>r.status==='fulfilled'?r.value:{[specs[i][2]]:[]});
 if(!data[0].stocks.length&&!data[1].listings.length)throw Error('No company data available');
 data[0].sources=data[0].sources||{};
 return {data,warnings};
}
