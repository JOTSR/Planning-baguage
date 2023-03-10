import { RespondJson } from '../../utils.ts'
import { WithSessionHandlers } from './login.ts'

export const handler: WithSessionHandlers = {
	POST(_req, ctx) {
		ctx.state.session.clear()

		return RespondJson({
			data: {},
			message: 'Logout',
			status: 200,
		})
	},
}
