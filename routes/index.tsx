import { Handlers, PageProps } from '$fresh/server.ts'
import OutingsGallery from '../islands/OutingsGallery.tsx'
import { Outing } from '../types.ts'
import { outingsTable } from './api/db/outings.ts'
import { getCookies } from '$std/http/mod.ts'

type HandlerFormat = { outings: Outing[]; code: string }

export const handler: Handlers<HandlerFormat> = {
	async GET(req, ctx) {
		return ctx.render({
			outings: await outingsTable.readAll(),
			code: getCookies(req.headers)?.inviteCode ?? '',
		})
	},
}

export default function Home({ data }: PageProps<HandlerFormat>) {
	if (data.outings.length === 0) {
		return (
			<>
				<h1>Sessions</h1>
				<p>Aucune date actuellement prévue</p>
			</>
		)
	}

	return (
		<>
			<h1>Sessions</h1>
			<OutingsGallery outings={data.outings} code={data.code} />
		</>
	)
}
