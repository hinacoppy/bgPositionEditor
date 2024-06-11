/* serviceWorker.js */
// (参考) https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
'use strict';

const cacheName = 'bgPositionEdtor-v20240105';
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const contentToCache = [
  ORIGIN + '/bgPositionEdtor/',
  ORIGIN + '/bgPositionEdtor/index.html',
  ORIGIN + '/bgPositionEdtor/manifest.json',
  ORIGIN + '/bgPositionEdtor/icon/favicon.ico',
  ORIGIN + '/bgPositionEdtor/icon/apple-touch-icon.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-96x96.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-192x192.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-512x512.png',
  ORIGIN + '/bgPositionEdtor/css/BG_position_editor.css',
  ORIGIN + '/css/FloatWindow4.css',
  ORIGIN + '/js/jquery-3.7.1.min.js',
  ORIGIN + '/js/clipboard.min.js',
  ORIGIN + '/js/html2canvas.min.js',
  ORIGIN + '/js/FloatWindow4.js',
  ORIGIN + '/js/BgUtil_class.js',
  ORIGIN + '/js/BgXgid_class.js',
  ORIGIN + '/js/BgHtmlBoard_class.js',
  ORIGIN + '/js/BgXgFontBoard_class.js',
  ORIGIN + '/js/BgTextBoard_class.js',
  ORIGIN + '/bgPositionEdtor/js/BG_position_editor.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(contentToCache);
    })
  );
  self.skipWaiting();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          if (e.request.url.startsWith('http')) { //ignore chrome-extention: request (refuse error msg)
            cache.put(e.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        const [kyappname, kyversion] = key.split('-');
        const [cnappname, cnversion] = cacheName.split('-');
        if (kyappname === cnappname && kyversion !== cnversion) {
          return caches.delete(key);
        }
      }));
    })
  );
});
