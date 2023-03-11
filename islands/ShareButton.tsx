import { hydrate } from 'preact'
import { Button } from '../components/Button.tsx'
import { appendJsx } from '../utils.ts'
import Toast from './Toast.tsx'

async function share(shareData: ShareData) {
	if ('share' in navigator) {
		try {
			await navigator.share(shareData)
			appendJsx(<Toast type='success' message='Partagé' />, document.body)
		} catch (error) {
			appendJsx(
				<Toast type='error' message={error.toString()} />,
				document.body,
			)
		}
		return
	}
	try {
		await (navigator as Navigator).clipboard.writeText(shareData.url!)
		appendJsx(
			<Toast type='success' message='Lien copié dans le presse papier' />,
			document.body,
		)
	} catch (error) {
		appendJsx(
			<Toast type='error' message={error.toString()} />,
			document.body,
		)
	}
	appendJsx(
		<Toast type='error' message='Impossible de partager le lien' />,
		document.body,
	)
}

type ShareButtonProps = {
	shareData: ShareData
} & Parameters<typeof Button>[0]

export default function ShareButton(props: ShareButtonProps) {
	return (
		<Button type={props.type} onClick={() => share(props.shareData)}>
			{props.children}
		</Button>
	)
}
