import { JSX } from 'preact/jsx-runtime'
import { Button } from '../components/Button.tsx'
import Submitter, { SubmitterOptions } from './Submitter.tsx'

export default function DialogSubmitter(
	{ title, action, children, method, onClose, ...props }:
		& JSX.HTMLAttributes<HTMLDialogElement>
		& {
			title: string
			action: string
			method: SubmitterOptions['method']
			onClose?: (e: CloseEvent) => void
		},
) {
	return (
		//@ts-ignore onClose on dialog
		<dialog {...props} onClose={onClose} className='dialog_submitter'>
			<span className='dialog_submitter-title'>{title}</span>
			<Submitter
				method={method}
				action={action}
				type='DIALOG'
				reload={false}
			>
				{children}
			</Submitter>
			<span className='gap-space'></span>
			<Button type='secondary' onClick={closeModal}>Fermer</Button>
		</dialog>
	)
}

function closeModal(e: Event) {
	const button = e.target as HTMLButtonElement
	const dialog = button.parentElement as HTMLDialogElement
	dialog.close()
}
