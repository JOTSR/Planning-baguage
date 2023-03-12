import { ErrorPageProps } from '$fresh/server.ts'

export default function Error500Page({ error }: ErrorPageProps) {
	return (
		<>
			<h1>Erreur interne au serveur</h1>
			<p>
				Erreur{' '}
				<b>
					<em>"{error}"</em>
				</b>{' '}
				- <b>500</b>
			</p>
		</>
	)
}
