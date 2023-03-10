import { DbTable } from '../../../database.ts'
import { Outing } from '../../../types.ts'
import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'

export const handler: WithSessionHandlers = {
	async GET(_req, _ctx) {
		return RespondJson({
			data: { outings: await outingsTable.readAll() },
			message: 'Ok',
			status: 200,
		})
	},
}

export const outingsTable = new DbTable<Outing>('outings')
