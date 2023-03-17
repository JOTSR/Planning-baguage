import { DbTable, restHandler } from '../../../database.ts'
import { Claim } from '../../../types.ts'
import { ApiRules } from '../../../utils.ts'

export const claimsTable = new DbTable<Claim>('claims')

export const handler = restHandler(claimsTable, {
	routesRules: {
		get: ApiRules.logged().roles('admin', 'moderator'),
		put: ApiRules.logged().roles('admin', 'moderator'),
		post: ApiRules.logged().roles('admin', 'moderator'),
		delete: ApiRules.logged().roles('admin', 'moderator').requiredParams(
			'uuid',
		),
	},
	tableKeys: ['uuid', 'email', 'lastname', 'firstname', 'outing', 'status'],
})
