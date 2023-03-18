import { DbTable, HookHandler, restHandler } from '../../../database.ts'
import {
	sendOutingAddNotification,
	sendOutingCancellationNotification,
	sendOutingUpdateNotification,
} from '../../../push_notification.ts'
import { Outing } from '../../../types.ts'
import { ApiRules, getPatchFromBody } from '../../../utils.ts'
import { claimsTable } from './claims.ts'
import { subscriptionsTable } from './subscriptions.ts'

const notifyOutingUpdate = {
	newOuting: undefined as Outing | undefined,
	oldOuting: undefined as Outing | undefined,
	async set(req: Parameters<HookHandler>[0]) {
		this.newOuting = await getPatchFromBody<Outing, 'uuid'>(
			req.clone(),
			'uuid',
			'description',
			'location',
			'startDate',
		) as Outing
		this.oldOuting = await outingsTable.read(this.newOuting)
	},
	async check() {
		if (this.newOuting === undefined || this.oldOuting === undefined) {
			throw new Error('hook error on setting outing value')
		}
		if (this.newOuting === await outingsTable.read(this.newOuting)) {
			for (const { webPushSub } of await subscriptionsTable.readAll()) {
				sendOutingUpdateNotification(
					webPushSub,
					this.oldOuting,
					this.newOuting,
				)
			}
		}
	},
}

export const outingsTable = new DbTable<Outing>('outings')

export const handler = restHandler(outingsTable, {
	routesRules: {
		get: ApiRules,
		put: ApiRules.logged().roles('admin', 'moderator'),
		post: ApiRules.logged().roles('admin', 'moderator'),
		delete: ApiRules.logged().roles('admin', 'moderator').requiredParams(
			'uuid',
		),
	},
	routesHooks: {
		put: {
			onReceive: notifyOutingUpdate.set,
			onSuccess: notifyOutingUpdate.check,
		},
		post: {
			onSuccess: notifyOutingAdd,
		},
		delete: {
			onSuccess: notifyOutingCancellation,
		},
	},
	tableKeys: ['uuid', 'location', 'description', 'startDate'],
})

async function notifyOutingAdd(req: Parameters<HookHandler>[0]) {
	const { description, location, startDate } = await getPatchFromBody<
		Outing,
		never
	>(req.clone(), 'description', 'location', 'startDate') as Outing
	for (const { webPushSub } of await subscriptionsTable.readAll()) {
		sendOutingAddNotification(webPushSub, {
			startDate,
			location,
			description,
		})
	}
}

async function notifyOutingCancellation(req: Parameters<HookHandler>[0]) {
	const { uuid, description, location, startDate } = await getPatchFromBody<
		Outing,
		'uuid'
	>(req.clone(), 'uuid', 'description', 'location', 'startDate') as Outing
	for (const { linkedTo, webPushSub } of await subscriptionsTable.readAll()) {
		const claim = await claimsTable.read({ uuid: linkedTo })
		const outing = await outingsTable.read({ uuid: claim.outing })
		if (outing.uuid !== uuid) continue

		sendOutingCancellationNotification(webPushSub, {
			startDate,
			location,
			description,
		})
	}
}
