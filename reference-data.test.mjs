import test from 'node:test';import assert from 'node:assert/strict';import {parseNSEReference,exchangeDate,parseIPOListings} from './reference-data.mjs';
const listing={symbol:'TEST',isin:'INE123A01010',group:'EQ'};
const data={equityResponse:[{metaData:{symbol:'TEST',isinCode:listing.isin,companyName:'Test Ltd'},secInfo:{classShare:'Equity',listingDate:'01-Oct-2026 00:00:00'},tradeInfo:{issuedSize:100000000,lastPrice:25},lastUpdateTime:'30-Oct-2026 16:00:00'}]};
test('official issued shares retain identity, date, source and do not use volume or free float',()=>{const r=parseNSEReference(data,listing,'2026-11-01T00:00:00Z');assert.equal(r.sharesOutstanding,100000000);assert.equal(r.effectiveDate,'2026-10-30');assert.equal(r.listingType,undefined);assert.match(r.source,/www.nseindia.com/)});
test('mismatched ISIN, non-equity and missing count are excluded',()=>{assert.equal(parseNSEReference(data,{...listing,isin:'INE999A01010'}),null);const bad=structuredClone(data);bad.equityResponse[0].secInfo.classShare='Debt';assert.equal(parseNSEReference(bad,listing),null);bad.equityResponse[0].secInfo.classShare='Equity';bad.equityResponse[0].tradeInfo.issuedSize=0;assert.equal(parseNSEReference(bad,listing),null)});
test('future source timestamps are excluded',()=>{assert.equal(parseNSEReference(data,listing,'2026-10-29T00:00:00Z'),null);assert.equal(exchangeDate('not a date'),null)});

test('IPO source excludes future, unmatched and non-equity issues and supports uppercase month names',()=>{const records=parseIPOListings([{symbol:'TEST',securityType:'EQ',listingDate:'28-OCT-2026',company:'Test Ltd'},{symbol:'TEST',securityType:'EQ',listingDate:'04-NOV-2026'},{symbol:'OTHER',securityType:'SME',listingDate:'10-SEP-2026'},{symbol:'TEST',securityType:'DEBT',listingDate:'01-OCT-2026'}],[{...listing,exchange:'NSE'}],'2026-11-01');assert.equal(records.length,1);assert.equal(records[0].listingDate,'2026-10-28');assert.equal(records[0].listingType,'IPO')});

test('reference quote timestamp, previous close, daily change and volume keep their source meaning',()=>{
 const source=structuredClone(data);Object.assign(source.equityResponse[0].metaData,{previousClose:24,pChange:4.17});source.equityResponse[0].tradeInfo.totalTradedVolume=500;
 const row=parseNSEReference(source,listing,'2026-11-01T00:00:00Z');assert.equal(row.referencePriceINR,25);assert.equal(row.referencePriceAt,'2026-10-30T16:00:00+05:30');assert.equal(row.referencePreviousCloseINR,24);assert.equal(row.referenceChangePercent,4.17);assert.equal(row.referenceVolume,500);assert.equal(row.referenceQuoteVersion,1);
 const missing=parseNSEReference(data,listing,'2026-11-01T00:00:00Z');assert.equal(missing.referenceChangePercent,null);assert.equal(missing.referenceVolume,null);
});
test('reference dates reject impossible days and use the current Indian calendar date',()=>{
 assert.equal(exchangeDate('31-Feb-2026 12:00:00'),null);
 const source=structuredClone(data);source.equityResponse[0].lastUpdateTime='02-Nov-2026 00:10:00';assert.ok(parseNSEReference(source,listing,'2026-11-01T19:00:00Z'));
});
