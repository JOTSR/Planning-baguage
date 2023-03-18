/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />

if ('serviceWorker' in navigator) {
	try {
		await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
		})
	} catch (error) {
		//registration failed
		console.error(`Registration failed: ${error}`)
	}
}
