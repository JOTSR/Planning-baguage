import { ComponentChild, hydrate, render } from 'preact'
import { Hash, ISOString } from './types.ts'

export async function hash(text: string): Promise<Hash> {
	const digest = await crypto.subtle.digest(
		'SHA-512',
		new TextEncoder().encode(text),
	)
	return [...new Uint8Array(digest)].map((v) => v.toString(16)).join('')
}

export function RespondJson(
	payload: { message: string; status: number; data: Record<string, unknown> },
): Response {
	const body = JSON.stringify(payload)
	return new Response(body, {
		status: payload.status,
		statusText: payload.message,
	})
}

export const dateFormat = new Intl.DateTimeFormat('fr-FR', {
	weekday: 'short',
	month: 'short',
	hour: 'numeric',
	minute: 'numeric',
	day: 'numeric',
})

export const durationFormat = new Intl.DateTimeFormat('fr-FR', {
	hour: 'numeric',
	minute: 'numeric',
})

export function appendJsx(
	child: ComponentChild,
	parent: Element,
	mode: typeof render | typeof hydrate = hydrate,
) {
	const div = document.createElement('div')
	mode(child, div)
	parent.appendChild(div.children[0])
}

export function isoDateStringToLocale(isoString: ISOString): ISOString {
	const date = new Date(isoString).toLocaleDateString()
	const time = new Date(isoString).toLocaleTimeString()

	const [day, month, year] = date.split('/')

	return `${year}-${month}-${day}T${time}`
}
