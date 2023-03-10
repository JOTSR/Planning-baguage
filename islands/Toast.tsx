import { millisecond } from '../types.ts'
import { IS_BROWSER } from '$fresh/runtime.ts'

export type ToastOptions = {
	message: string
	type: 'info' | 'warning' | 'success' | 'error'
	duration?: millisecond
}

export default function Toast(
	{ message, type, duration = 1500 }: ToastOptions,
) {
	if (type === 'success') return SucessToast(message, duration)
	if (type === 'warning') return WarningToast(message, duration)
	if (type === 'info') return InfoToast(message, duration)
	if (type === 'error') return ErrorToast(message, duration)
	throw new TypeError(`No toast for type: ${type}`)
}

function SucessToast(message: string, duration: millisecond) {
	const id = crypto.randomUUID()
	setTimeout(remove, duration, id)
	return (
		<div
			id={id}
			className='toast toast-success'
			onClick={() => remove(id)}
		>
			<i className='toast-icon ti ti-circle-check'></i>
			<h1 className='toast-title'>Succés</h1>
			<p className='toast-message'>{message}</p>
		</div>
	)
}

function WarningToast(message: string, duration: millisecond) {
	const id = crypto.randomUUID()
	setTimeout(remove, duration, id)
	return (
		<div
			id={id}
			className='toast toast-warning'
			onClick={() => remove(id)}
		>
			<i className='toast-icon ti ti-alert-triangle'></i>
			<h1 className='toast-title'>Avertissement</h1>
			<p className='toast-message'>{message}</p>
		</div>
	)
}

function InfoToast(message: string, duration: millisecond) {
	const id = crypto.randomUUID()
	setTimeout(remove, duration, id)
	return (
		<div id={id} className='toast toast-info' onClick={() => remove(id)}>
			<i className='toast-icon ti ti-info-circle'></i>
			<h1 className='toast-title'>Info</h1>
			<p className='toast-message'>{message}</p>
		</div>
	)
}

function ErrorToast(message: string, duration: millisecond) {
	const id = crypto.randomUUID()
	setTimeout(remove, duration, id)
	return (
		<div
			id={id}
			className='toast toast-error'
			onClick={() => remove(id)}
		>
			<i className='toast-icon ti ti-circle-x'></i>
			<h1 className='toast-title'>Erreur</h1>
			<p className='toast-message'>{message}</p>
		</div>
	)
}

function remove(id: string) {
	if (IS_BROWSER) {
		const toast = document.getElementById(id)
		toast?.classList.add('toast-remove')
		setTimeout(() => toast?.remove(), 500)
	}
}
