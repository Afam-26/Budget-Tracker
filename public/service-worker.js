const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/index.js',
    '/manifest.webmanifest',
    '/db.js',
    '/icons/icon-512x512.png',
    '/icons/icon-192x192.png',
];
  
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
  
  // install event handler
// self.addEventListener('install', event => {
//     console.log('Install');
  
//     // pre cache all static assets
//     const cacheResources = async () => {
//       const cache = await caches.open(CACHE_NAME);
//       console.log("Cache ", cache)
//       return cache.addAll(FILES_TO_CACHE);
//     }
  
//     event.waitUntil(cacheResources());  
//     self.skipWaiting();
//     console.log("Your files were pre-cached successfully!");
// });

self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});
  
  // activate
// self.addEventListener("activate", function(event) {
  
//     console.log("activate");
  
//     const removeOldCache = async () => {
//       const cacheKeyArray = await caches.keys();
    
//       const cacheResultPromiseArray = cacheKeyArray.map(key => {
//         if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//           console.log("Removing old cache data", key);
//           return caches.delete(key);
//         }
//       });
//       return Promise.all(cacheResultPromiseArray);
//     }
  
//     event.waitUntil(removeOldCache());  
  
//     self.clients.claim();
// });
  

self.addEventListener("fetch", function(event) {
  // cache all get requests to /api routes
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );
    return;
  }
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});
   

