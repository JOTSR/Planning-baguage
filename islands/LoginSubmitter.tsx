import { hydrate } from 'preact'
import { Button } from '../components/Button.tsx'
import { InputText } from '../components/InputText.tsx'
import { registerSubscription } from '../routes/api/webpush.ts'
import { User } from '../types.ts'
import Submitter, { handleSubmit } from './Submitter.tsx'
import Toast from './Toast.tsx'

export default function LoginSubmitter() {
	return (
		<Submitter
			action='/api/login'
			method='POST'
			type='FORM'
			reload={true}
			className='form-panel'
			onSubmit={handleLogin}
		>
			<InputText
				title='Mail'
				type='email'
				name='email'
				required={true}
			/>
			<InputText
				title='Mot de passe'
				type='password'
				name='password'
				required={true}
			/>
			<Button type='primary'>Connection</Button>
		</Submitter>
	)
}

async function handleLogin(e: Event) {
	try {
		const choice = confirm('Confimer la réservation')
		if (!choice) e.preventDefault()
		const response = await handleSubmit(e as unknown as SubmitEvent, {
			reload: true,
			type: 'FORM',
		})
		const { data, message } = await response.json() as {
			message: string
			data: { entry: User }
		}
		await registerSubscription({
			linkType: 'user',
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
