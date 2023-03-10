import { IS_BROWSER } from '$fresh/runtime.ts'
import { Button } from '../components/Button.tsx'
import { InputText } from '../components/InputText.tsx'
import { appendJsx } from '../utils.ts'
import { showModal } from './ActionButton.tsx'
import DialogSubmitter from './DialogSubmitter.tsx'

export default function AddSessionDialogButton() {
	const idOutingStart = crypto.randomUUID()

	const body = (
		<>
			<InputText
				title='Date de la session'
				name='outing-date-local'
				type='datetime-local'
				required={true}
				onInput={(e) => {
					const input = e.target as HTMLInputElement
					const hidden = document.getElementById(
						idOutingStart,
					) as HTMLInputElement
					hidden.value = new Date(input.value).toISOString()
				}}
			/>
			<input id={idOutingStart} type='hidden' name='outing-date' />
			<InputText
				title='Lieux'
				name='outing-location'
				type='text'
				required={true}
			/>
			<InputText
				title='Notes'
				name='outing-description'
				type='text'
				required={false}
			/>
			<div className='flex-bar'>
				<Button type='primary'>Valider</Button>
			</div>
		</>
	)

	const id = crypto.randomUUID()

	const dialog = (
		<DialogSubmitter
			title='Ajouter une session'
			action='/api/outings/add'
			id={id}
		>
			{body}
		</DialogSubmitter>
	)

	if (IS_BROWSER) {
		appendJsx(dialog, document.body)
	}

	return (
		<Button type='primary' onClick={() => showModal(id)}>
			Ajouter une session
		</Button>
	)
}
