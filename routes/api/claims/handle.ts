import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { claimsTable } from '../db/claims.ts'

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const formData = await req.formData()

		// const outing = formData.get('claim-outing') as ISOString
		const name = formData.get('claim-name') as string
		const uuid = formData.get('claim-uuid') as string
		const action = formData.get('claim-action') as 'accept' | 'reject'

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
			!(await claimsTable.readAll()).find((claim) => claim.uuid === uuid)
		) {
			return RespondJson({
				data: {},
				message: `${name} et introuvable`,
				status: 404,
			})
		}

		const claim = (await claimsTable.readAll()).find((claim) =>
			claim.uuid === uuid
		)!

		if (action === 'accept') {
			await claimsTable.update({ uuid, status: 'accepted' })
			console.log(
				`mailto:${claim.email};body=${claim.lastname} ${claim.firstname} viens`,
			)
			return RespondJson({
				data: { claim },
				message: `${name} viendra`,
				status: 200,
			})
		}

		if (action === 'reject') {
			await claimsTable.delete({ uuid })
			console.log(
				`mailto:${claim.email};body=${claim.lastname} ${claim.firstname} ne viens pas`,
			)
			return RespondJson({
				data: { claim },
				message: `${name} ne viendra pas`,
				status: 200,
			})
		}

		return RespondJson({
			data: {},
			message: `Erreur inconnue`,
			status: 500,
		})
	},
}
