/* serviceWorker.js */
// (参考) https://qiita.com/kaihar4/items/c09a6d73e190ab0b9b01
'use strict';

const CACHE_NAME = "bgPositionEdtor-v20220405";
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const STATIC_FILES = [
  ORIGIN + '/bgPositionEdtor/',
  ORIGIN + '/bgPositionEdtor/index.html',
  ORIGIN + '/bgPositionEdtor/manifest.json',
  ORIGIN + '/bgPositionEdtor/icon/favicon.ico',
  ORIGIN + '/bgPositionEdtor/icon/apple-touch-icon.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-96x96.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-192x192.png',
  ORIGIN + '/bgPositionEdtor/icon/android-chrome-512x512.png',
  ORIGIN + '/bgPositionEdtor/css/BG_position_editor.css',
  ORIGIN + '/js/jquery-3.6.0.min.js',
  ORIGIN + '/js/clipboard.min.js',
  ORIGIN + '/js/html2canvas.min.js',
  ORIGIN + '/js/FloatWindow2.js',
  ORIGIN + '/js/BgUtil_class.js',
  ORIGIN + '/js/BgXgid_class.js',
  ORIGIN + '/js/BgHtmlBoard_class.js',
  ORIGIN + '/js/BgXgFontBoard_class.js',
  ORIGIN + '/js/BgTextBoard_class.js',
  ORIGIN + '/bgPositionEdtor/js/BG_position_editor.js'
];

const CACHE_KEYS = [
  CACHE_NAME
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        STATIC_FILES.map(url => {
          return fetch(new Request(url, { cache: 'no-cache', mode: 'no-cors' })).then(response => {
            return cache.put(url, response);
          });
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !CACHE_KEYS.includes(key);
        }).map(key => {
          return caches.delete(key);
        })
      );
    })
  );
});

