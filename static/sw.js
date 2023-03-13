// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const appVersion = '1.5.2';
const STATIC_CACHE = `static-cache-v${appVersion}`;
const RUNTIME_CACHE = `runtime-cache-v${appVersion}`;
const PRECACHE_URLS = [
    '/',
    '/account',
    '/info',
    '/invite',
    '/style.css'
];
const PATH_TO_CACHE = [
    /\/assets\//,
    /\/tabler-icons\//,
    /.*\.json/
];
self.addEventListener('install', (event)=>{
    event.waitUntil((async ()=>{
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_URLS);
        self.skipWaiting();
    })());
});
self.addEventListener('activate', (event)=>{
    const currentCaches = [
        STATIC_CACHE,
        RUNTIME_CACHE
    ];
    event.waitUntil((async ()=>{
        const cacheNames = await caches.keys();
        const cachesToDelete = cacheNames.filter((cacheNames)=>!currentCaches.includes(cacheNames));
        await Promise.all(cachesToDelete.map((cacheToDelete)=>caches.delete(cacheToDelete)));
        self.clients.claim();
    })());
});
self.addEventListener('fetch', (event)=>{
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    if (!PATH_TO_CACHE.some((path)=>url.pathname.match(path))) return;
    event.respondWith((async ()=>{
        const cachedResponse = await caches.match(event.request);
        const cache = await caches.open(RUNTIME_CACHE);
        try {
            const response = await fetch(event.request);
            await cache.put(event.request, response.clone());
            return response;
        } catch  {
            if (cachedResponse) return cachedResponse;
        }
        return new Response('Ressource indisponible', {
            status: 503
        });
    })());
});
addEventListener('push', async (e)=>{
    const event = e;
    if (Notification?.permission !== 'granted') {
        return;
    }
    const { title , ...options } = event.data?.json();
    await showNotification(title, options);
});
async function showNotification(title, { icon , body , tag , actions  }) {
    if (![
        'denied',
        'granted'
    ].includes(Notification.permission)) {
        try {
            await Notification.requestPermission();
        } catch (e) {
            return e;
        }
    }
    self.registration.showNotification(title, {
        lang: 'fr',
        badge: '/assets/icons/logo-maskable-512.png',
        icon,
        body,
        actions,
        tag
    });
}
