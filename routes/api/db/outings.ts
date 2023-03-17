import { DbTable, restHandler } from '../../../database.ts'
import { Outing } from '../../../types.ts'
import { ApiRules } from '../../../utils.ts'

export const outingsTable = new DbTable<Outing>('outings')

export const handler = restHandler(outingsTable, {
	get: ApiRules,
	put: ApiRules.logged().roles('admin', 'moderator'),
	post: ApiRules.logged().roles('admin', 'moderator'),
	delete: ApiRules.logged().roles('admin', 'moderator').requiredParams(
		'uuid',
	),
}, ['uuid', 'location', 'description', 'startDate'])
