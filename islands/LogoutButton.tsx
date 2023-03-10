import { hydrate } from 'preact'
import { Button } from '../components/Button.tsx'
import Toast from './Toast.tsx'

async function logout() {
	const response = await fetch('/api/logout', {
		method: 'POST',
	})

	if (!response.ok) {
		hydrate(
			<Toast type='error' message={response.statusText} />,
			document.body,
		)
	}

	location.reload()
}

export default function LogoutButton(
	{ children, ...props }: Parameters<typeof Button>[0],
) {
	return <Button {...props} onClick={logout}>{children}</Button>
}
