const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/index.js',
    '/manifest.webmanifest',
    '/db.js',
    '/icons/icon-512x512.png',
    '/icons/icon-192x192.png',
];
  
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
  
  // install event handler
self.addEventListener('install', event => {
    console.log('Install');
  
    // pre cache all static assets
    const cacheResources = async () => {
      const cache = await caches.open(DATA_CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    }
  
    event.waitUntil(cacheResources());  
    self.skipWaiting();
    console.log("Your files were pre-cached successfully!");
});
  
  // activate
self.addEventListener("activate", function(event) {
  
    console.log("activate");
  
    const removeOldCache = async () => {
      const cacheKeyArray = await caches.keys();
    
      const cacheResultPromiseArray = cacheKeyArray.map(key => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log("Removing old cache data", key);
          return caches.delete(key);
        }
      });
      return Promise.all(cacheResultPromiseArray);
    }
  
    event.waitUntil(removeOldCache());  
  
    self.clients.claim();
});
  
  // retrieve assets from cache
self.addEventListener('fetch', event => {

    const handleAPIDataRequest = async (event) => {
        try {
          const response = await fetch(event.request);
          // If the response was good, clone it and store it in the cache.
          if (response.status === 200) {
            console.log(`Adding API request to cache now: ${event.request.url}`);
    
            const apiCache = await caches.open(DATA_CACHE_NAME);
            await apiCache.put(event.request.url, response.clone());
    
            return response;
          }
        } catch(error) {
          // Network request failed, try to get it from the cache.
          console.log(`Network error occurred with API request. Now retrieving it from the cache: ${event.request.url}`)
          return await caches.match(event.request);
        }
    }
  
    const handleResourceRequest = async (event) => {
      const matchedCache = await caches.match(event.request);
      return matchedCache ||  await fetch(event.request);
    }
    
    // cache successful requests to the API
  if (event.request.url.includes("/api/")) {
    event.respondWith(handleAPIDataRequest(event));
  } else {
    event.respondWith(handleResourceRequest(event));
  }
});
  