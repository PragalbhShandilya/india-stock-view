export class HistoryRequestQueue{
 constructor({gap=350,concurrency=2}={}){this.gap=gap;this.concurrency=concurrency;this.active=0;this.nextAt=0;this.pending=[];this.timer=null}
 run(task,{background=false,key=''}={}){return new Promise((resolve,reject)=>{this.pending.push({task,background,key,resolve,reject});this.pump()})}
 promote(key){for(const item of this.pending)if(item.key===key)item.background=false;this.pump()}
 pump(){if(this.timer||this.active>=this.concurrency||!this.pending.length)return;const delay=this.nextAt-Date.now();if(delay>0){this.timer=setTimeout(()=>{this.timer=null;this.pump()},delay);return}const index=Math.max(0,this.pending.findIndex(item=>!item.background)),item=this.pending.splice(index,1)[0];this.active++;this.nextAt=Date.now()+this.gap;Promise.resolve().then(item.task).then(item.resolve,item.reject).finally(()=>{this.active--;this.pump()});this.pump()}
}
