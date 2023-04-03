import { IS_BROWSER } from '$fresh/runtime.ts'
import { StateUpdater, useState } from 'preact/hooks'
import { JSX } from 'preact/jsx-runtime'
import { Button } from '../components/Button.tsx'
import { Claim, Outing } from '../types.ts'
import { appendJsx, dateFormat } from '../utils.ts'
import { showModal } from './ActionButton.tsx'
import DialogSubmitter from './DialogSubmitter.tsx'

export default function ClaimDialogButton(
	{ claims, outings }: { claims: Claim[]; outings: Outing[] },
) {
	const id = crypto.randomUUID()

	const [outingsState, setOutings] = useState(outings)
	const [pendingClaims, setPendingClaims] = useState(
		claims.filter(({ status }) => status === 'pending'),
	)
	const [acceptedClaims, setAcceptedClaims] = useState(
		claims.filter(({ status }) => status === 'accepted'),
	)

	const dialog = (
		<DialogSubmitter
			title='Examiner les demandes'
			action='/api/claims/handle'
			method='GET'
			id={id}
			onClose={() =>
				updateVue(setPendingClaims, setAcceptedClaims, setOutings)}
		>
			{pendingClaims.length > 0
				? pendingClaims.map((claim) => (
					<FieldSetPending
						claim={claim}
						outings={outingsState}
						onClick={() =>
							updateVue(
								setPendingClaims,
								setAcceptedClaims,
								setOutings,
							)}
					/>
				))
				: 'Section vide - fermer pour rafraîchir'}
			<span className='dialog-list-separator'>Acceptées</span>
			{acceptedClaims.length > 0
				? acceptedClaims.map((claim) => (
					<FieldSetAccepted claim={claim} outings={outingsState} />
				))
				: 'Section vide - fermer pour rafraîchir'}
		</DialogSubmitter>
	)

	if (IS_BROWSER) {
		appendJsx(dialog, document.body)
	}

	return (
		<Button type='primary' onClick={() => showModal(id)}>
			Demandes &nbsp;
			<span className='notified_button-count'>
				{pendingClaims.length.toString().padStart(2, '0')}
			</span>
		</Button>
	)
}

function FieldSetPending(
	{ claim, outings, ...props }:
		& { claim: Claim; outings: Outing[] }
		& JSX.HTMLAttributes<HTMLFieldSetElement>,
) {
	const { email, lastname, outing, uuid, firstname } = claim
	return (
		<fieldset
			className='form-fieldset'
			name='claim-selected'
			data-fieldsetmode='only'
			{...props}
		>
			<legend className='form-fieldset-legend'>
				<a href={`mailto:${email}`} target='_blank'>
					<i className='ti ti-mail'></i> {`${lastname} ${firstname}`}
				</a>
			</legend>
			<span className='claim-date'>{toDate(outing, outings)}</span>
			<input type='hidden' name='claim-uuid' value={uuid} />
			<input type='hidden' name='claim-outing' value={outing} />
			<input
				type='hidden'
				name='claim-name'
				value={`${lastname} ${firstname}`}
			/>
			<div className='flex-bar'>
				<Button
					type='primary'
					value='accept'
					name='claim-action'
				>
					Accepter
				</Button>
				<Button
					type='secondary'
					value='reject'
					name='claim-action'
				>
					Rejeter
				</Button>
			</div>
		</fieldset>
	)
}

function FieldSetAccepted(
	{ claim, outings }: { claim: Claim; outings: Outing[] },
) {
	const { email, lastname, outing, uuid, firstname } = claim
	return (
		<fieldset
			className='form-fieldset'
			name='claim-selected'
			data-fieldsetmode='only'
		>
			<legend className='form-fieldset-legend'>
				<a href={`mailto:${email}`} target='_blank'>
					<i className='ti ti-mail'></i> {`${lastname} ${firstname}`}
				</a>
			</legend>
			<span className='claim-date'>{toDate(outing, outings)}</span>
			<input type='hidden' name='claim-uuid' value={uuid} />
			<input type='hidden' name='claim-outing' value={outing} />
			<input
				type='hidden'
				name='claim-name'
				value={`${lastname} ${firstname}`}
			/>
			<div className='flex-bar'>
				<Button
					type='secondary'
					value='reject'
					name='claim-action'
				>
					Révoquer
				</Button>
			</div>
		</fieldset>
	)
}

function toDate(outing: string, outings: Outing[]): string {
	const date = outings.find(({ uuid }) => uuid === outing)
	return date ? dateFormat.format(new Date(date.startDate)) : 'Date invalide'
}

async function updateVue(
	setPendingClaims: StateUpdater<Claim[]>,
	setAcceptedClaims: StateUpdater<Claim[]>,
	setOutings: StateUpdater<Outing[]>,
) {
	if (IS_BROWSER) {
		const { claims } =
			(await (await fetch('/api/db/claims', { method: 'GET' })).json())
				.data as { claims: Claim[] }
		const { outings } =
			(await (await fetch('/api/db/outings', { method: 'GET' })).json())
				.data as { outings: Outing[] }

		const pendingClaims = claims.filter(({ status }) =>
			status === 'pending'
		)
		const acceptedClaims = claims.filter(({ status }) =>
			status === 'accepted'
		)

		setPendingClaims(pendingClaims)
		setAcceptedClaims(acceptedClaims)
		setOutings(outings)
	}
}
