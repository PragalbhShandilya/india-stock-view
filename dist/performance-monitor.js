// Opt-in, page-local diagnostics. No telemetry requests, identifiers or saved data.
if(new URLSearchParams(location.search).get('performance')==='1'){
 const report={navigationMs:0,firstPaintMs:null,largestPaintMs:null,layoutShift:0,layoutShiftSources:[],longTasks:0,longTaskMs:0,slowestInteractionMs:0,dataReadyMs:null},output=document.createElement('output');
 output.id='performance-metrics';output.hidden=true;document.body.append(output);
 const publish=()=>output.setAttribute('data-report',JSON.stringify(report));
 const observe=(type,callback,options={})=>{try{new PerformanceObserver(list=>{for(const entry of list.getEntries())callback(entry);publish()}).observe({type,buffered:true,...options})}catch{}};
 observe('paint',e=>{if(e.name==='first-contentful-paint')report.firstPaintMs=Math.round(e.startTime)});
 observe('largest-contentful-paint',e=>report.largestPaintMs=Math.round(e.startTime));
 observe('layout-shift',e=>{if(!e.hadRecentInput){report.layoutShift=+(report.layoutShift+e.value).toFixed(4);if(report.layoutShiftSources.length<12)report.layoutShiftSources.push({value:+e.value.toFixed(4),at:Math.round(e.startTime),nodes:(e.sources||[]).map(s=>({tag:s.node?.tagName,id:s.node?.id,classes:typeof s.node?.className==='string'?s.node.className:'',from:{x:s.previousRect.x,y:s.previousRect.y,w:s.previousRect.width,h:s.previousRect.height},to:{x:s.currentRect.x,y:s.currentRect.y,w:s.currentRect.width,h:s.currentRect.height}}))})}});
 observe('longtask',e=>{report.longTasks++;report.longTaskMs+=Math.round(e.duration)});
 observe('event',e=>{if(e.interactionId)report.slowestInteractionMs=Math.max(report.slowestInteractionMs,Math.round(e.duration))},{durationThreshold:16});
 const ready=new MutationObserver(()=>{if(document.querySelector('#content table,#content .charts-workspace,#content .stock-profile,#content .index-page')){report.dataReadyMs=Math.round(performance.now());publish();ready.disconnect()}});
 ready.observe(document.querySelector('#content'),{childList:true,subtree:true});
 window.addEventListener('load',()=>{report.navigationMs=Math.round(performance.now());publish()},{once:true});
 publish();
}
