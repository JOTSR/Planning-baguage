import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { outingsTable } from '../db/outings.ts'
import { ISOString, UUID } from '../../../types.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const formData = await req.formData()

		const uuid = formData.get('outing-uuid') as UUID
		const startDate = formData.get('outing-date') as ISOString
		const location = formData.get('outing-location') as string
		const description =
			formData.get('outing-description') as string | undefined ?? ''

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

		await outingsTable.update({ uuid, startDate, description, location })

		return RespondJson({
			data: {},
			message: 'Modifications enregistrée',
			status: 200,
		})
	},
}
