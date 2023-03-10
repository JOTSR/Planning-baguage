import { hydrate } from 'preact'
import { Button } from '../components/Button.tsx'
import Toast from './Toast.tsx'

async function share(shareData: ShareData) {
	try {
		await navigator.share(shareData)
		hydrate(<Toast type='success' message='Partagé' />, document.body)
	} catch (error) {
		hydrate(
			<Toast type='error' message={error.toString()} />,
			document.body,
		)
	}
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
