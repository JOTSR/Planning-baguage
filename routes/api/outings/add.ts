import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { outingsTable } from '../db/outings.ts'
import { ISOString } from '../../../types.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const formData = await req.formData()

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

		await outingsTable.create({ startDate, description, location })

		return RespondJson({
			data: {},
			message: 'Sortie enregistrée',
			status: 200,
		})
	},
}
