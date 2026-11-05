import {randomBytes} from 'node:crypto';
// Keep one latest record/revision per instrument, rather than an unbounded change log.
export class MarketDeltas{
 constructor(){this.reset()}
 reset(){this.epoch=randomBytes(12).toString('hex');this.revision=0;this.records=new Map();this.provider=null}
 payload(payload,since=null){
  const entries=[...(payload.quotes||[]).map(q=>['q:'+q.id,q]),...(payload.indices||[]).map(q=>['i:'+q.id,q])],keys=new Set(entries.map(([key])=>key));
  if(this.provider!==payload.status.provider||[...this.records.keys()].some(key=>!keys.has(key)))this.reset();
  this.provider=payload.status.provider;
  const changed=[];for(const [key,quote]of entries){const signature=JSON.stringify({...quote,receivedAt:undefined});if(this.records.get(key)?.signature!==signature)changed.push([key,quote,signature])}
  if(changed.length){this.revision++;for(const [key,quote,signature]of changed)this.records.set(key,{quote,signature,revision:this.revision})}
  const cursor=this.epoch+':'+this.revision,match=typeof since==='string'&&since.match(/^([a-f0-9]{24}):(0|[1-9][0-9]{0,14})$/),delta=Boolean(match&&match[1]===this.epoch&&Number(match[2])<=this.revision),after=delta?Number(match[2]):-1,quotes=[],indices=[];
  for(const [key,record]of this.records)if(record.revision>after)(key.startsWith('q:')?quotes:indices).push(record.quote);
  return {...payload,quotes,indices,stream:{mode:delta?'delta':'full',cursor,base:delta?since:null,quotes:payload.quotes.length,indices:payload.indices?.length||0}};
 }
}
