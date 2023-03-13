import { RespondJson } from '../../utils.ts'
import { WithSessionHandlers } from './login.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const { subscription } = await req.json() as {
			subscription: PushSubscription
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
