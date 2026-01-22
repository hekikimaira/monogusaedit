// Service Worker for ものぐさ手帳
const CACHE_NAME = 'monogusa-techo-v1';
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon192.png',
  './icon512.png'
];

// インストール時：ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('キャッシュを作成中...');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => {
        // 即座にアクティブ化
        return self.skipWaiting();
      })
  );
});

// アクティブ化時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('古いキャッシュを削除:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 全てのクライアントを即座に制御
        return self.clients.claim();
      })
  );
});

// フェッチ時：キャッシュ優先、なければネットワーク
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // キャッシュがあればそれを返す
          return cachedResponse;
        }
        
        // なければネットワークから取得
        return fetch(event.request)
          .then((response) => {
            // 有効なレスポンスならキャッシュに追加
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // オフラインでキャッシュもない場合
            // 必要に応じてオフラインページを返せる
          });
      })
  );
});
