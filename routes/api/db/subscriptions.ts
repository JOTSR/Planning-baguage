import { DbTable, restHandler } from '../../../database.ts'
import { Subscription } from '../../../types.ts'
import { ApiRules } from '../../../utils.ts'

export const subscriptionsTable = new DbTable<Subscription>('subscriptions')

export const handler = restHandler(subscriptionsTable, {
	routesRules: {
		get: ApiRules,
		put: ApiRules.notImplemented(),
		post: ApiRules,
		delete: ApiRules.notImplemented(),
	},
	tableKeys: ['uuid', 'ip', 'linkType', 'linkedTo', 'webPushSub'],
})
