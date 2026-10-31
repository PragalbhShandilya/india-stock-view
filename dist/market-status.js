// NSE capital-market calendar, circular NSE/CMTR/71775 (12 Dec 2025).
const MARKET_HOLIDAYS_2026=new Set(['2026-01-26','2026-03-03','2026-03-26','2026-03-31','2026-04-03','2026-04-14','2026-05-01','2026-05-28','2026-06-26','2026-09-14','2026-10-02','2026-10-20','2026-11-10','2026-11-24','2026-12-25']);
function marketSession(now=new Date()){
 const india=new Date(now.getTime()+330*60000),date=india.toISOString().slice(0,10),day=india.getUTCDay(),minute=india.getUTCHours()*60+india.getUTCMinutes();
 if(date==='2026-11-08')return {state:'special',label:'Special session',reason:'Muhurat trading today; consult the exchange for session timings.'};
 if(day===0||day===6)return {state:'closed',label:'Market closed',reason:'Weekend'};
 if(india.getUTCFullYear()!==2026)return {state:'unknown',label:'Schedule unavailable',reason:'The exchange holiday calendar needs updating.'};
 if(MARKET_HOLIDAYS_2026.has(date))return {state:'closed',label:'Market closed',reason:'Exchange holiday'};
 const open=minute>=555&&minute<930;return {state:open?'open':'closed',label:open?'Market open':'Market closed',reason:open?'Regular equity session':'Outside regular equity hours'};
}
function updateMarketSession(){const badge=document.querySelector('#market-session');if(!badge)return;const status=marketSession();badge.className='market-session '+status.state;badge.textContent=status.label;badge.title=status.reason+' · Scheduled NSE equity hours: 09:15–15:30 IST. Calendar-based; exceptional halts or schedule changes are not monitored.'}
updateMarketSession();setInterval(updateMarketSession,15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateMarketSession()});
