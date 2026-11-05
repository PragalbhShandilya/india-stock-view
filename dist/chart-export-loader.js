// Export code is unnecessary for rankings/sectors/watchlists; load it on chart routes.
const chartExportSource=document.currentScript.dataset.exportSrc;
let chartExportLoading=null;
function ensureChartExports(){
 if(!/^#(?:charts|compare|stock\/|index\/)/.test(location.hash))return;
 if(!chartExportLoading)chartExportLoading=import(new URL(chartExportSource,document.baseURI).href).catch(()=>{chartExportLoading=null;if(typeof toast==='function')toast('Chart downloads could not load. Reopen this page to retry.')});
}
window.addEventListener('hashchange',ensureChartExports);
ensureChartExports();
