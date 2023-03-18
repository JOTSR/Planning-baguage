import * as webpush from 'https://esm.sh/web-push@3.5.0'
import { Claim, Outing, WebPushSub } from './types.ts'
webpush.setVapidDetails(
	Deno.env.get('VAPID_SUB')!,
	Deno.env.get('VAPID_PUBLIC')!,
	Deno.env.get('VAPID_PRIVATE')!,
)

export function sendClaimRequestNotification(
	subscription: WebPushSub,
	{ firstname, lastname, uuid, startDate, email }:
		& Pick<Claim, 'firstname' | 'lastname' | 'uuid' | 'email'>
		& Pick<Outing, 'startDate'>,
) {
	const name = `${lastname} ${firstname}`
	const iso = new Date(startDate)
	const date = Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
		iso,
	)
	const time = Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium' }).format(
		iso,
	)

	return sendNotification(subscription, {
		title: `Nouvelle demande de ${name}`,
		body:
			`Demande de participation de ${name} pour la session du ${date} à ${time}`,
		tag: 'claim claim-manage',
		icon: '/assets/icons/calendar-question.svg',
		actions: [
			{
				action: `claim_accept#${uuid}`,
				title: 'Accepter',
			},
			{
				action: `claim_contact#${email}`,
				title: 'Contacter',
			},
			{
				action: `claim_reject#${uuid}`,
				title: 'Rejeter',
			},
		],
	})
}

export function sendClaimStatusNotification(
	subscription: WebPushSub,
	status: 'accepted' | 'rejected' | 'revoked',
	{ uuid, startDate }: Pick<Outing, 'startDate' | 'uuid'>,
) {
	const title = status === 'accepted'
		? 'Validation'
		: status === 'rejected'
		? 'Rejet'
		: 'Annulation'
	const body = status === 'accepted'
		? 'à été validée'
		: status === 'rejected'
		? 'à été rejetée'
		: 'à été annulée'
	const date = new Date(startDate).getDate().toLocaleString()
	const time = new Date(startDate).getTime().toLocaleString()

	return sendNotification(subscription, {
		title: `${title} de votre demande de participation`,
		body:
			`Votre demande de participation pour la session du ${date} à ${time} ${body}`,
		tag: 'claim claim-satus',
		icon: status === 'accepted'
			? '/assets/icons/calendar-check.svg'
			: '/assets/icons/calendar-x.svg',
		actions: status === 'accepted'
			? [{
				title: 'Ajouter à mon agenda',
				action: `calendar_add#${uuid}`,
			}]
			: undefined,
	})
}

export function sendOutingReminderNotification(
	subscription: WebPushSub,
	{ startDate, location, description, uuid }: Outing,
) {
	const date = new Date(startDate).getDate().toLocaleString()
	const time = new Date(startDate).getTime().toLocaleString()

	return sendNotification(subscription, {
		title: `Rappel de la session de baguage du ${date}`,
		body:
			`Rendez vous demain ${time} à "${location}" pour votre session de baguage. ${description}`,
		tag: 'outing outing-reminder',
		icon: '/assets/icons/calendar-time.svg',
		actions: [{
			title: 'Ajouter à mon agenda',
			action: `calendar_add#${uuid}`,
		}],
	})
}

export function sendOutingCancellationNotification(
	subscription: WebPushSub,
	{ startDate, location }: Omit<Outing, 'uuid'>,
) {
	const date = new Date(startDate).getDate().toLocaleString()
	const time = new Date(startDate).getTime().toLocaleString()

	return sendNotification(subscription, {
		title: `Annulation de la session de baguage du ${date}`,
		body:
			`La session de baguage du ${date} à ${time} à "${location}" à été annulée`,
		tag: 'outing outing-cancellation',
		icon: '/assets/icons/calendar-off.svg',
	})
}

export function sendOutingUpdateNotification(
	subscription: WebPushSub,
	oldOuting: Omit<Outing, 'uuid' | 'description'>,
	newOuting: Omit<Outing, 'uuid'>,
) {
	const oldDate = new Date(oldOuting.startDate).getDate().toLocaleString()
	const oldTime = new Date(oldOuting.startDate).getTime().toLocaleString()

	const newDate = new Date(oldOuting.startDate).getDate().toLocaleString()
	const newTime = new Date(oldOuting.startDate).getTime().toLocaleString()

	return sendNotification(subscription, {
		title: `Modification de la session de baguage du ${oldDate}`,
		body:
			`La session de baguage du ${oldDate} à ${oldTime} à "${oldOuting.location}" à été modifiée pour le ${newDate} à ${newTime} à "${newOuting.location}" (${newOuting.description})`,
		tag: 'outing outing-update',
		icon: '/assets/icons/calendar-star.svg',
	})
}

export function sendOutingAddNotification(
	subscription: WebPushSub,
	{ startDate, location }: Omit<Outing, 'uuid'>,
) {
	const date = new Date(startDate).getDate().toLocaleString()
	const time = new Date(startDate).getTime().toLocaleString()

	return sendNotification(subscription, {
		title: `Nouvelle session de baguage le ${date}`,
		body:
			`Nouvelle session de baguage le ${date} à ${time} à "${location}"`,
		tag: 'outing outing-update',
		icon: '/assets/icons/calendar-plus.svg',
	})
}

function sendNotification(
	subscription: WebPushSub,
	payload: NotificationOptions & { title: string },
) {
	return webpush.sendNotification(subscription, JSON.stringify({ payload }))
}
