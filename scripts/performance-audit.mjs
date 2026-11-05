import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import {performance} from 'node:perf_hooks';
import {sendResponse} from '../http-response.mjs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const app=await readFile(root+'dist/app.js','utf8'),trend=await readFile(root+'dist/zerodha-trends.js','utf8');
const directory=JSON.parse(await readFile(root+'dist/instruments.json','utf8')).listings;
const rows=directory.slice(0,5500).map((s,i)=>({...s,rank:i+1,ticker:s.symbol,cap:i,zerodhaTrend:{provider:'Zerodha Kite',state:'ready',windowStart:'2026-10-05',points:Array.from({length:21},(_,j)=>({date:'2026-10-'+String(j+5).padStart(2,'0'),price:100+Math.sin(i+j)}))}}));
const ctx=vm.createContext({stocks:rows,Date,tab:'rankings',rankingListingScope:'all',query:'',sector:'All sectors',listing:'All listings',feedMode:'kite',sortColumn:'trend',sortAsc:false,metric:'cap',watch:new Set(),compare:[],rankSortMap:{},stockTickerLabel:s=>s.ticker,matchesListingScope:()=>true});
vm.runInContext(trend.slice(trend.indexOf('function trendIndiaDate'),trend.indexOf('function zerodhaTrendMarkup')),ctx);
vm.runInContext(app.slice(app.indexOf('function chosen(){'),app.indexOf('\nlet rankSortMap=')),ctx);
function measure(fn,n=10){const samples=[];fn();for(let i=0;i<n;i++){const start=performance.now();fn();samples.push(performance.now()-start)}samples.sort((a,b)=>a-b);return {medianMs:+samples[Math.floor(n/2)].toFixed(2),maxMs:+samples.at(-1).toFixed(2)}}
const bytes=await readFile(root+'dist/official-shares.json'),res={setHeader(){},writeHead(){},end(){}};
const output={at:new Date().toISOString(),scope:'Local Node microbenchmark; 5,500 broker-directory names with synthetic 21-point trends, not browser load/Core Web Vitals',trendSort:measure(()=>vm.runInContext('chosen()',ctx),5),repeatedPublicGzip:measure(()=>sendResponse({method:'GET',headers:{'accept-encoding':'gzip'}},res,bytes,{cache:true}))};
console.log(JSON.stringify(output));await writeFile(root+'.local/performance-'+(process.argv[2]==='before'?'before':'after')+'.json',JSON.stringify(output,null,2));
