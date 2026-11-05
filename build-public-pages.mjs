import {readFile,writeFile,mkdir,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root=new URL('./dist/',import.meta.url),publicBase='https://pragalbhshandilya.github.io/india-stock-view/';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function publicPageHTML(template,{route,title,description,url,content,depth=1,noindex=false}){
 let html=template.replace('<html lang="en">','<html lang="en" data-initial-route="'+escape(route)+'">').replace('<base href="./">','<base href="'+'../'.repeat(depth)+'">');
 html=html.replace(/<title>[^<]*<\/title>/,'<title>'+escape(title)+'</title>');
 for(const key of ['description','twitter:description','og:description'])html=html.replace(new RegExp('(<meta (?:name|property)="'+key+'" content=")[^"]*'),(_,prefix)=>prefix+escape(description));
 for(const key of ['og:title','twitter:title'])html=html.replace(new RegExp('(<meta (?:name|property)="'+key+'" content=")[^"]*'),(_,prefix)=>prefix+escape(title));
 html=html.replace(/(<meta property="og:url" content=")[^"]*/,(_,prefix)=>prefix+escape(url)).replace(/(<link rel="canonical" href=")[^"]*/,(_,prefix)=>prefix+escape(url));
 if(noindex)html=html.replace('name="robots" content="index,follow"','name="robots" content="noindex,follow"');
 return html.replace('<div class="site-loading" role="status">Loading market data…</div>',content);
}
async function publicInputs(){
 const template=await readFile(new URL('index.html',root),'utf8'),financial=JSON.parse(await readFile(new URL('data.json',root),'utf8'));let directory;
 try{directory=JSON.parse(await readFile(new URL('./.local/master.json',import.meta.url),'utf8'))}catch{directory=JSON.parse(await readFile(new URL('instruments.json',root),'utf8'))}
 const universe=await readFile(new URL('ranking-universe.js',root),'utf8'),metadata=await readFile(new URL('page-metadata.js',root),'utf8'),ctx=vm.createContext({render(){},rows:financial.stocks,directory:directory.listings});vm.runInContext(universe+'\n'+metadata,ctx);
 const rows=vm.runInContext('mergeRankingUniverse(rows,directory).filter(s=>s.isin)',ctx).filter(s=>/^[A-Z0-9][A-Z0-9&._-]{0,99}$/.test(s.ticker));
 return {template,rows,ctx,hash:createHash('sha256').update(template).update(universe).update(metadata).update(JSON.stringify(rows.map(s=>[s.ticker,s.name,s.isin]))).digest('hex')};
}
export async function buildPublicPages(){
 const {template,rows,ctx,hash}=await publicInputs(),generated=[],urls=[publicBase];
 const pages={sectors:'Explore companies grouped by industry and sector.',charts:'Explore Indian market maps, movers and valuation charts.',compare:'Compare company fundamentals and historical prices.',watchlist:'Your watchlist stays private in this browser.',about:'Read sources, calculation methods and coverage limitations.'};
 for(const [route,summary]of Object.entries(pages)){ctx.route=route;const data=vm.runInContext('pageMetadata(route)',ctx),folder=new URL(route+'/',root);await mkdir(folder,{recursive:true});await writeFile(new URL('index.html',folder),publicPageHTML(template,{route,title:data.title,description:data.description,url:data.url,content:'<section class="card route-empty"><h1>'+escape(data.title.split(' | ')[0])+'</h1><p>'+escape(summary)+'</p><p>Loading interactive market data…</p></section>',noindex:route==='watchlist'}));generated.push(route+'/index.html');if(route!=='watchlist')urls.push(data.url)}
 const companies=new URL('companies/',root);await mkdir(companies,{recursive:true});let previous=[];try{previous=JSON.parse(await readFile(new URL('public-pages-manifest.json',root),'utf8')).generated||[]}catch{}const allowed=new Set(rows.map(r=>r.ticker));for(const entry of await readdir(companies,{withFileTypes:true}))if(entry.isDirectory()&&!allowed.has(entry.name)&&previous.includes('companies/'+entry.name+'/index.html'))await rm(new URL(entry.name+'/',companies),{recursive:true,force:true});
 for(const stock of rows){ctx.route='stock/'+encodeURIComponent(stock.ticker)+'/price';ctx.companyRows=[stock];const data=vm.runInContext('pageMetadata(route,companyRows)',ctx),folder=new URL(encodeURIComponent(stock.ticker)+'/',companies);await mkdir(folder,{recursive:true});const content='<section class="card route-empty"><h1>'+escape(stock.name)+'</h1><p>'+escape(stock.ticker)+' · ISIN '+escape(stock.isin)+' · India</p><p>Explore the company’s available share-price history, market capitalisation, reported financials and source details. Missing financial data is shown as unavailable.</p><p>Loading interactive company data…</p><a href="../../#rankings">Browse all Indian companies</a></section>';await writeFile(new URL('index.html',folder),publicPageHTML(template,{route:ctx.route,title:data.shareTitle||data.title,description:data.description,url:data.url,content,depth:2}));generated.push('companies/'+stock.ticker+'/index.html');urls.push(data.url)}
 const indices=vm.runInContext('PUBLIC_INDEX_IDS',ctx);
 for(const id of indices){ctx.route='index/'+encodeURIComponent(id);const data=vm.runInContext('pageMetadata(route)',ctx),folder=new URL('indices/'+encodeURIComponent(id)+'/',root);await mkdir(folder,{recursive:true});const label=id.replace(/^(NSE|BSE):/,'');const content='<section class="card route-empty"><h1>'+escape(label)+' index</h1><p>Explore historical index levels in points and compare percentage performance with Indian stocks and other indices.</p><p>Loading interactive index data…</p><a href="../../#compare">Compare performance</a></section>';await writeFile(new URL('index.html',folder),publicPageHTML(template,{route:ctx.route,title:data.title,description:data.description,url:data.url,content,depth:2}));generated.push('indices/'+id+'/index.html');urls.push(data.url)}
 await writeFile(new URL('sitemap.xml',root),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>'<url><loc>'+escape(url)+'</loc></url>').join('')+'</urlset>');
 await writeFile(new URL('robots.txt',root),'User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /india-stock-view/api/\nSitemap: '+publicBase+'sitemap.xml\n');
 await writeFile(new URL('public-pages-manifest.json',root),JSON.stringify({hash,companies:rows.length,pages:generated.length,generated},null,2));return {companies:rows.length,pages:generated.length};
}
export async function verifyPublicPages(){const {hash}=await publicInputs(),manifest=JSON.parse(await readFile(new URL('public-pages-manifest.json',root),'utf8'));if(manifest.hash!==hash)throw Error('Public pages are stale. Run npm run build:pages.');for(const file of manifest.generated)await readFile(new URL(file,root));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(await buildPublicPages());
