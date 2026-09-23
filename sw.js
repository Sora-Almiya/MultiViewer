// 同じサイト内のファイルだけを扱う（YouTube側の通信には触れない）
const CACHE = 'multiview-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  // ネット優先。HTTPキャッシュに寄り道すると更新が最大10分遅れるため、
  // 必ずサーバーへ確認しに行く（変更が無ければ304で済む）
  const fresh = new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(fresh).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
