// Работа без интернета: основа приложения хранится в телефоне, картинки — по мере просмотра
const V = 'slimstory-16';
const SHELL = ['./', 'index.html', 'start.html', 'privacy.html', 'app.js', 'imgcat.js', 'off.js', 'share.js', 'real.js', 'cafe.js', 'food.js', 'recipes.js', 'diets.js', 'cloud.js', 'vendor/firebase-app-compat.js', 'vendor/firebase-auth-compat.js', 'vendor/firebase-firestore-compat.js', 'data.js', 'vendor/zxing.min.js', 'icons/pack.svg', 'imgmap.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const img = u.pathname.includes('/img/') || u.host.includes('fonts.g');
  if (img) { // картинки и шрифт: сначала из памяти
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
    return;
  }
  if (u.origin !== location.origin) return;
  // код: свежий из сети, без сети — из памяти
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })
    .catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || caches.match('index.html'))));
});
