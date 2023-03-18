import { DbTable, HookHandler, restHandler } from '../../../database.ts'
import {
	sendClaimRequestNotification,
	sendClaimStatusNotification,
} from '../../../push_notification.ts'
import { Claim, WebPushSub } from '../../../types.ts'
import { ApiRules, getPatchFromBody } from '../../../utils.ts'
import { outingsTable } from './outings.ts'

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
