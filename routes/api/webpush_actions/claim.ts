import { claimsTable } from '../db/claims.ts'
import { ApiRules, RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { Claim, UUID } from '../../../types.ts'

export const handler: WithSessionHandlers = {
	async GET(req, ctx) {
		ApiRules.logged().roles('admin', 'moderator').execute<never>(req, ctx)

		try {
			const url = new URL(req.url)
			const uuid = url.searchParams.get('uuid') as UUID
			const action = url.searchParams.get('action') as 'accept' | 'reject'

			let claim: Claim
			if (action === 'accept') {
				claim = await claimsTable.update({ uuid, status: 'accepted' })
			}
			if (action === 'reject') claim = await claimsTable.delete({ uuid })
			//@ts-ignore setted before
			if (claim === undefined) {
				throw new Error(`Unknown action "${action}"`)
			}

			return RespondJson({
				//@ts-ignore setted before
				data: { claim },
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
