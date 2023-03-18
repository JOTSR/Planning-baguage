import { DbTable, HookHandler, restHandler } from '../../../database.ts'
import {
	sendClaimRequestNotification,
	sendClaimStatusNotification,
} from '../../../push_notification.ts'
import { Claim, Code } from '../../../types.ts'
import { ApiRules, getPatchFromBody, RespondJson } from '../../../utils.ts'
import { codesTable } from './codes.ts'
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
			onReceive: checkCodeAndOuting,
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

async function checkCodeAndOuting(req: Parameters<HookHandler>[0]) {
	const { outing } = await getPatchFromBody<Claim, never>(
		req.clone(),
		'outing',
	) as Claim
	const { code } = await getPatchFromBody<Code, never>(
		req.clone(),
		'code',
	) as Code

	const isValidCode =
		(await codesTable.readAll()).find((entry) => entry.code === code) !==
			undefined
	const isValidOuting =
		(await outingsTable.readAll()).find((entry) =>
			entry.uuid === outing
		) !== undefined

	if (!isValidCode) {
		throw RespondJson({
			data: {},
			message: 'Code invalide',
			status: 401,
		})
	}

	if (!isValidOuting) {
		throw RespondJson({
			data: {},
			message: 'Date sélectionnée innexistante',
			status: 404,
		})
	}
}

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
