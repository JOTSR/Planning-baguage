import { VNode } from 'preact'
import { JSX } from 'preact/jsx-runtime'

export function Button(
	{ type, children, ...props }: {
		type: 'primary' | 'secondary'
	} & JSX.HTMLAttributes<HTMLButtonElement>,
) {
	return (
		<button {...props} className={`button button-${type}`}>
			{children}
		</button>
	)
}
