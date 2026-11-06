const CACHE='cineming-v8';
const DATA_CACHE='cineming-schedule';
const BASE=new URL('.',self.location).pathname;
const SCHEDULE=new URL('data/schedule.json',self.location);
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','index.html','style.css?v=7','film-utils.js?v=6','app.js?v=8','manifest.webmanifest','icon.png','imax.png'].map(x=>BASE+x))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cineming-v')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
async function schedule(){
 const cache=await caches.open(DATA_CACHE);
 const url=new URL(SCHEDULE);
 url.searchParams.set('refresh',Math.floor(Date.now()/300000));
 try{
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok)throw Error('Programmazione non raggiungibile');
  const copy=response.clone();
  const payload=await copy.json();
  if(!payload.cinemas || !payload.checkedAt)throw Error('Programmazione non valida');
  await cache.put(SCHEDULE,response.clone());
  return response;
 }catch{
  const saved=await cache.match(SCHEDULE);
  if(!saved)return Response.error();
  const headers=new Headers(saved.headers);
  headers.set('X-Cineming-Offline','1');
  return new Response(saved.body,{headers});
 }
}
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 if(e.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(url.pathname===SCHEDULE.pathname){e.respondWith(schedule());return}
 e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put(e.request,r.clone())}return r}).catch(()=>caches.match(e.request).then(r=>r||Response.error())));
});
