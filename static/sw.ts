/// <reference lib="webworker" />

import { WebPushAction } from '../types.ts'
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
		//!cache strategy : network first
		const cachedResponse = await caches.match(event.request)
		const cache = await caches.open(RUNTIME_CACHE)
		try {
			const response = await fetch(event.request)
			await cache.put(event.request, response.clone())
			return response
		} catch {
			if (cachedResponse) return cachedResponse
		}
		return new Response('Ressource indisponible', { status: 503 })
	})())
})

self.addEventListener('notificationclick', (event) => {
	const rawAction = event.action as WebPushAction['action']
	const [category, action, payload] = rawAction.match(/(.+)_(.+)#(.+)/)!

	if (category === 'claim') {
		if (action === 'accept' || action === 'reject') {
			self.clients.openWindow(
				`${self.location.hostname}/api/webpush_actions/claim?uuid=${payload}&action=${action}`,
			)
		}

		if (action === 'contact') {
			self.clients.openWindow(`mailto:${payload}`)
		}
	}

	if (category === 'calendar') {
		if (action === 'add') {
			self.clients.openWindow(
				`${self.location.hostname}/api/webpush_actions/calendar?uuid=${payload}`,
			)
		}
	}
})

self.addEventListener('push', async (event) => {
	if (Notification?.permission !== 'granted') {
		return
	}

	const { title, ...options } = event.data?.json()

	await showNotification(title, options)
})

async function showNotification(
	title: string,
	{ icon, body, tag, actions }: NotificationOptions,
) {
	if (!['denied', 'granted'].includes(Notification.permission)) {
		try {
			await Notification.requestPermission()
		} catch (e) {
			return e
		}
	}

	self.registration.showNotification(title, {
		lang: 'fr',
		badge: '/assets/icons/logo-maskable-512.png',
		icon,
		body,
		actions,
		tag,
	})
}
