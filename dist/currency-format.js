function formatINR(value,compact=true){
  if(!Number.isFinite(value))return '—';
  const absolute=Math.abs(value),number=n=>n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  if(compact&&absolute>=1e12)return '₹'+number(value/1e12)+' L Cr';
  if(compact&&absolute>=1e10)return '₹'+number(value/1e10)+' T Cr';
  if(compact&&absolute>=1e7)return '₹'+number(value/1e7)+' Cr';
  if(compact&&absolute>=1e5)return '₹'+number(value/1e5)+' L';
  return '₹'+number(value);
}

function formatUSD(value){
 if(!Number.isFinite(value))return '—';
 const absolute=Math.abs(value),number=n=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 for(const [threshold,unit] of [[1e12,'T'],[1e9,'B'],[1e6,'M']])if(absolute>=threshold)return '$'+number(value/threshold)+' '+unit;
 return '$'+number(value);
}

const CHART_TIMELINES=['1D','5D','1M','6M','YTD','1Y','5Y','MAX'];
function chartTimelineControls(attribute,selected,available){return `<div class="range-buttons" role="group" aria-label="Chart timeline">${CHART_TIMELINES.map(range=>`<button ${attribute}="${range}" class="${selected===range?'active':''}" aria-pressed="${selected===range}" ${available.includes(range)?'': 'disabled title="Historical data for this range is not connected"'}>${range}</button>`).join('')}</div>`}
