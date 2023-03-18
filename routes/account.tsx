import { PageProps } from '$fresh/server.ts'
import LogoutButton from '../islands/LogoutButton.tsx'
import { SessionData, WithSessionHandlers } from './api/login.ts'
import { Claim, Outing } from '../types.ts'
import { claimsTable } from './api/db/claims.ts'
import { outingsTable } from './api/db/outings.ts'
import ClaimDialogButton from '../islands/ClaimDialogButton.tsx'
import AddSessionDialogButton from '../islands/AddSessionDialogButton.tsx'
import EditSessionDialogButton from '../islands/EditSessionDialogButton.tsx'
import LoginSubmitter from '../islands/LoginSubmitter.tsx'

type HandlerFormat = { claims: Claim[]; outings: Outing[] }

export const handler: WithSessionHandlers<HandlerFormat> = {
	async GET(_req, ctx) {
		const { session } = ctx.state

		if (session.has('uuid')) {
			return ctx.render({
				session: session.data,
				claims: await claimsTable.readAll(),
				outings: await outingsTable.readAll(),
			})
		}

		return ctx.render()
	},
}

export default function Account(
	{ data }: PageProps<SessionData & HandlerFormat>,
) {
	if (data?.session.uuid !== undefined) {
		return (
			<>
				<h1>
					{`${data.session.lastname} ${data.session.firstname}`}
				</h1>
				<section className='grid-list'>
					<EditSessionDialogButton outings={data.outings} />
					<AddSessionDialogButton />
					<ClaimDialogButton
						claims={data.claims}
						outings={data.outings}
					/>
					<LogoutButton type='primary'>Déconnection</LogoutButton>
				</section>
			</>
		)
	}

	return (
		<>
			<h1>Connection</h1>
			<LoginSubmitter />
		</>
	)
}
