import { useState } from 'preact/hooks'
import { Button } from '../components/Button.tsx'
import { InputText } from '../components/InputText.tsx'
import { Claim, Outing } from '../types.ts'
import { handleSubmit } from './Submitter.tsx'
import Toast from './Toast.tsx'
import { hydrate } from 'preact'
import { dateFormat } from '../utils.ts'
import { registerSubscription } from '../routes/api/webpush.ts'

export default function OutingsGallery(
	{ outings, code }: { outings: Outing[]; code: string },
) {
	const [displayed, setDisplayed] = useState(0)
	const OneDay = 24 * 3.6e6
	outings = outings.sort((a, b) =>
		new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
	).filter((outing) =>
		Date.now() < new Date(outing.startDate).getTime() + OneDay
	)

	return (
		<>
			<div className='flex-bar'>
				<Button
					type='primary'
					title='Session précédente'
					onClick={() =>
						setDisplayed(loopValue(displayed - 1, outings.length))}
				>
					<i className='ti ti-square-rounded-chevron-left'></i>
				</Button>
				<span className='button button-secondary'>
					{displayed + 1}/{outings.length}
				</span>
				<Button
					type='primary'
					title='Session suivante'
					onClick={() =>
						setDisplayed(loopValue(displayed + 1, outings.length))}
				>
					<i className='ti ti-square-rounded-chevron-right'></i>
				</Button>
			</div>
			<br />
			<form
				method='POST'
				className='form-panel'
				action='/api/db/claims'
				onSubmit={confirmClaim}
			>
				<div className='outings-gallery-session'>
					<p className='outings-gallery-session-date'>
						{dateFormat.format(
							new Date(outings[displayed].startDate),
						)}
					</p>
					<p>
						<small>
							<i className='ti ti-map-pin'></i>{' '}
							{outings[displayed].location}
						</small>
						<br />
						<small>
							<i className='ti ti-note'></i>{' '}
							{outings[displayed].description}
						</small>
					</p>
				</div>
				<input
					type='hidden'
					name='outing'
					value={outings[displayed].uuid}
				/>
				<InputText
					title='Prénom'
					name='lastname'
					type='text'
					required={true}
				/>
				<InputText
					title='Nom'
					name='firstname'
					type='text'
					required={true}
				/>
				<InputText
					title='Adresse mail'
					name='email'
					type='email'
					required={true}
				/>
				<InputText
					title="Code d'accés"
					name='code'
					type='text'
					required={true}
					value={code}
					pattern='[A-Z0-9]{6}'
				/>
				<Button type='primary'>Participer</Button>
			</form>
		</>
	)
}

function loopValue(value: number, max: number): number {
	if (value >= max) return value % max
	if (value < 0) return max + value % max
	return value
}

async function confirmClaim(e: Event) {
	try {
		const choice = confirm('Confimer la réservation')
		if (!choice) e.preventDefault()
		const response = await handleSubmit(e as unknown as SubmitEvent, {
			reload: false,
			type: 'FORM',
		})
		const { data, message } = await response.json() as {
			message: string
			data: { entry: Claim }
		}
		await registerSubscription({
			linkType: 'claim',
			linkedTo: data.entry.uuid,
		})

		hydrate(
			<Toast type='success' message={message} />,
			document.body,
		)
	} catch (error) {
		hydrate(
			<Toast type='error' message={String(error)} />,
			document.body,
		)
	}
}
