import {readFile,writeFile,rename,mkdir,open,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const months={Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12};
export function exchangeDate(value){const m=String(value||'').match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);if(!m||!months[m[2][0].toUpperCase()+m[2].slice(1).toLowerCase()])return null;const date=`${m[3]}-${String(months[m[2][0].toUpperCase()+m[2].slice(1).toLowerCase()]).padStart(2,'0')}-${m[1].padStart(2,'0')}`;return Number.isFinite(Date.parse(date))?date:null}
export function parseNSEReference(data,listing,fetchedAt=new Date().toISOString()){
 const row=data.equityResponse?.find(r=>r.metaData?.isinCode===listing.isin&&r.metaData?.symbol===listing.symbol&&r.secInfo?.classShare==='Equity');if(!row)return null;
 const count=Number(row.tradeInfo?.issuedSize),date=exchangeDate(row.lastUpdateTime);if(!Number.isSafeInteger(count)||count<=0||!date||date>fetchedAt.slice(0,10))return null;
 return {isin:listing.isin,name:row.metaData.companyName,symbol:listing.symbol,sharesOutstanding:count,effectiveDate:date,fetchedAt,listingDate:exchangeDate(row.secInfo.listingDate),industry:row.secInfo.basicIndustry,exchangeSector:row.secInfo.sector,referencePriceINR:Number(row.tradeInfo.lastPrice)||null,source:nseReferenceURL(listing),sourceTitle:'NSE equity reference: issued shares',basis:'NSE tradeInfo.issuedSize; ordinary equity, matched by ISIN and symbol'};
}
export function nseReferenceURL(listing){return 'https://www.nseindia.com/api/NextApi/apiClient/GetQuoteApi?'+new URLSearchParams({functionName:'getSymbolData',marketType:'N',series:listing.group||'EQ',symbol:listing.symbol})}

export function parseIPOListings(rows,directory,asOf=new Date().toISOString().slice(0,10)){
 const bySymbol=new Map(directory.filter(l=>l.exchange==='NSE').map(l=>[l.symbol,l]));
 return rows.flatMap(r=>{const l=bySymbol.get(r.symbol),date=exchangeDate(r.listingDate);if(!l||!['EQ','SME'].includes(r.securityType)||!date||date>asOf)return [];return [{isin:l.isin,symbol:r.symbol,name:r.company||r.companyName,listingDate:date,listingType:'IPO',exchange:'NSE',source:'https://www.nseindia.com/api/public-past-issues',sourceTitle:'NSE public past issues'}]});
}
export async function syncIPOListings(directory){const r=await fetch('https://www.nseindia.com/api/public-past-issues',{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('IPO source unavailable');const rows=await r.json();if(!Array.isArray(rows)||!rows.length)throw Error('IPO source incomplete');const records=parseIPOListings(rows,directory);if(!records.length)throw Error('No matched IPO records');const file=new URL('./dist/ipo-listings.json',import.meta.url);await writeFile(new URL('./dist/ipo-listings.json.tmp',import.meta.url),JSON.stringify({updatedAt:new Date().toISOString(),source:'NSE public past issues',records}));await rename(new URL('./dist/ipo-listings.json.tmp',import.meta.url),file);return records}

async function runReferenceSync({limit=Infinity}={}){
 const root=new URL('./',import.meta.url);let master;try{master=JSON.parse(await readFile(new URL('.local/master.json',root)))}catch{master=JSON.parse(await readFile(new URL('dist/instruments.json',root)))}
 try{await syncIPOListings(master.listings)}catch{console.error('IPO history refresh unavailable; previous dates retained.')}
 const file=new URL('dist/official-shares.json',root),current=JSON.parse(await readFile(file)),records=current.records||[],today=new Date().toISOString().slice(0,10),latest=new Map(records.map(r=>[r.isin,r]));
 const baseline=JSON.parse(await readFile(new URL('dist/data.json',root))).stocks,covered=new Set(baseline.map(s=>s.ticker.replace(/\.(NS|BO)$/,'')));
 const unique=new Map();for(const l of master.listings.filter(l=>l.exchange==='NSE'))if(!unique.has(l.isin)||l.group==='EQ')unique.set(l.isin,l);
 const all=[...unique.values()],queue=all.filter(l=>latest.get(l.isin)?.fetchedAt?.slice(0,10)!==today).sort((a,b)=>Number(covered.has(a.symbol))-Number(covered.has(b.symbol))).slice(0,limit);
 const state={startedAt:new Date().toISOString(),state:'running',eligible:all.length,queued:queue.length,checked:0,verified:0,failed:0,bseOnly:new Set(master.listings.filter(l=>l.exchange==='BSE'&&!unique.has(l.isin)).map(l=>l.isin)).size,source:'NSE official equity reference',note:'BSE-only counts require official filings; no inferred counts are substituted.'};await mkdir(new URL('.local/',root),{recursive:true});
 let saving=Promise.resolve();function persist(){saving=saving.then(async()=>{const output={...current,updatedAt:today,coverage:{...state,totalVerifiedISINs:new Set(records.map(r=>r.isin)).size},records};await writeFile(new URL('dist/official-shares.json.tmp',root),JSON.stringify(output));await rename(new URL('dist/official-shares.json.tmp',root),file);await writeFile(new URL('.local/reference-sync.json',root),JSON.stringify(state))});return saving}
 let index=0,blocked=0;await persist();
 async function worker(){while(index<queue.length&&blocked<6){const l=queue[index++];try{const response=await fetch(nseReferenceURL(l),{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json','Referer':'https://www.nseindia.com/'},signal:AbortSignal.timeout(12000)});if([403,429].includes(response.status)){blocked++;throw Error('Source access restricted')}if(!response.ok)throw Error('Source unavailable');const r=parseNSEReference(await response.json(),l);if(!r)throw Error('Share count unavailable or identity mismatch');blocked=0;const old=records.findIndex(v=>v.isin===r.isin&&v.sourceTitle==='NSE equity reference: issued shares');if(old>=0)records[old]=r;else records.push(r);state.verified++}catch{state.failed++}state.checked++;if(state.checked%25===0){await persist();console.log(JSON.stringify({checked:state.checked,verified:state.verified,failed:state.failed,total:queue.length}))}await new Promise(r=>setTimeout(r,300))}}
 // One writer persists between batches; the public source is read with limited concurrency.
 await Promise.all([worker(),worker(),worker(),worker()]);state.state=blocked>=6?'source_unavailable':'complete';state.completedAt=new Date().toISOString();await persist();console.log(JSON.stringify(state));return state;
}
export async function syncReferences(options={}){
 const lock=new URL('./.local/reference-sync.lock',import.meta.url);await mkdir(new URL('./.local/',import.meta.url),{recursive:true});let handle;
 try{handle=await open(lock,'wx')}catch(error){if(error.code!=='EEXIST')throw error;let pid;try{pid=Number(await readFile(lock,'utf8'));process.kill(pid,0);return {state:'already_running'}}catch{await unlink(lock).catch(()=>{});handle=await open(lock,'wx')}}
 await handle.writeFile(String(process.pid));await handle.close();try{return await runReferenceSync(options)}finally{await unlink(lock).catch(()=>{})}
}
if(process.argv[1]===fileURLToPath(import.meta.url))await syncReferences({limit:Number(process.argv.find(a=>a.startsWith('--limit='))?.split('=')[1])||Infinity});
