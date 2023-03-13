/// <reference lib="webworker" />

import { appVersion } from './app_version.ts'

//deno-lint-ignore no-var
declare var self: ServiceWorkerGlobalScope
export {}

const STATIC_CACHE = `static-cache-v${appVersion}`
const RUNTIME_CACHE = `runtime-cache-v${appVersion}`

const PRECACHE_URLS = [
	'/',
	'/account',
	'/info',
	'/invite',
	'/style.css',
]

const PATH_TO_CACHE = [
	/\/assets\//,
	/\/tabler-icons\//,
	/.*\.json/,
]

self.addEventListener('install', (event) => {
	event.waitUntil((async () => {
		const cache = await caches.open(STATIC_CACHE)
		await cache.addAll(PRECACHE_URLS)
		self.skipWaiting()
	})())
})

self.addEventListener('activate', (event) => {
	const currentCaches = [STATIC_CACHE, RUNTIME_CACHE]
	event.waitUntil((async () => {
		const cacheNames = await caches.keys()
		const cachesToDelete = cacheNames.filter((cacheNames) =>
			!currentCaches.includes(cacheNames)
		)
		await Promise.all(
			cachesToDelete.map((cacheToDelete) => caches.delete(cacheToDelete)),
		)
		self.clients.claim()
	})())
})

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url)
	if (url.origin !== self.location.origin) return
	if (!PATH_TO_CACHE.some((path) => url.pathname.match(path))) return
	event.respondWith((async () => {
		const cachedResponse = await caches.match(event.request)
		if (cachedResponse) return cachedResponse
		const cache = await caches.open(RUNTIME_CACHE)
		const response = await fetch(event.request)
		await cache.put(event.request, response.clone())
		return response
	})())
})
