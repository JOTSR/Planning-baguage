import { JSX } from 'preact/jsx-runtime'
import { Button } from '../components/Button.tsx'
import Submitter from './Submitter.tsx'

export default function DialogSubmitter(
	{ title, action, children, onClose, ...props }:
		& JSX.HTMLAttributes<HTMLDialogElement>
		& { title: string; action: string; onClose?: (e: CloseEvent) => void },
) {
	return (
		//@ts-ignore onClose on dialog
		<dialog {...props} onClose={onClose} className='dialog_submitter'>
			<span className='dialog_submitter-title'>{title}</span>
			<Submitter
				method='DIALOG'
				action={action}
				className='form-panel dialog_submitter-form'
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
