import { UnknownPageProps } from '$fresh/server.ts'

export default function NotFoundPage({ url }: UnknownPageProps) {
	return (
		<>
			<h1>Page introuvable</h1>
			<p>
				La page{' '}
				<b>
					<em>{url.pathname}</em>
				</b>{' '}
				est introuvable - <b>404</b>
			</p>
		</>
	)
}
