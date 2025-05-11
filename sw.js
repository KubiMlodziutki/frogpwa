const cacheName = 'frog-pwa-v2';
const filesToCache = [
  'index.html', 'style.css', 'manifest.json', 'js/main.js',
  'images/icon-192.png', 'images/icon-512.png', 'images/portrait.jpg',
  ...Array.from({length:9}, (_, i)=>`images/zaba${i + 1}.jpg`),
  ...[
    '640-1136', '750-1334', '828-1792', '1125-2436', '1242-2688',
    '1536-2048', '1668-2224', '1668-2388', '2048-2732', '393-852'
  ].map(size=>`images/apple-splash-${size}.jpg`)
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(cacheName).then(c=>c.addAll(filesToCache)));
});

self.addEventListener('fetch', e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      if(e.request.method === 'GET'){
        const clone = resp.clone();
        caches.open(cacheName).then(c=>c.put(e.request, clone));
      }
      return resp;
    }))
  );
});

self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.map(k=>k !== cacheName && caches.delete(k))))
  );
});