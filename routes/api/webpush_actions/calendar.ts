import { outingsTable } from '../db/outings.ts'
import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { UUID } from '../../../types.ts'

export const handler: WithSessionHandlers = {
	async GET(req, _ctx) {
		try {
			const url = new URL(req.url)
			const uuid = url.searchParams.get('uuid') as UUID

			const outing = await outingsTable.read({ uuid })

			return RespondJson({
				data: { outing },
				message: 'Ok',
				status: 200,
			})
		} catch (error) {
			return RespondJson({
				data: { error },
				message: 'Requête incorrecte',
				status: 400,
			})
		}
	},
}
