import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session/mod.ts'
import { User } from '../../types.ts'
import { RespondJson } from '../../utils.ts'
import { usersTable } from './db/users.ts'

export type SessionData = {
	session: User
}
export type WithSessionHandlers<T extends Record<string, unknown> = never> =
	Handlers<SessionData & T, WithSession>

export const handler: WithSessionHandlers = {
	async POST(req, ctx) {
		const { session } = ctx.state

		const formData = await req.formData()
		const email = formData.get('email') as string
		const password = formData.get('password') as string

		const users = await usersTable.readAll()
		const user = users.find((user) => user.email === email)

		if (user === undefined) {
			return RespondJson({
				data: {},
				message: 'Utilisateur non trouvé',
				status: 404,
			})
		}
		if (password !== user.password) {
			return RespondJson({
				data: {},
				message: 'Mot de passe incorrect',
				status: 401,
			})
		}

		session.set('email', user.email)
		session.set('uuid', user.uuid)
		session.set('lastname', user.lastname)
		session.set('firstname', user.firstname)
		session.set('role', user.role)

		return RespondJson({
			data: {},
			message: `Connecté en tant que ${user.lastname} ${user.firstname}`,
			status: 200,
		})
	},
}
