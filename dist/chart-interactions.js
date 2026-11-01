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
function attachChartInteraction(svg,series,bounds){
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
 svg.setAttribute('tabindex','0');svg.setAttribute('aria-description','Move pointer for values. Press and drag to compare two observations. Use left and right arrow keys, Shift plus arrows to compare, Escape to clear.');svg.classList.add('interactive-chart');
 let anchor=null,current=bounds.right,dragging=false,pinned=false,keyboardIndex=series[0].points.length-1,pointer=null;
 const nearest=(s,x)=>s.points.reduce((a,p)=>Math.abs(p.x-x)<Math.abs(a.x-x)?p:a);
 function show(x){current=nearest(series[0],Math.max(bounds.left,Math.min(bounds.right,x))).x;keyboardIndex=series[0].points.findIndex(p=>p.x===current);group.style.display='';tooltip.setAttribute('aria-live',pointer?'off':'polite');tooltip.hidden=false;cross.setAttribute('x1',current);cross.setAttribute('x2',current);selection.style.display=startLine.style.display=anchor==null?'none':'';if(anchor!=null){selection.setAttribute('x',Math.min(anchor,current));selection.setAttribute('width',Math.abs(current-anchor));startLine.setAttribute('x1',anchor);startLine.setAttribute('x2',anchor)}
  const label=(anchor==null?'':nearest(series[0],anchor).label+' → ')+nearest(series[0],current).label;tooltip.innerHTML=`<strong>${escapeHtml(label)}</strong>${series.map((s,i)=>{const p=nearest(s,current),a=anchor==null?null:nearest(s,anchor);dots[i].setAttribute('cx',p.x);dots[i].setAttribute('cy',p.y);return `<div class="chart-tooltip-row"><i style="background:${s.color}"></i><span>${escapeHtml(s.name)}</span><b>${escapeHtml(s.format(p.value))}${p.price!=null&&s.formatPrice&&s.format(p.value)!==s.formatPrice(p.price)?' · '+escapeHtml(s.formatPrice(p.price)):''}</b>${a?`<small>${escapeHtml(s.format(a.value))} → ${escapeHtml(s.format(p.value))} · <em class="${p.value>=a.value?'positive':'negative'}">${escapeHtml(s.difference(a.value,p.value,a,p))}</em></small>`:''}</div>`}).join('')}${bounds.relative?'<small>Relative levels only · exact prices unavailable</small>':''}`;
  const rect=svg.getBoundingClientRect(),width=svg.viewBox.baseVal.width;positionChartTooltip(tooltip,pointer?.x??rect.left+current/width*rect.width,pointer?.y??rect.top+rect.height/2);
 }
 const pointerX=e=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse()).x};
 svg.addEventListener('pointermove',e=>{if(pinned&&!dragging)return;pointer={x:e.clientX,y:e.clientY};show(pointerX(e))});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;pointer={x:e.clientX,y:e.clientY};e.preventDefault();svg.focus({preventScroll:true});pinned=false;anchor=nearest(series[0],Math.max(bounds.left,Math.min(bounds.right,pointerX(e)))).x;dragging=true;svg.setPointerCapture(e.pointerId);show(anchor)});
 svg.addEventListener('pointerup',e=>{dragging=false;const end=nearest(series[0],Math.max(bounds.left,Math.min(bounds.right,pointerX(e)))).x;pinned=anchor!==end;if(!pinned)anchor=null;if(svg.hasPointerCapture(e.pointerId))svg.releasePointerCapture(e.pointerId);show(pointerX(e))});
 svg.addEventListener('pointercancel',()=>{dragging=false;anchor=null;group.style.display='none';tooltip.hidden=true});
 svg.addEventListener('pointerleave',()=>{if(!dragging&&anchor==null){group.style.display='none';tooltip.hidden=true}});
 svg.addEventListener('keydown',e=>{pointer=null;if(e.key==='Escape'){pinned=false;anchor=null;tooltip.hidden=true;group.style.display='none';return}if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const pts=series[0].points;if(e.shiftKey&&anchor==null)anchor=current;if(!e.shiftKey){anchor=null;pinned=false;}keyboardIndex=e.key==='Home'?0:e.key==='End'?pts.length-1:Math.max(0,Math.min(pts.length-1,keyboardIndex+(e.key==='ArrowRight'?1:-1)));show(pts[keyboardIndex].x);requestAnimationFrame(()=>{if(document.activeElement===svg)show(current)})});
 svg.addEventListener('blur',()=>{anchor=null;pinned=false;tooltip.hidden=true;group.style.display='none'});
 const hint=document.createElement('p');hint.className='note chart-interaction-hint';hint.textContent='Hover or use ← → for values · Drag to compare · Esc clears';parent.append(hint);
}
