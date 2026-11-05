// Shared quantitative geometry. Prices remain in INR; formatting happens at display time.
function niceChartScale(values,{includeZero=false,count=5,nonNegative=false}={}){
 const finite=values.filter(Number.isFinite);if(!finite.length)return {min:0,max:1,ticks:[0,.25,.5,.75,1]};
 let min=Math.min(...finite),max=Math.max(...finite);if(includeZero){min=Math.min(0,min);max=Math.max(0,max)}
 const span=max-min||Math.max(Math.abs(max)*.04,1),padding=span*.08;if(!includeZero||min<0)min-=padding;max+=padding;
 const rough=(max-min)/Math.max(2,count-1),power=10**Math.floor(Math.log10(rough)),fraction=rough/power,step=([1,2,2.5,5,10].find(v=>v>=fraction)||10)*power;
 min=Math.floor(min/step)*step;max=Math.ceil(max/step)*step;if(nonNegative&&finite.every(v=>v>=0))min=Math.max(0,min);if(max===min)max=min+step;
 const ticks=[];for(let v=min;v<=max+step*.001;v+=step)ticks.push(Math.abs(v)<step*1e-8?0:Number(v.toPrecision(12)));
 return {min,max,step,ticks};
}
function preparePriceSeries(items,{comparison=false,range=null}={}){
 const clean=items.map(item=>({...item,points:[...new Map((item.points||[]).filter(p=>p&&typeof p==='object'&&Number.isFinite(Date.parse(p.time))&&Number.isFinite(p.price)&&p.price>0).map(p=>[Date.parse(p.time),{...p,time:new Date(p.time).toISOString()}])).values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time))}));
 return clean.map(item=>{
  let points=item.points;
  if(['5Y','MAX'].includes(range)){
   const weeks=new Map();for(const point of points){const date=new Date(Date.parse(point.time)+330*60000),day=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-day);weeks.set(date.toISOString().slice(0,10),point)}
   points=[...weeks.values()];
  }
  const base=points[0]?.price;
  return {...item,points:points.map(p=>({...p,value:comparison?(p.price/base-1)*100:p.price}))};
 });
}
function priceChartTimeScale(series,range){
 const points=[...new Map(series.flatMap(s=>s.points).map(p=>[p.time,p])).values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)),positions=new Map(points.map((p,i)=>[p.time,i])),first=Date.parse(points[0]?.time),last=Date.parse(points.at(-1)?.time),calendar=['6M','YTD','1Y','5Y','MAX'].includes(range);
 return {points,fraction:time=>calendar?(Date.parse(time)-first)/(last-first||1):(positions.get(time)||0)/(points.length-1||1)};
}
const chartDateFormatters=new Map();
function chartTimeLabel(time,range,full=false){
 const date=new Date(time);if(!Number.isFinite(date.getTime()))return 'Invalid Date';
 const intraday=range==='1D',withTime=intraday||range==='5D';
 const key=full?(withTime?'full-time':'full-date'):intraday?'time':['1Y','5Y','MAX'].includes(range)?'date-year':'date';
 if(!chartDateFormatters.has(key)){
  const options={timeZone:'Asia/Kolkata',...(full?{day:'numeric',month:'short',year:'numeric',...(withTime?{hour:'2-digit',minute:'2-digit'}:{})}:intraday?{hour:'numeric',minute:'2-digit'}:{day:'numeric',month:'short',...(['1Y','5Y','MAX'].includes(range)?{year:'2-digit'}:{})})};
  chartDateFormatters.set(key,new Intl.DateTimeFormat('en-IN',options));
 }
 return chartDateFormatters.get(key).format(date);
}

function chartObservationTicks(points,range,width=800){
 if(!points.length)return [];
 const monthly=['6M','YTD','1Y'].includes(range),yearly=['5Y','MAX'].includes(range);
 if(monthly||yearly){
  const times=points.map(p=>Date.parse(p.time)),first=times[0],last=times.at(-1),start=new Date(first+330*60000),finish=new Date(last+330*60000),boundaries=[];
  let year=start.getUTCFullYear(),month=yearly?0:start.getUTCMonth();
  while(year<finish.getUTCFullYear()||year===finish.getUTCFullYear()&&month<=finish.getUTCMonth()){
   const time=Date.UTC(year,month,1)-330*60000;
   if(time>=first&&time<=last)boundaries.push({time,year,month});
   if(yearly)year++;else if(++month===12){month=0;year++}
  }
  const maxTicks=Math.max(2,Math.floor((width-110)/55)),rough=Math.max(1,Math.ceil(boundaries.length/maxTicks)),step=yearly?([1,2,5,10,20,50,100].find(n=>n>=rough)||rough):rough;
  return boundaries.filter(b=>(yearly?b.year:b.year*12+b.month)%step===0).map(b=>{
   let hi=times.findIndex(t=>t>=b.time);if(hi<0)hi=times.length-1;
   const index=hi===0?0:hi-1+(b.time-times[hi-1])/(times[hi]-times[hi-1]);
   return {index,time:new Date(b.time).toISOString(),label:yearly?String(b.year):['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][b.month],calendar:true};
  });
 }
 const count=width<450?3:width<700?4:6;let indices=[];
 if(range==='5D'){
  indices=[0];for(let i=1;i<points.length;i++)if(points[i].time.slice(0,10)!==points[i-1].time.slice(0,10))indices.push(i);
  if(indices.length>count)indices=Array.from({length:count},(_,i)=>indices[Math.floor(i*(indices.length-1)/(count-1))]);
 }else indices=[...new Set(Array.from({length:Math.min(count,points.length)},(_,i)=>Math.round(i*(points.length-1)/(Math.min(count,points.length)-1||1))))];
 return indices.map(index=>({index,label:chartTimeLabel(points[index].time,range)}));
}

function marketChartUniverse(rows){const unique=new Map();for(const row of rows)if(row.isin&&Number.isFinite(row.cap)&&row.cap>0&&!unique.has(row.isin))unique.set(row.isin,row);return [...unique.values()]}
