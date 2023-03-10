import { JSX } from 'preact/jsx-runtime'
import { appendJsx, hash } from '../utils.ts'
import Toast from './Toast.tsx'

export async function handleSubmit(event: SubmitEvent) {
	event.preventDefault()
	const form = event.target! as HTMLFormElement
	const submitter = event.submitter as HTMLButtonElement
	const endpoint = event.submitter?.getAttribute('action') ??
		form.getAttribute('action')!
	const method = form.getAttribute('method')!
	let formData = new FormData(form)

	if (submitter.parentElement?.tagName === 'FIELDSET') {
		const fieldset = submitter.parentElement as HTMLFieldSetElement
		if (fieldset.dataset.fieldsetmode === 'only') {
			const form = document.createElement('form')
			form.appendChild(fieldset)
			formData = new FormData(form)
		}
	}
	if (submitter.parentElement?.parentElement?.tagName === 'FIELDSET') {
		const fieldset = submitter.parentElement
			.parentElement as HTMLFieldSetElement
		if (fieldset.dataset.fieldsetmode === 'only') {
			const form = document.createElement('form')
			form.appendChild(fieldset)
			formData = new FormData(form)
		}
	}

	if (formData.has('password')) {
		formData.set('password', await hash(formData.get('password') as string))
	}

	if (submitter.getAttribute('name') !== null) {
		const name = submitter.getAttribute('name')!
		const value = submitter.getAttribute('value')!
		formData.set(name, value)
	}

	const response = await fetch(endpoint, {
		body: formData,
		method: 'POST',
	})

	if (form.parentElement?.tagName === 'DIALOG') {
		const dialog = form.parentElement as HTMLDialogElement
		if (
			submitter.parentElement?.tagName !== 'FIELDSET' &&
			submitter.parentElement?.parentElement?.tagName !== 'FIELDSET'
		) {
			dialog.close()
		}
	}

	if (!response.ok) {
		try {
			const { message } = await response.json()
			appendJsx(
				<Toast type='error' message={message} />,
				document.body,
			)
		} catch (e) {
			appendJsx(
				<Toast type='error' message={String(e)} />,
				document.body,
			)
		}
		return response
	}

	if (form.parentElement?.tagName === 'DIALOG') {
		const dialog = form.parentElement as HTMLDialogElement

		if (
			submitter.parentElement?.tagName !== 'FIELDSET' &&
			submitter.parentElement?.parentElement?.tagName !== 'FIELDSET'
		) {
			form.querySelectorAll('input').forEach((input) => input.value = '')
		}

		const { message } = await response.json()
		appendJsx(
			<Toast type='success' message={message} />,
			document.body,
		)
	}

	if (method === 'POST') location.reload()
	return response
}

export default function Submitter(
	props: JSX.HTMLAttributes<HTMLFormElement> & {
		method: 'POST' | 'DIALOG'
		action: string
	},
) {
	return (
		<form
			{...props}
			onSubmit={(e) => handleSubmit(e as unknown as SubmitEvent)}
		>
			{props.children}
		</form>
	)
}
