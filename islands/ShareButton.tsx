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
	//@ts-ignore navigator has userAgent
	const message = (navigator.userAgent as string).includes('Firefox')
		? 'Firefox ne supporte pas le partage rapide, essayez plutôt de copier le code'
		: 'Impossible de partager le lien'
	appendJsx(
		<Toast type='error' message={message} />,
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
