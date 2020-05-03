const staticCacheName = 'site-static-v3';
const dynamicCacheName = 'site-dynamic-v3';
const assets = [
    "/js/setup.js",
    "https://code.jquery.com/jquery-3.4.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js",
    "https://kit.fontawesome.com/f0caf2afad.js",
    "https://unpkg.com/axios/dist/axios.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css",
    "/css/style.css",
    "https://fonts.googleapis.com/css?family=Roboto&display=swap",
    "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2",
    "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2",
    "https://kit-free.fontawesome.com/releases/latest/css/free.min.css",
    "http://localhost:3000/imgs/free192x192.png",
    "https://kit-free.fontawesome.com/releases/latest/css/free-v4-shims.min.css",
    "https://kit-free.fontawesome.com/releases/latest/css/free-v4-font-face.min.css",
    "/offline",

]

const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
      cache.keys().then(keys => {
        if(keys.length > size){
          cache.delete(keys[0]).then(limitCacheSize(name, size));
        }
      });
    });
  };

self.addEventListener('install', evt => {
    console.log('service worker has been installed');
   evt.waitUntil( caches.open(staticCacheName).then(cache => {
    console.log("caching assets");
    cache.addAll(assets);
})
)
});

self.addEventListener('activate' , evt =>{
    // console.log("Service Worker Has Been Activated");
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== staticCacheName && key !== dynamicCacheName).map( key => caches.delete(key))
            )
        })
    )
});

// self.addEventListener('fetch',evt =>{
//     // console.log("fetch Event",evt);
//         evt.respondWith(
//             caches.match(evt.request).then( cachesRes => {
//                 return cachesRes || fetch(evt.request).then(fetchRes => {
//                     return caches.open(dynamicCacheName).then(cache => {
//                         cache.put(evt.request.url,fetchRes.clone());
//                         limitCacheSize(dynamicCacheName, 15);
//                         return fetchRes;
//                     })
//                 })
//             }).catch(() => caches.match("/offline"))
//         );
// });

self.addEventListener('fetch', evt => {
    evt.respondWith(
      fetch(evt.request).then(fetchRes => {
                            return caches.open(dynamicCacheName).then(cache => {
                                cache.put(evt.request.url,fetchRes.clone());
                                limitCacheSize(dynamicCacheName, 35);
                                return fetchRes;
                            })}).catch(() => {
        return caches.match(evt.request).then(function(res){
            if (res === undefined) { 
              return caches.match('/offline');
            } 
            return res;
        })
      })
    )
  });