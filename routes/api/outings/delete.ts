import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { outingsTable } from '../db/outings.ts'
import { UUID } from '../../../types.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const formData = await req.formData()

		const uuid = formData.get('outing-uuid') as UUID

		const { session } = ctx.state

		if (!session.has('uuid')) {
			return RespondJson({
				data: {},
				message: 'Connection requise',
				status: 401,
			})
		}

		if (!['admin', 'moderator'].includes(session.get('role'))) {
			return RespondJson({
				data: {},
				message: 'Accés non authorisé',
				status: 403,
			})
		}

		if (
			!(await outingsTable.readAll()).find((outing) =>
				outing.uuid === uuid
			)
		) {
			return RespondJson({
				data: {},
				message: 'Sortie non trouvée',
				status: 404,
			})
		}

		await outingsTable.delete({ uuid })

		return RespondJson({
			data: {},
			message: 'Sortie supprimée',
			status: 200,
		})
	},
}
