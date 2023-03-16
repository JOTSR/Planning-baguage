import { JSX } from 'preact/jsx-runtime'
import {
	appendJsx,
	formOrFieldsetData,
	hashFormPassword,
} from '../utils.ts'
import Toast from './Toast.tsx'

export async function handleSubmit(
	event: SubmitEvent,
	{ method, reload, action, type }: SubmitterOptions,
) {
	event.preventDefault()
	const form = event.target! as HTMLFormElement
	const submitter = event.submitter as HTMLButtonElement
	const endpoint = action
	const formData = await formOrFieldsetData(event)

	await hashFormPassword(formData)

	const response = await fetch(endpoint, {
		body: formData,
		method,
	})

	if (type === 'DIALOG') {
		(form.parentElement as HTMLDialogElement).close()
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
	}

	if (type === 'DIALOG') {
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

	if (reload) location.reload()
	return response
}

export default function Submitter(
	{ method, type, action, reload, ...props }:
		& JSX.HTMLAttributes<HTMLFormElement>
		& SubmitterOptions,
) {
	return (
		<form
			formMethod={method}
			formAction={action}
			{...props}
			onSubmit={(e) =>
				handleSubmit(e as unknown as SubmitEvent, {
					method,
					reload,
					action,
					type,
				})}
		>
			{props.children}
		</form>
	)
}

export type SubmitterOptions = {
	type: 'DIALOG' | 'FORM'
	method: 'POST' | 'PUT' | 'GET' | 'DELETE'
	reload: boolean
	action: string
}
