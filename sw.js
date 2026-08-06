var C = 'trener-v1';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(x){ return x !== C; }).map(function(x){ return caches.delete(x); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).then(function(res){
        var cp = res.clone();
        caches.open(C).then(function(c){ c.put(e.request, cp); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
