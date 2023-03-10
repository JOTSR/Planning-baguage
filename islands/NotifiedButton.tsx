import { Button } from '../components/Button.tsx'

export default function NotifiedButton(
	{ type, children, notificationCount, ...props }: {
		notificationCount: number
	} & Parameters<typeof Button>[0],
) {
	return (
		<Button {...props} type='primary'>
			{children}&nbsp;<span className='notified_button-count'>
				{notificationCount}
			</span>
		</Button>
	)
}
