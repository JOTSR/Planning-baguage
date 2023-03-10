import { Handlers, PageProps } from '$fresh/server.ts'
import Skeleton from '../components/Skeleton.tsx'
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
	return (
		<Skeleton title='Accueil'>
			<>
				<h1>Sessions</h1>
				<OutingsGallery outings={data.outings} code={data.code} />
			</>
		</Skeleton>
	)
}
