import {writeFile,rename} from 'node:fs/promises';
import {parseCSV} from './listings.mjs';
const source='https://www.niftyindices.com/IndexConstituent/ind_nifty50list.csv';
export async function refreshNifty50(fetcher=fetch){
 const response=await fetcher(source,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Official constituent list unavailable');
 const records=parseCSV(await response.text()).map(r=>({name:r['Company Name'],symbol:r.Symbol,isin:r['ISIN Code']}));
 if(records.length!==50||new Set(records.map(r=>r.isin)).size!==50||records.some(r=>!/^IN[A-Z0-9]{10}$/.test(r.isin)||!r.symbol||!r.name))throw Error('Invalid constituent list; previous file retained');
 const file=new URL('./dist/nifty50.json',import.meta.url),temporary=new URL('./dist/nifty50.json.tmp',import.meta.url);
 await writeFile(temporary,JSON.stringify({index:'NIFTY 50',retrievedAt:new Date().toISOString(),source,records},null,2));await rename(temporary,file);return records.length;
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).href===import.meta.url){console.log('Updated '+await refreshNifty50()+' official Nifty 50 constituents.');}
