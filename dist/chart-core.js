// Shared quantitative geometry. Prices remain in INR; formatting happens at display time.
function niceChartScale(values,{includeZero=false,count=5}={}){
 const finite=values.filter(Number.isFinite);if(!finite.length)return {min:0,max:1,ticks:[0,.25,.5,.75,1]};
 let min=Math.min(...finite),max=Math.max(...finite);if(includeZero){min=Math.min(0,min);max=Math.max(0,max)}
 const span=max-min||Math.max(Math.abs(max)*.04,1),padding=span*.08;if(!includeZero||min<0)min-=padding;max+=padding;
 const rough=(max-min)/Math.max(2,count-1),power=10**Math.floor(Math.log10(rough)),fraction=rough/power,step=([1,2,2.5,5,10].find(v=>v>=fraction)||10)*power;
 min=Math.floor(min/step)*step;max=Math.ceil(max/step)*step;if(max===min)max=min+step;
 const ticks=[];for(let v=min;v<=max+step*.001;v+=step)ticks.push(Math.abs(v)<step*1e-8?0:Number(v.toPrecision(12)));
 return {min,max,step,ticks};
}
function preparePriceSeries(items,{comparison=false}={}){
 const clean=items.map(item=>({...item,points:[...new Map((item.points||[]).filter(p=>Number.isFinite(Date.parse(p.time))&&Number.isFinite(p.price)&&p.price>0).map(p=>[Date.parse(p.time),{...p,time:new Date(p.time).toISOString()}])).values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time))}));
 if(!clean.length)return [];let common=new Set(clean[0].points.map(p=>p.time));for(const item of clean.slice(1)){const times=new Set(item.points.map(p=>p.time));common=new Set([...common].filter(t=>times.has(t)))}
 return clean.map(item=>{const points=item.points.filter(p=>common.has(p.time)),base=points[0]?.price;return {...item,points:points.map(p=>({...p,value:comparison?(p.price/base-1)*100:p.price}))}});
}
function chartTimeLabel(time,range,full=false){const date=new Date(time),intraday=range==='1D',options={timeZone:'Asia/Kolkata',...(full?{day:'numeric',month:'short',year:'numeric',hour:range==='1D'||range==='5D'?'2-digit':undefined,minute:range==='1D'||range==='5D'?'2-digit':undefined}:intraday?{hour:'numeric',minute:'2-digit'}:{day:'numeric',month:'short',...(['1Y','5Y','MAX'].includes(range)?{year:'2-digit'}:{})})};return date.toLocaleString('en-IN',options)}
function chartObservationTicks(points,range,width=800){
 if(!points.length)return [];const count=width<450?3:width<700?4:6;let indices=[];
 if(range==='5D'){indices=[0];for(let i=1;i<points.length;i++)if(points[i].time.slice(0,10)!==points[i-1].time.slice(0,10))indices.push(i);indices.push(points.length-1);indices=[...new Set(indices)];if(indices.length>count)indices=Array.from({length:count},(_,i)=>indices[Math.floor(i*(indices.length-1)/(count-1))]);}
 else indices=[...new Set(Array.from({length:Math.min(count,points.length)},(_,i)=>Math.round(i*(points.length-1)/(Math.min(count,points.length)-1||1))))];
 return indices.map((index,i)=>({index,label:range==='5D'&&i>0&&points[index].time.slice(0,10)===points[indices[i-1]].time.slice(0,10)?chartTimeLabel(points[index].time,'1D'):chartTimeLabel(points[index].time,range)}));
}
function marketChartUniverse(rows){const unique=new Map();for(const row of rows)if(row.isin&&Number.isFinite(row.cap)&&row.cap>0&&!unique.has(row.isin))unique.set(row.isin,row);return [...unique.values()]}
