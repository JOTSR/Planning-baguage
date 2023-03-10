import { PageProps } from '$fresh/server.ts'
import Skeleton from '../components/Skeleton.tsx'
import { qrcode } from 'https://deno.land/x/qrcode@v2.0.0/mod.ts'
import { SessionData, WithSessionHandlers } from './api/login.ts'
import InviteCodeButton from '../islands/InviteCodeButton.tsx'

const code = Date.now().toString(16).toUpperCase().slice(5)
const endpoint = 'https://example.com/code/'
const link = `${endpoint}${code}`
const qr = await qrcode(link) as unknown as string

const shareData = {
	title: 'Sortie nature',
	text: `Lien d'invitation pour la sortie nature`,
	url: link,
}

type HandlerFormat = {
	shareData: ShareData
	qr: string
	code: string
	endpoint: string
}

export const handler: WithSessionHandlers<HandlerFormat> = {
	GET(_req, ctx) {
		const { session } = ctx.state

		return ctx.render({
			session: session.data,
			code,
			endpoint,
			shareData,
			qr,
		})
	},
}

export default function Invite(
	{ data }: PageProps<SessionData & HandlerFormat>,
) {
	if (data.session.uuid === undefined) {
		return (
			<Skeleton title='Inviter'>
				<h1>Connection requise</h1>
			</Skeleton>
		)
	}

	if (['moderator', 'admin'].includes(data.session.role)) {
		return (
			<Skeleton title='Inviter'>
				<>
					<h1>Invitation</h1>
					<InviteCodeButton>
						Générer un code d'invitation
					</InviteCodeButton>
				</>
			</Skeleton>
		)
	}

	return (
		<Skeleton title='Inviter'>
			<h1>Élévation de privilèges requise</h1>
		</Skeleton>
	)
}
