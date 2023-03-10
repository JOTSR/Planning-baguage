import { JSX } from 'preact/jsx-runtime'
import { second } from '../types.ts'
import { useState } from 'preact/hooks'
import { IS_BROWSER } from '$fresh/runtime.ts'

export default function Redirect(
	{ children, delay, url, ...props }: JSX.HTMLAttributes<HTMLSpanElement> & {
		children?: string
		delay: second
		url: string
	},
) {
	const [rest, setRest] = useState(delay)
	if (IS_BROWSER) {
		setInterval(() => {
			if (rest <= 0) {
				location.href = url
				return
			}
			setRest(rest - 1)
		}, 1000)
	}

	if (children) {
		return (
			<span {...props}>
				{children} {rest}s (<a href={url}>lien de secours</a>)
			</span>
		)
	}
	return <span hidden></span>
}
