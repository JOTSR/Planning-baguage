import { Handlers, PageProps } from '$fresh/server.ts'
import { Cookie, setCookie } from '$std/http/mod.ts'
import Redirect from '../../islands/Redirect.tsx'
import Toast from '../../islands/Toast.tsx'
import { codesTable } from '../api/db/codes.ts'

type HandlerFormat = { code: string; success: boolean }

export const handler: Handlers<HandlerFormat> = {
	async GET(_req, ctx) {
		const { code } = ctx.params
		const codes = await codesTable.readAll()
		const validityDuration = 90 * 24 * 3.6e6
		//Delete old codes
		codes.forEach((code) => {
			if (
				Date.now() - new Date(code.createdAt).getTime() >
					validityDuration
			) {
				codesTable.delete(code)
			}
		})

		const success = codes.find((entry) => entry.code === code) !== undefined //? remove used code

		const response = await ctx.render({ code, success })

		if (success) {
			const cookie: Cookie = {
				name: 'inviteCode',
				value: code,
				path: '/',
			}
			setCookie(response.headers, cookie)
		}

		return response
	},
}

export default function Code(props: PageProps<HandlerFormat>) {
	if (props.data.success) {
		return (
			<>
				<h1>Code {props.data.code}</h1>
				<Redirect delay={3} url='/'>
					Vous allez être redirigé dans
				</Redirect>
				<Toast
					message={`Le code ${props.data.code} est valide`}
					type='success'
				/>
			</>
		)
	}
	return (
		<>
			<h1>Code {props.data.code}</h1>
			<Redirect delay={3} url='about:newtab'>
				Vous allez quitter le site dans
			</Redirect>
			<Toast
				message={`Le code ${props.data.code} est invalide`}
				type='error'
			/>
		</>
	)
}
