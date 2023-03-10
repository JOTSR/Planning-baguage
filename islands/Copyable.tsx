import { hydrate } from 'preact'
import { JSX } from 'preact/jsx-runtime'
import Toast from './Toast.tsx'

async function copy(text: string) {
	try {
		await navigator.clipboard.writeText(text)
		hydrate(
			<Toast type='success' message='Copié dans le presse papier' />,
			document.body,
		)
	} catch (error) {
		hydrate(
			<Toast type='error' message={error.toString()} />,
			document.body,
		)
	}
}

export default function Copyable(
	{ children, ...props }: JSX.HTMLAttributes<HTMLSpanElement> & {
		children: string
	},
) {
	return (
		<span
			onClick={() => copy(children)}
			{...props}
			className='span-copyable'
		>
			{children}
		</span>
	)
}
