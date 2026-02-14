// Service Worker for ものぐさ手帳
const CACHE_NAME = 'monogusa-techo-v3';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon192.png',
  './icon512.png'
];

// インストール時：即座にアクティブ化
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
  );
});

// アクティブ化時：古いキャッシュを全削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// フェッチ時：ネットワーク優先、失敗したらキャッシュ
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワーク成功 → キャッシュ更新して返す
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // オフライン → キャッシュから返す
        return caches.match(event.request);
      })
  );
});
