export type millisecond = number
export type second = number
export type UUID = string
export type Email = string
export type Hash = string
export type ISOString = string
export type IP = string

export interface User {
	uuid: UUID
	password: string
	firstname: string
	lastname: string
	email: Email
	role: 'admin' | 'moderator' | 'user'
}

export interface Claim {
	uuid: UUID
	email: Email
	lastname: string
	firstname: string
	outing: UUID
	status: 'pending' | 'accepted'
}

export interface Outing {
	uuid: UUID
	startDate: ISOString
	description: string
	location: string
}

export interface Code {
	uuid: UUID
	code: string
	createdAt: ISOString
}

export interface Subscription {
	uuid: UUID
	ip: IP
	linkType: 'claim' | 'user'
	linkedTo: UUID
	webPushSub: WebPushSub
}

export interface BeforeInstallPromptEvent extends Event {
	platforms: string[]
	userChoice: Promise<'accepted' | 'dismissed'>
	prompt: () => Promise<BeforeInstallPromptEvent>
}

export type HttpMethod = 'POST' | 'GET' | 'DELETE' | 'PUT'

export type WebPushSub = {
	endpoint: string
	keys: {
		p256dh: string
		auth: string
	}
}

export type WebPushAction = {
	title: string
	action: `${string}_${string}#${string}`
}
