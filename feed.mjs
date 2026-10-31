// Normalization for Global Datafeeds StreamAllSymbols messages.
// Both the verbose and compact batch formats are documented by the provider.
export const numeric = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
export function normalizeQuote(row) {
  const exchange=row.Exchange??row.E, symbol=row.InstrumentIdentifier??row.I;
  if(!['NSE','BSE'].includes(exchange)||typeof symbol!=='string'||!symbol.trim())return null;
  const price=numeric(row.LastTradePrice??row.LTP),seconds=numeric(row.LastTradeTime??row.LTT);
  if(price===null||price<0||seconds===null||seconds<=0)return null;
  const close=numeric(row.Close??row.C),absolute=numeric(row.PriceChange??row.PC);
  const change=numeric(row.PriceChangePercentage??row.PCP)??(close>0?(price-close)/close*100:null);
  return {id:`${exchange}:${symbol}`,exchange,symbol,name:symbol,price,change,absoluteChange:absolute,previousClose:close,volume:numeric(row.TotalQtyTraded??row.TTQ),open:numeric(row.Open??row.O),high:numeric(row.High??row.H),low:numeric(row.Low??row.L),lastTrade:new Date(seconds*1000).toISOString()};
}
export class FeedState {
  quotes=new Map();catalogue=new Map();state='not_configured';updatedAt=null;
  ingest(message){
    const rows=Array.isArray(message)?message:(message.T==='Batch'?message.data:[message]);let accepted=0;
    for(const raw of rows||[]){const quote=normalizeQuote(raw);if(!quote)continue;const old=this.quotes.get(quote.id);if(old&&old.lastTrade>quote.lastTrade)continue;this.quotes.set(quote.id,quote);accepted++;}
    if(accepted){this.updatedAt=new Date().toISOString();this.state='streaming'}return accepted;
  }
  payload(configured){return {status:{configured,provider:'Global Datafeeds',state:this.state,received:this.quotes.size,catalogueReceived:this.catalogue.size,updatedAt:this.updatedAt,coverage:'Received exchange listings; completeness unverified',currency:'INR'},quotes:[...this.quotes.values()].sort((a,b)=>a.id.localeCompare(b.id))}}
}
