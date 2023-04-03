import { IS_BROWSER } from '$fresh/runtime.ts'
import { useState } from 'preact/hooks'
import { Button } from '../components/Button.tsx'
import { InputText } from '../components/InputText.tsx'
import { Outing } from '../types.ts'
import { appendJsx, dateFormat, isoDateStringToLocale } from '../utils.ts'
import { showModal } from './ActionButton.tsx'
import DialogSubmitter from './DialogSubmitter.tsx'

export default function EditSessionDialogButton(
	{ outings }: { outings: Outing[] },
) {
	const idOutingStart = crypto.randomUUID()
	const idOutingDate = crypto.randomUUID()
	const idOutingDesc = crypto.randomUUID()
	const idOutingLocation = crypto.randomUUID()
	const id = crypto.randomUUID()

	const [uuid, setUuid] = useState('')

	const body = (
		<>
			<label className='form-input'>
				<span className='form-input-label'>Sessions</span>
				<select
					className='form-input-field'
					name='uuid'
					onChange={(e) => {
						setUuid((e.target as HTMLSelectElement).value)
						const outing = outings.find((outing) =>
							outing.uuid === uuid
						)!
						;(document.getElementById(
							idOutingDate,
						) as HTMLInputElement).value = isoDateStringToLocale(
							outing.startDate,
						)
						;(document.getElementById(
							idOutingStart,
						) as HTMLInputElement).value = outing.startDate
						;(document.getElementById(
							idOutingDesc,
						) as HTMLInputElement).value = outing.description
						;(document.getElementById(
							idOutingLocation,
						) as HTMLInputElement).value = outing.location
					}}
				>
					<option>---</option>
					{outings.map(({ uuid, startDate }) => (
						<option value={uuid}>
							{dateFormat.format(new Date(startDate))}
						</option>
					))}
				</select>
			</label>
			<InputText
				id={idOutingDate}
				title='Date de la sortie'
				name='startDatelocal'
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
			<input id={idOutingStart} type='hidden' name='startDate' />
			<InputText
				id={idOutingLocation}
				title='Lieux'
				name='location'
				type='text'
				required={true}
			/>
			<InputText
				id={idOutingDesc}
				title='Notes'
				name='description'
				type='text'
				required={false}
			/>
			<div className='flex-bar'>
				<Button type='primary'>Valider</Button>
				<Button
					type='secondary'
					action={`/api/db/outings?uuid=${uuid}`}
					method='DELETE'
					onClick={(e) => {
						const response = confirm('Supprimer la sortie ?')
						if (!response) e.preventDefault()
					}}
				>
					Supprimer
				</Button>
			</div>
		</>
	)

	const dialog = (
		<DialogSubmitter
			title='Modifier une session'
			action='/api/db/outings'
			method='PUT'
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
			Modifier une session existante
		</Button>
	)
}
