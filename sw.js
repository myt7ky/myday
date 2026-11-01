const CACHE='myday-pwa-v54';
const CORE=['./','./index.html','./app/app.html?v=54','./app/redesign.js','./app/redesign.css','./assets/hero.webp','./manifest.webmanifest','./icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-180.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('myday-pwa-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==location.origin||u.pathname.includes('/api/'))return;
e.respondWith((async()=>{try{const res=await fetch(r);if(res.ok){const cache=await caches.open(CACHE);await cache.put(r,res.clone())}return res}catch{const cache=await caches.open(CACHE),hit=await cache.match(r,{ignoreSearch:true});if(hit)return hit;if(r.mode==='navigate')return await cache.match('./index.html');return Response.error()}})());
});
