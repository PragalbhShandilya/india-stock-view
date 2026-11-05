// This is a private loopback service. Other websites must not start provider work.
export function localAPIRequestAllowed(headers,pathname){
 const host=headers.host;
 if(typeof host!=='string'||! /^(localhost|127\.0\.0\.1)(?::[0-9]{1,5})?$/.test(host))return false;
 const port=host.includes(':')?Number(host.split(':')[1]):80;if(port<1||port>65535)return false;
 if(!pathname.startsWith('/api/'))return true;
 const site=headers['sec-fetch-site'],mode=headers['sec-fetch-mode'],destination=headers['sec-fetch-dest'];
 // Provider redirects are top-level navigations; state+cookie validation still runs next.
 if(pathname==='/api/kite/callback'&&mode==='navigate'&&destination==='document')return true;
 if(headers.origin&&headers.origin!=='http://'+host)return false;
 if(site==='cross-site'||site==='same-site')return false;
 if(headers.referer){try{if(new URL(headers.referer).origin!=='http://'+host)return false}catch{return false}}
 return true;
}
