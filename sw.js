var C = 'trener-v4';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(x){ return x !== C; }).map(function(x){ return caches.delete(x); }));
  }).then(function(){ return self.clients.claim(); }));
});
// страницу берём из сети (чтобы обновления приезжали сами), офлайн — из кэша
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  var isPage = e.request.mode === 'navigate' || e.request.destination === 'document';
  if (isPage) {
    e.respondWith(
      fetch(e.request).then(function(res){
        var cp = res.clone();
        caches.open(C).then(function(c){ c.put('./index.html', cp); });
        return res;
      }).catch(function(){ return caches.match('./index.html'); })
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r){
    return r || fetch(e.request).then(function(res){
      var cp = res.clone(); caches.open(C).then(function(c){ c.put(e.request, cp); }); return res;
    }).catch(function(){ return caches.match('./index.html'); });
  }));
});
