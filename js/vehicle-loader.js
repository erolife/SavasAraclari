/* Classic script loader: catalog allowlist, shared requests, retry after failure. */
(function(){'use strict';
 window.createVehicleLoader=function(catalog,loadScript){
  const allowed=new Set(catalog.filter(v=>v.status==='live').map(v=>v.sim||v.id)),pending=new Map();
  const load=loadScript||(url=>new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=url;el.onload=resolve;el.onerror=()=>{el.remove();reject(new Error('Model dosyası yüklenemedi'));};document.head.append(el);}));
  function script(url){if(!pending.has(url))pending.set(url,Promise.resolve().then(()=>load(url)).catch(e=>{pending.delete(url);throw e;}));return pending.get(url);}
  return {has:id=>allowed.has(id),async prepare(id){if(!allowed.has(id))throw new Error('Bilinmeyen araç');if(id==='tiger'||id==='sahi')return;if(id==='enigma')await script('js/enigma-core.js');await script('js/vehicles/'+id+'.js');}};
 };
})();
