// Freeze asset/data resolution before in-app navigation changes the URL path.
const siteBaseElement=document.querySelector('base');
const ISV_LOCAL_BASE=new URL(siteBaseElement?.href||'./',location.href).href;
if(siteBaseElement)siteBaseElement.href=ISV_LOCAL_BASE;
const initialRoute=document.documentElement.dataset.initialRoute;
if(!location.hash&&initialRoute)history.replaceState(history.state,'',location.pathname+location.search+'#'+initialRoute);
let routeScrollHint=null;
function rememberRouteScroll(to){routeScrollHint={to,from:location.hash,top:window.scrollY}}
// Fragment links remain fast in-app navigation even on a company entry document.
document.addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const link=event.target.closest?.('a[href^="#"]'),href=link?.getAttribute('href');
 if(!href||!/^#(?:rankings|sectors|charts|compare|watchlist|about|stock\/|index\/)/.test(href))return;
 event.preventDefault();if(location.hash!==href){rememberRouteScroll(href);location.hash=href}
});
let publicRouteSet=null;
function publicPathAvailable(publicURL){
 const prefix='https://pragalbhshandilya.github.io/india-stock-view/',relative=publicURL.slice(prefix.length);
 if(!publicURL.startsWith(prefix))return false;
 if(!relative.startsWith('companies/')&&!relative.startsWith('indices/'))return true;
 return publicRouteSet?publicRouteSet.has(decodeURIComponent(relative)+'index.html'):location.pathname===new URL(relative,ISV_LOCAL_BASE).pathname;
}
function syncPublicPath(publicURL){
 const publicBase='https://pragalbhshandilya.github.io/india-stock-view/';
 if(!publicURL.startsWith(publicBase)||!publicPathAvailable(publicURL))return;
 const local=new URL(publicURL.includes('#')?'':publicURL.slice(publicBase.length),ISV_LOCAL_BASE);
 if(location.pathname!==local.pathname)history.replaceState(history.state,'',local.pathname+location.search+location.hash);
}

fetch('public-pages-manifest.json',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{if(!Array.isArray(data.generated))return;publicRouteSet=new Set(data.generated);if(typeof stocks!=='undefined'&&stocks.length&&typeof applyPageMetadata==='function')applyPageMetadata(pageMetadata(location.hash,stocks))}).catch(()=>{});
