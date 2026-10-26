/* Local record IDs only; no authentication or security token is generated here. */
function portableUuid(){
 const c=globalThis.crypto;
 if(typeof c?.randomUUID==='function')return c.randomUUID();
 if(typeof c?.getRandomValues==='function'){
  const a=new Uint8Array(16);c.getRandomValues(a);a[6]=(a[6]&15)|64;a[8]=(a[8]&63)|128;
  const h=Array.from(a,n=>n.toString(16).padStart(2,'0')).join('');
  return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');
 }
 return 'record-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)+'-'+Math.random().toString(36).slice(2);
}
