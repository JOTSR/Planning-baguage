import { WithSession } from 'fresh_session/mod.ts'
import { HandlerContext } from 'https://deno.land/x/fresh@1.0.1/server.ts'
import { ComponentChild, hydrate, render } from 'preact'
import { Hash, ISOString, User } from './types.ts'

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

export class ApiRules {
	static get #ctx() {
		if (this.#_ctx === undefined) throw new Error('Incorrect context')
		return this.#_ctx
	}
	static get #req() {
		if (this.#_req === undefined) throw new Error('Incorrect request')
		return this.#_req
	}
	static #_ctx?: HandlerContext<Record<string, unknown>, WithSession>
	static #_req?: Request
	static #rules: (() => Response | void)[] = []
	static logged() {
		this.#rules.push(() => {
			if (!this.#ctx.state.session?.has('uuid')) {
				return RespondJson({
					data: {},
					message: 'Connection requise',
					status: 401,
				})
			}
		})
		return this
	}
	static roles(...roles: User['role'][]) {
		this.#rules.push(() => {
			if (!roles.includes(this.#ctx.state.session?.get('role'))) {
				return RespondJson({
					data: {},
					message: 'Accés non authorisé',
					status: 403,
				})
			}
		})
		return this
	}
	static requiredParams(...params: string[]) {
		this.#rules.push(() => {
			if (
				!params.every((param) =>
					new URL(this.#req.url).searchParams.has(param)
				)
			) {
				return RespondJson({
					data: { params },
					message: 'Paramètre(s) d\'url manquant(s)',
					status: 401,
				})
			}
		})
		return this
	}
	static notImplemented() {
		this.#rules.push(() => {
			return RespondJson({
				data: {},
				message: 'Non implémenté',
				status: 501,
			})
		})
		return this
	}
	static execute<T extends Record<string, unknown> = never>(
		req: Request,
		ctx: HandlerContext<T, WithSession>,
	) {
		//@ts-ignore TODO retype
		this.#_ctx = ctx
		this.#_req = req
		for (const handler of this.#rules) {
			const response = handler()
			if (response instanceof Response) return Promise.reject(response)
		}
		return Promise.resolve()
	}
}

export function getPatchFromParams<T, Primary extends keyof T>(
	{ url }: Request,
	...keys: (Primary | keyof T)[]
): Partial<T> & Pick<T, Primary> {
	//@ts-ignore primary ensured by args type
	const patch: Partial<T> & Pick<T, Primary> = {}
	const params = new URL(url)
	for (const key of keys) {
		if (typeof key !== 'string') continue
		const value = params.searchParams.get(key)
		//@ts-ignore key in T
		if (value) patch[key] = value
	}
	return patch
}

export async function getPatchFromBody<T, Primary extends keyof T>(
	req: Request,
	...keys: (Primary | keyof T)[]
): Promise<Partial<T> & Pick<T, Primary>> {
	const json = await (async () => {
		try {
			return await req.json() as Partial<T> & Pick<T, Primary>
		} catch {
			const formData = await req.formData()
			return Object.fromEntries(formData.entries()) as
				& Partial<T>
				& Pick<T, Primary>
		}
	})()

	for (const key of keys) {
		if (typeof key !== 'string') continue
		if (!(key in json)) {
			throw new Error(`${key} is missing from ${JSON.stringify(json)}`)
		}
	}
	return json
}
