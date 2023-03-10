import { DbTable } from '../../../database.ts'
import { User } from '../../../types.ts'
import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'

export const handler: WithSessionHandlers = {
	async GET(_req, ctx) {
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

		return RespondJson({
			data: { users: await usersTable.readAll() },
			message: 'Ok',
			status: 200,
		})
	},
}

export const usersTable = new DbTable<User>('users')
