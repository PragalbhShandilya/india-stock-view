function buildRankState(previous,rows,metric,ascending,now){
  const ordered=rows.filter(s=>typeof s[metric]==='number'&&Number.isFinite(s[metric])).sort((a,b)=>(ascending?a[metric]-b[metric]:b[metric]-a[metric])||a.rank-b.rank);
  const ranks=Object.fromEntries(ordered.map((s,i)=>[s.ticker,i+1]));
  const signature=JSON.stringify(ordered.map(s=>[s.ticker,s[metric]]));
  if(previous?.current?.signature===signature)return previous;
  return {current:{signature,ranks,at:now},previous:previous?.current||null};
}
function rankMovementBadge(stock,state){
  const rank=state.current.ranks[stock.ticker];
  if(rank==null)return '<span class="rank-current" title="No value available for this metric">—</span>';
  const oldRank=state.previous?.ranks[stock.ticker];
  let label='',direction='neutral',description='No earlier saved rank available';
  if(oldRank!=null){const delta=oldRank-rank;direction=delta>0?'positive':delta<0?'negative':'neutral';label=delta>0?'▲ '+delta:delta<0?'▼ '+Math.abs(delta):'';description=delta===0?'Unchanged versus previous saved ranking':`Moved ${Math.abs(delta)} position${Math.abs(delta)===1?'':'s'} ${delta>0?'up':'down'} versus previous saved ranking`}
  return `<span class="rank-group">${label?`<span class="rank-shift ${direction}" title="${description}" aria-label="${description}">${label}</span>`:''}<span class="rank-current">${rank}</span></span>`;
}
