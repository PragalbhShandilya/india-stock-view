function positionChartTooltip(tooltip,x,y){const gap=24,pad=8,w=tooltip.offsetWidth,h=tooltip.offsetHeight;let left=x+gap,top=y+gap;if(left+w>window.innerWidth-pad)left=x-gap-w;if(top+h>window.innerHeight-pad)top=y-gap-h;tooltip.style.left=Math.max(pad,Math.min(left,window.innerWidth-w-pad))+'px';tooltip.style.top=Math.max(pad,Math.min(top,window.innerHeight-h-pad))+'px'}
window.addEventListener('scroll',()=>document.querySelectorAll('.chart-tooltip,.scatter-tooltip,.treemap-tooltip').forEach(t=>t.hidden=true),true);
function relativeDateLabel(progress,days=30){const date=new Date(Date.UTC(2026,9,30)-Math.round((1-progress)*days)*86400000);return '≈ '+date.toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'})}
// Values are source observations. Relative graphics never masquerade as prices.
function relativeTrendSeries(stock,color,days=30){
 if(!stock.sparkline||!/^[ML0-9,. \-]+$/.test(stock.sparkline))return null;
 const nums=stock.sparkline.match(/-?\d+(?:\.\d+)?/g)?.map(Number)||[];
 let points=[];for(let i=0;i+1<nums.length;i+=2)points.push([nums[i],nums[i+1]]);
 if(points.length<2)return null;
 const first=points[0][0],last=points.at(-1)[0],start=last-(last-first)*days/30;
 points=points.filter(p=>p[0]>=start);if(points.length<2)return null;
 const low=Math.min(...points.map(p=>p[1])),high=Math.max(...points.map(p=>p[1]));
 return {name:stock.name,color,format:v=>v.toFixed(2)+' / 100',difference:(a,b)=>`${b-a>=0?'+':''}${(b-a).toFixed(2)} relative points`,points:points.map(p=>{const progress=(p[0]-points[0][0])/(last-points[0][0]);const value=high===low?50:(high-p[1])/(high-low)*100;return {x:64+progress*796,y:260-value/100*228,value,label:relativeDateLabel(progress,days)+' 2026 (approx.)'}})};
}
function bindRelativeOverlay(selected){const svg=document.querySelector('.compare-overlay .overlay-chart');if(!svg)return;const palette=['#397de0','#e69326','#16a580','#b16bde'];const series=selected.map((s,i)=>relativeTrendSeries(s,palette[i])).filter(Boolean);attachChartInteraction(svg,series,{left:64,right:860,top:32,bottom:260,relative:true});}
// Series geometry is ordered by time/x. Binary lookup keeps long histories cheap.
function nearestChartObservation(points,x){
 if(!points.length)return null;
 let low=0,high=points.length;
 while(low<high){const middle=(low+high)>>>1;if(points[middle].x<x)low=middle+1;else high=middle}
 if(!low)return points[0];if(low===points.length)return points.at(-1);
 return x-points[low-1].x<=points[low].x-x?points[low-1]:points[low];
}
function attachChartInteraction(svg,series,bounds,{dataState=null}={}){
 if(!svg||!series.length)return;
 const ns='http://www.w3.org/2000/svg',make=(tag,attrs)=>{const e=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);return e};
 const parent=svg.parentElement;parent.classList.add('interactive-chart-wrap');
 const card=svg.closest('.compare-overlay,.stock-chart-card');
 const controls=card?.querySelector('.range-buttons');if(controls){controls.classList.add('finance-timelines')}
 const axisGrid=make('g',{'class':'finance-time-grid','pointer-events':'none'});
 for(const fraction of [.25,.5,.75]){const x=bounds.left+(bounds.right-bounds.left)*fraction;axisGrid.append(make('line',{x1:x,x2:x,y1:bounds.top,y2:bounds.bottom}))}svg.prepend(axisGrid);
 const endpoints=make('g',{'class':'finance-endpoints','pointer-events':'none'});for(const s of series){const last=s.points.at(-1);endpoints.append(make('circle',{cx:last.x,cy:last.y,r:3.5,fill:s.color}))}svg.append(endpoints);
 const tooltip=document.createElement('div');tooltip.className='chart-tooltip';tooltip.hidden=true;tooltip.setAttribute('role','status');tooltip.setAttribute('aria-live','polite');parent.append(tooltip);
 const group=make('g',{'pointer-events':'none'}),selection=make('rect',{y:bounds.top,height:bounds.bottom-bounds.top,fill:'var(--green)',opacity:'.10'}),startLine=make('line',{y1:bounds.top,y2:bounds.bottom,stroke:'var(--muted)','stroke-dasharray':'4 4'}),cross=make('line',{y1:bounds.top,y2:bounds.bottom,stroke:'var(--muted)','stroke-dasharray':'3 3'});group.append(selection,startLine,cross);const dots=series.map(s=>{const c=make('circle',{r:4,fill:s.color,stroke:'var(--panel)','stroke-width':2});group.append(c);return c});group.style.display='none';svg.append(group);
 svg.setAttribute('tabindex','0');svg.setAttribute('role','group');svg.setAttribute('aria-roledescription','Interactive line chart');svg.setAttribute('aria-description','Move pointer for values. Press and drag to compare two observations. Use left and right arrow keys, Shift plus arrows to compare, Escape to clear.');svg.classList.add('interactive-chart');
 const timeline=[...new Map(series.flatMap(s=>s.points).map(p=>[p.x,p])).values()].sort((a,b)=>a.x-b.x),axisSeries={points:timeline},timelineIndices=new Map(timeline.map((point,i)=>[point.x,i]));
 let anchor=null,current=bounds.right,dragging=false,pinned=false,keyboardIndex=timeline.length-1,pointer=null;
 const nearest=(s,x)=>nearestChartObservation(s.points,x);
 function show(x){current=nearest(axisSeries,Math.max(bounds.left,Math.min(bounds.right,x))).x;keyboardIndex=timelineIndices.get(current);group.style.display='';tooltip.setAttribute('aria-live',pointer?'off':'polite');tooltip.hidden=false;cross.setAttribute('x1',current);cross.setAttribute('x2',current);selection.style.display=startLine.style.display=anchor==null?'none':'';if(anchor!=null){selection.setAttribute('x',Math.min(anchor,current));selection.setAttribute('width',Math.abs(current-anchor));startLine.setAttribute('x1',anchor);startLine.setAttribute('x2',anchor)}
  const label=(anchor==null?'':nearest(axisSeries,anchor).label+' → ')+nearest(axisSeries,current).label;tooltip.innerHTML=`<strong>${escapeHtml(label)}</strong>${series.map((s,i)=>{const at=x=>{const point=nearest(s,x);return point&&Math.abs(point.x-x)<1e-6?point:null},p=at(current),a=anchor==null?null:at(anchor);dots[i].style.display=p?'':'none';if(!p||anchor!=null&&!a)return `<div class="chart-tooltip-row"><span>${escapeHtml(s.name)}</span><b>—</b></div>`;dots[i].setAttribute('cx',p.x);dots[i].setAttribute('cy',p.y);if(a)return `<div class="chart-tooltip-row chart-tooltip-delta"><span>${escapeHtml(s.name)}</span><b class="${p.value>a.value?'positive':p.value<a.value?'negative':''}">${p.value>a.value?'↑ ':p.value<a.value?'↓ ':''}${escapeHtml(s.difference(a.value,p.value,a,p))}</b></div>`;return `<div class="chart-tooltip-row"><i style="background:${s.color}"></i><span>${escapeHtml(s.name)}</span><b>${escapeHtml(s.format(p.value))}${p.price!=null&&s.formatPrice&&s.format(p.value)!==s.formatPrice(p.price)?' · '+escapeHtml(s.formatPrice(p.price)):''}</b></div>`}).join('')}${bounds.relative?'<small>Relative levels only · exact prices unavailable</small>':''}`;
  const rect=svg.getBoundingClientRect(),width=svg.viewBox.baseVal.width;positionChartTooltip(tooltip,pointer?.x??rect.left+current/width*rect.width,pointer?.y??rect.top+rect.height/2);
 }
 const pointerX=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse()).x};
 svg.addEventListener('pointermove',e=>{if(pinned&&!dragging)return;pointer={x:e.clientX,y:e.clientY};show(pointerX(e))});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={x:e.clientX,y:e.clientY};e.preventDefault();svg.focus({preventScroll:true});pinned=false;anchor=nearest(axisSeries,Math.max(bounds.left,Math.min(bounds.right,pointerX(e)))).x;dragging=true;svg.setPointerCapture(e.pointerId);show(anchor)});
 svg.addEventListener('pointerup',e=>{dragging=false;const end=nearest(axisSeries,Math.max(bounds.left,Math.min(bounds.right,pointerX(e)))).x;pinned=anchor!==end;if(!pinned)anchor=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);show(pointerX(e))});
 svg.addEventListener('pointercancel',()=>{dragging=false;pinned=false;pointer=null;anchor=null;group.style.display='none';tooltip.hidden=true});
 svg.addEventListener('pointerleave',()=>{if(!dragging&&anchor==null){group.style.display='none';tooltip.hidden=true}});
 svg.addEventListener('keydown',e=>{pointer=null;if(e.key==='Escape'){pinned=false;anchor=null;tooltip.hidden=true;group.style.display='none';return}if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const pts=timeline;if(e.shiftKey&&anchor==null)anchor=current;if(!e.shiftKey){anchor=null;pinned=false;}keyboardIndex=e.key==='Home'?0:e.key==='End'?pts.length-1:Math.max(0,Math.min(pts.length-1,keyboardIndex+(e.key==='ArrowRight'?1:-1)));show(pts[keyboardIndex].x);requestAnimationFrame(()=>{if(document.activeElement===svg)show(current)})});
 svg.addEventListener('focus',()=>{if(!pointer)show(current)});
 svg.addEventListener('blur',()=>{pointer=null;anchor=null;pinned=false;tooltip.hidden=true;group.style.display='none'});
 const hint=document.createElement('p');hint.className='note chart-interaction-hint';hint.textContent='Hover or use ← → for values · Drag to compare · Esc clears';parent.append(hint);
 appendChartDataTable(parent,series,{open:Boolean(dataState?.open)});
 if(dataState)restoreChartDataState(parent,dataState);
}

// Fade between complete, factual SVGs; keep transient artwork out of interaction/export state.
function animateChartSwap(canvas,previousSVG){
 const svg=canvas.querySelector('svg');if(!svg)return;
 canvas.querySelectorAll('.chart-transition-layer').forEach(n=>n.remove());
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 canvas.classList.toggle('chart-first-draw',!previousSVG&&!reduced);
 if(!previousSVG||reduced||typeof svg.animate!=='function')return;
 const old=previousSVG.cloneNode(true);old.classList.add('chart-transition-layer');old.setAttribute('aria-hidden','true');old.removeAttribute('tabindex');old.removeAttribute('aria-label');old.setAttribute('focusable','false');old.querySelectorAll('[tabindex]').forEach(n=>n.removeAttribute('tabindex'));old.querySelectorAll('g[pointer-events="none"]:not(.finance-time-grid):not(.finance-endpoints)').forEach(n=>n.remove());canvas.append(old);
 const timing={duration:320,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'};
 svg.animate([{opacity:.15},{opacity:1}],timing).finished.catch(()=>{});
 const exit=old.animate([{opacity:.6},{opacity:0}],timing);exit.finished.catch(()=>{}).finally(()=>old.remove());
}

function captureChartDataState(parent){
 const details=parent.querySelector('.chart-data-details'),summary=details?.querySelector('summary'),regions=[...parent.querySelectorAll('.chart-data-scroll')],active=document.activeElement;
 return {open:Boolean(details?.open),focus:active===summary?'summary':regions.includes(active)?active.getAttribute('aria-label'):null,scroll:regions.map(region=>({label:region.getAttribute('aria-label'),top:region.scrollTop,left:region.scrollLeft}))};
}
function restoreChartDataState(parent,state){
 const regions=[...parent.querySelectorAll('.chart-data-scroll')];
 for(const saved of state.scroll){const region=regions.find(node=>node.getAttribute('aria-label')===saved.label);if(region){region.scrollTop=saved.top;region.scrollLeft=saved.left}}
 const target=state.focus==='summary'?parent.querySelector('.chart-data-details summary'):regions.find(node=>node.getAttribute('aria-label')===state.focus);
 if(state.focus&&parent.isConnected)target?.focus({preventScroll:true});
}
// Build the accessible alternative only when requested, keeping long histories cheap.
function appendChartDataTable(parent,series,{open=false}={}){
 const details=document.createElement('details');details.className='chart-data-details';
 const summary=document.createElement('summary');summary.textContent='View chart data';details.append(summary);
 let built=false;const build=()=>{if(!details.open||built)return;built=true;
  for(const s of series){const wrap=document.createElement('div');wrap.className='chart-data-scroll';wrap.setAttribute('tabindex','0');wrap.setAttribute('role','region');wrap.setAttribute('aria-label',s.name+' chart data');
   const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=s.name;table.append(caption);
   const head=document.createElement('thead'),heading=document.createElement('tr');
   const candleData=s.points.some(p=>['open','high','low','volume'].some(k=>Number.isFinite(p[k])));
   for(const label of ['Date / time','Value',...(candleData?['Open','High','Low','Close','Volume']:[])]){const th=document.createElement('th');th.scope='col';th.textContent=label;heading.append(th)}head.append(heading);table.append(head);
   const body=document.createElement('tbody');for(const point of s.points){const row=document.createElement('tr'),date=document.createElement('th'),value=document.createElement('td');date.scope='row';date.textContent=point.label;value.textContent=s.format(point.value);row.append(date,value);if(candleData){for(const key of ['open','high','low','price','volume']){const cell=document.createElement('td');cell.textContent=!Number.isFinite(point[key])?'—':key==='volume'?point[key].toLocaleString('en-IN'):s.formatPrice?s.formatPrice(point[key]):String(point[key]);row.append(cell)}}body.append(row)}table.append(body);wrap.append(table);details.append(wrap);
  }
 };details.addEventListener('toggle',build);parent.append(details);if(open){details.open=true;build()}return details;
}
