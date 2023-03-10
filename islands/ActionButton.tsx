import { IS_BROWSER } from '$fresh/runtime.ts'
import { hydrate, JSX } from 'preact'
import { Button } from '../components/Button.tsx'

export default function ActionButton(
	{ type, children, dialog, ...props }: Parameters<typeof Button>[0] & {
		dialog: JSX.Element
	},
) {
	const id = crypto.randomUUID()

	if (IS_BROWSER) {
		dialog.props.id = id
		hydrate(dialog, document.body)
	}

	return (
		<Button type={type} {...props} onClick={() => showModal(id)}>
			{children}
		</Button>
	)
}

export function showModal(id: string) {
	if (IS_BROWSER) {
		const dialog = document.getElementById(id) as HTMLDialogElement
		dialog.showModal()
	}
}
