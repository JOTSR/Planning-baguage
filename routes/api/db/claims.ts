import { DbTable, HookHandler, restHandler } from '../../../database.ts'
import {
	sendClaimRequestNotification,
	sendClaimStatusNotification,
} from '../../../push_notification.ts'
import { Claim } from '../../../types.ts'
import { ApiRules, getPatchFromBody } from '../../../utils.ts'
import { outingsTable } from './outings.ts'
import { subscriptionsTable } from './subscriptions.ts'
import { usersTable } from './users.ts'

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
	routesHooks: {
		post: {
			onSuccess: notifyClaimAdding,
		},
		delete: {
			onSuccess: notifyClaimStatus,
		},
		put: {
			onSuccess: notifyClaimStatus,
		},
	},
	tableKeys: ['uuid', 'email', 'lastname', 'firstname', 'outing', 'status'],
})

async function notifyClaimAdding(req: Parameters<HookHandler>[0]) {
	const { firstname, lastname, uuid, email, outing } = await getPatchFromBody<
		Claim,
		'uuid'
	>(
		req.clone(),
		'uuid',
		'email',
		'firstname',
		'lastname',
		'outing',
		'status',
	) as Claim
	const { startDate } = await outingsTable.read({ uuid: outing })
	for (
		const { linkType, linkedTo, webPushSub } of await subscriptionsTable
			.readAll()
	) {
		if (linkType !== 'user') continue
		const user = await usersTable.read({ uuid: linkedTo })
		if (!['admin', 'moderator'].includes(user.role)) continue

		sendClaimRequestNotification(webPushSub, {
			firstname,
			lastname,
			uuid,
			startDate,
			email,
		})
	}
}

async function notifyClaimStatus(req: Parameters<HookHandler>[0]) {
	const { uuid, outing } = await getPatchFromBody<Claim, 'uuid'>(
		req.clone(),
		'uuid',
		'email',
		'firstname',
		'lastname',
		'outing',
		'status',
	) as Claim
	const { startDate } = await outingsTable.read({ uuid: outing })
	for (const { linkType, webPushSub } of await subscriptionsTable.readAll()) {
		if (linkType !== 'claim') continue
		if (req.method === 'PUT') {
			sendClaimStatusNotification(webPushSub, 'accepted', {
				uuid,
				startDate,
			})
		}
		if (req.method === 'DELETE') {
			sendClaimStatusNotification(webPushSub, 'rejected', {
				uuid,
				startDate,
			})
		}
	}
}
