// files to be saved to cache
const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js'
]
const APP_PREFIX = 'BudgetTracker';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// once registered, install service worker and add all files to cache
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('installing cache: ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// once installed, retrieve keys from cache
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keyList) {
            // add to the keep list keys that have an index value that matches the app prefix
            let cacheKeepList = keyList.filter(function(key){
                return key.indexOf(APP_PREFIX);
            });
            // add the current cache name to the keep list
            cacheKeepList.push(CACHE_NAME);
            // wait until all promises are resolved/rejected
            return Promise.all(
                // map through the keep list and delete from the cache, keys that cannot be found in the keep list
                keyList.map(function(key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache: ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// intercept http requests and serve cached files (if they are available, if not, request from network)
self.addEventListener('fetch', function(e) {
    console.log('fetch request: ' + e.request.url);
    e.respondWith(
        // match the request with the resources in the cache
        caches.match(e.request).then(function(request) {
            if (request) {
                console.log('responding with cache: ' + e.request.url);
                return request;
            } else {
                console.log('file is not cached, fetching: ' + e.request.url);
                return fetch(e.request);
            }
            // return request || fetch(e.request)
        })
    )
});