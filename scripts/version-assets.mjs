import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const index=new URL('../dist/index.html',import.meta.url),root=new URL('../dist/',import.meta.url);
export async function versionedHTML(){
 let html=await readFile(index,'utf8');
 const matches=[...html.matchAll(/((?:src|href)=")([^"?]+\.(?:js|css))(?:\?v=[^" ]+)?/g)];
 for(const match of matches){if(!/^[a-z0-9-]+\.(js|css)$/.test(match[2]))throw Error('Unexpected local asset path');const hash=createHash('sha256').update(await readFile(new URL(match[2],root))).digest('hex').slice(0,12);html=html.replace(match[0],match[1]+match[2]+'?v='+hash)}
 return html;
}
export async function verifyAssetVersions(){if(await readFile(index,'utf8')!==await versionedHTML())throw Error('Asset versions are stale. Run npm run version:assets before checking.')}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){await writeFile(index,await versionedHTML());try{await readFile(new URL('public-pages-manifest.json',root));await (await import('../build-public-pages.mjs')).buildPublicPages()}catch(error){if(error.code!=='ENOENT')throw error}console.log('Local asset versions updated.')}
