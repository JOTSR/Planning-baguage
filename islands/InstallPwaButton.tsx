import { IS_BROWSER } from '$fresh/runtime.ts'
import { StateUpdater, useState } from 'preact/hooks'
import { Button } from '../components/Button.tsx'
import { BeforeInstallPromptEvent } from '../types.ts'

export default function InstallPwaButton(
	{ children }: { children: string },
) {
	const [deferredPrompt, setDeferredPrompt] = useState<
		BeforeInstallPromptEvent
	>()

	if (IS_BROWSER) {
		addEventListener('beforeinstallprompt', (e) => {
			setDeferredPrompt(e as BeforeInstallPromptEvent)
		})
	}

	return (
		<Button
			type='primary'
			onClick={() => installPwa(setDeferredPrompt, deferredPrompt)}
		>
			<i className='ti ti-apps'></i> {children}
		</Button>
	)
}

async function installPwa(
	setDeferredPrompt: StateUpdater<BeforeInstallPromptEvent | undefined>,
	deferredPrompt?: BeforeInstallPromptEvent,
) {
	if (deferredPrompt) {
		deferredPrompt.prompt()
		await deferredPrompt.userChoice
		setDeferredPrompt(undefined)
	}
}
