import { hydrate, render } from 'preact'
import { Button } from '../components/Button.tsx'
import Copyable from './Copyable.tsx'
import ShareButton from './ShareButton.tsx'
import Toast from './Toast.tsx'

export default function InviteCodeButton({ children }: { children: string }) {
	return (
		<Button type='primary' onClick={(e) => getCode(e)}>{children}</Button>
	)
}

async function getCode(e: Event) {
	const response = await fetch('/api/db/codes', { method: 'POST' })
	if (!response.ok) {
		try {
			const { message } = await response.json()
			hydrate(<Toast type='error' message={message} />, document.body)
		} catch (error) {
			hydrate(
				<Toast type='error' message={String(error)} />,
				document.body,
			)
		}
	}

	const { data } = await response.json() as {
		data: { qr: string; code: string; endpoint: string; link: string }
	}
	const shareData: ShareData = {
		title: 'Sortie nature',
		text: `Lien d'invitation pour la sortie nature`,
		url: data.link,
	}
	;(e.target as HTMLButtonElement).disabled = true

	render(
		<>
			<p>
				{data.endpoint}
				<Copyable>{data.code}</Copyable>
			</p>
			<div className='flex-bar flex-center'>
				<img
					src={data.qr}
					alt='Invitation code QR'
					width={300}
					className='img-card'
				/>
			</div>
			<ShareButton type='primary' shareData={shareData}>
				Partager
			</ShareButton>
		</>,
		document.querySelector('main')!,
	)
}
