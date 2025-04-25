self.addEventListener('install', event => {
  console.log('Service Worker 安裝成功');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker 啟用成功');
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});