import test from 'node:test';import assert from 'node:assert/strict';import {localAPIRequestAllowed as allowed} from './request-policy.mjs';
const base={host:'127.0.0.1:4174'};
test('local API rejects cross-origin browsers while same-origin polling and direct local tools remain usable',()=>{
 assert.equal(allowed(base,'/api/market'),true);
 assert.equal(allowed({...base,origin:'http://127.0.0.1:4174','sec-fetch-site':'same-origin'},'/api/market'),true);
 for(const route of ['/api/market','/api/kite/login','/api/kite/preload','/api/kite/history','/api/trends']){for(const site of ['cross-site','same-site'])assert.equal(allowed({...base,'sec-fetch-site':site},route),false);assert.equal(allowed({...base,origin:'https://other.example'},route),false);assert.equal(allowed({...base,referer:'https://other.example/page'},route),false);assert.equal(allowed({...base,origin:'null'},route),false)}
 assert.equal(allowed({...base,origin:'http://127.0.0.1:4175'},'/api/market'),false);
 assert.equal(allowed({...base,'sec-fetch-site':'none'},'/api/kite/login'),true);
});
test('only top-level cross-site broker callbacks can reach the existing state validation',()=>{
 const cross={...base,'sec-fetch-site':'cross-site'};assert.equal(allowed({...cross,'sec-fetch-mode':'navigate','sec-fetch-dest':'document'},'/api/kite/callback'),true);
 for(const destination of ['iframe','image','empty'])assert.equal(allowed({...cross,'sec-fetch-mode':'navigate','sec-fetch-dest':destination},'/api/kite/callback'),false);
 assert.equal(allowed({...cross,'sec-fetch-mode':'cors','sec-fetch-dest':'empty'},'/api/kite/callback'),false);
});
test('Host validation rejects aliases, credentials and invalid port spellings without blocking public assets',()=>{
 for(const host of ['127.0.0.1.evil.test:4174','localhost@evil.test','localhost:0','localhost:65536','localhost:abc','localhost:4174:80','[::1]:4174','evil.test'])assert.equal(allowed({host},'/api/market'),false);
 assert.equal(allowed({host:'localhost:4174'},'/api/market'),true);assert.equal(allowed({...base,'sec-fetch-site':'cross-site'},'/favicon.svg'),true);
});
