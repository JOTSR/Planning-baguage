import { Subscription, WebPushSub } from '../../types.ts'
import { requestJson, RespondJson } from '../../utils.ts'
import { WithSessionHandlers } from './login.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const { subscription } = await req.json() as {
			subscription: WebPushSub
		}
		const ip = (ctx.remoteAddr as Deno.NetAddr).hostname

		try {
			sessionStorage.setItem(ip, JSON.stringify(subscription))

			return RespondJson({
				data: {},
				message: 'Subscription saved',
				status: 200,
			})
		} catch (error) {
			return RespondJson({
				data: { error },
				message: 'Subscription error',
				status: 500,
			})
		}
	},
	GET() {
		const pub = Deno.env.get('VAPID_PUBLIC')

		if (pub) {
			return RespondJson({
				data: { pub },
				message: 'Vapid keys',
				status: 200,
			})
		}

		return RespondJson({
			data: {},
			message: 'Vapid keys not found',
			status: 404,
		})
	},
}

export async function getOrSubscribe(registration: ServiceWorkerRegistration) {
	const subscription = await registration.pushManager.getSubscription()

	if (subscription) return subscription

	const { data, message, _response } = await requestJson('/api/webpush', {
		method: 'GET',
	})

	if (!_response.ok) {
		throw new Error(message)
	}

	const { pub } = data as { pub: string }

	return registration.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: pub,
	})
}

export async function registerSubscription(
	{ linkType, linkedTo }: Pick<Subscription, 'linkType' | 'linkedTo'>,
) {
	if ('serviceWorker' in navigator) {
		try {
			const registration = await navigator.serviceWorker.getRegistration()
			if (registration === undefined) {
				throw new Error('no service worker registration')
			}
			const webPushSub = JSON.parse(
				JSON.stringify(await getOrSubscribe(registration)),
			) as WebPushSub
			const subscription: Omit<Subscription, 'ip' | 'uuid'> = {
				linkType,
				linkedTo,
				webPushSub,
			}

			await requestJson('/api/db/subscriptions', {
				method: 'POST',
				data: subscription,
			})
		} catch (error) {
			//registration failed
			console.error(`Registration failed: ${error}`)
		}
	}
}
