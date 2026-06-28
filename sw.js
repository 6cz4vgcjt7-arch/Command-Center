const CACHE="seasons-v01-20260627";
const ASSETS=["./","./index.html","./style.css","./storage.js","./engine.js","./ui.js","./app.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",event=>{event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));});
