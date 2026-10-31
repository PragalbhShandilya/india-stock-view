import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const context=vm.createContext({Date,Set,Map});vm.runInContext(await readFile(new URL('./dist/exchange-eod.js',import.meta.url),'utf8'),context);
function parse(csv,exchange='NSE'){context.csv=csv;context.exchange=exchange;return vm.runInContext('parseExchangeCSV(csv,exchange)',context)}
const header='TradDt,ISIN,TckrSymb,SctySrs,ClsPric,PrvsClsgPric,TtlTradgVol\n';
test('official closing-price rows preserve INR, date, ISIN and signed change',()=>{const r=parse(header+'2026-10-30,INE002A01018,RELIANCE,EQ,1400,1500,1000\n');assert.equal(r.date,'2026-10-30');assert.equal(r.quotes[0].price,1400);assert.equal(r.quotes[0].change,-100/1500*100)});
test('rejects webpages, mixed report dates, and missing quote fields',()=>{assert.throws(()=>parse('<html>blocked</html>'));assert.throws(()=>parse(header+'2026-10-30,INE002A01018,RELIANCE,EQ,1400,1500,1000\n2026-10-29,INE009A01021,INFY,EQ,100,99,200'));assert.throws(()=>parse(header+'2026-10-30,INE002A01018,RELIANCE,EQ,,1500,1000'))});
test('zero previous close does not invent a percentage return',()=>{assert.equal(parse(header+'2026-10-30,INE002A01018,RELIANCE,EQ,1400,0,1000').quotes[0].change,null)});
