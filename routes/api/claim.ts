import { Email, UUID } from '../../types.ts'
import { RespondJson } from '../../utils.ts'
import { WithSessionHandlers } from './login.ts'
import { codesTable } from './db/codes.ts'
import { outingsTable } from './db/outings.ts'
import { claimsTable } from './db/claims.ts'

export const handler: WithSessionHandlers = {
	async POST(req, _ctx) {
		const formData = await req.formData()

		const outingUUID = formData.get('outing-uuid') as UUID
		const firstname = formData.get('firstname') as string
		const lastname = formData.get('lastname') as string
		const email = formData.get('email') as Email
		const code = formData.get('code') as UUID

		const isValidCode =
			(await codesTable.readAll()).find((entry) =>
				entry.code === code
			) !== undefined
		const isValidOuting =
			(await outingsTable.readAll()).find((entry) =>
				entry.uuid === outingUUID
			) !== undefined

		if (!isValidCode) {
			return RespondJson({
				data: {},
				message: 'Code invalide',
				status: 401,
			})
		}

		if (!isValidOuting) {
			return RespondJson({
				data: {},
				message: 'Date sélectionnée innexistante',
				status: 404,
			})
		}

		await claimsTable.create({
			firstname,
			lastname,
			email,
			outing: outingUUID,
			status: 'pending',
		})

		return RespondJson({
			data: {},
			message: 'Demande enregistrée',
			status: 200,
		})
	},
}
