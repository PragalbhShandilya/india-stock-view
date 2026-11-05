// Reconstruct a complete quote set in memory. A failed/mismatched delta requests a fresh set next time.
function createMarketDeltaStore(){
 let cursor=null,quotes=new Map(),indices=new Map();
 const reset=()=>{cursor=null;quotes=new Map();indices=new Map()};
 function records(rows){if(!Array.isArray(rows)||rows.some(q=>!q||typeof q.id!=='string'||!q.id||!Number.isFinite(q.price)||q.price<=0)||new Set(rows.map(q=>q.id)).size!==rows.length)throw Error('Invalid quote update');return rows}
 return {cursor:()=>cursor,reset,merge(payload){
  if(!payload.stream){reset();return payload}
  try{const stream=payload.stream,match=typeof stream.cursor==='string'&&stream.cursor.match(/^([a-f0-9]{24}):(0|[1-9][0-9]{0,14})$/);if(!match||!['full','delta'].includes(stream.mode)||!Number.isInteger(stream.quotes)||!Number.isInteger(stream.indices)||stream.quotes<0||stream.quotes>20000||stream.indices<0||stream.indices>200)throw Error('Invalid update cursor');
   if(stream.mode==='delta'&&(cursor===null||stream.base!==cursor||match[1]!==cursor.split(':')[0]||Number(match[2])<Number(cursor.split(':')[1])))throw Error('Quote update is out of sequence');
   const nextQuotes=stream.mode==='full'?new Map():new Map(quotes),nextIndices=stream.mode==='full'?new Map():new Map(indices);
   for(const q of records(payload.quotes))nextQuotes.set(q.id,q);for(const q of records(payload.indices||[]))nextIndices.set(q.id,q);
   if(nextQuotes.size!==stream.quotes||nextIndices.size!==stream.indices)throw Error('Quote update is incomplete');
   quotes=nextQuotes;indices=nextIndices;cursor=stream.cursor;return {...payload,quotes:[...quotes.values()],indices:[...indices.values()],marketRevision:cursor};
  }catch(error){reset();throw error}
 }};
}
function marketQuoteSignature(payload){return payload.marketRevision||JSON.stringify(payload.quotes.map(({receivedAt,...quote})=>quote))}
