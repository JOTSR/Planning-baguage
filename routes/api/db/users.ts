import { DbTable, restHandler } from '../../../database.ts'
import { User } from '../../../types.ts'
import { ApiRules } from '../../../utils.ts'
export const usersTable = new DbTable<User>('users')

export const handler = restHandler(usersTable, {
	routesRules: {
		get: ApiRules.logged().roles('admin', 'moderator'),
		put: ApiRules.notImplemented(),
		post: ApiRules.notImplemented(),
		delete: ApiRules.notImplemented(),
	},
	tableKeys: ['uuid', 'email', 'lastname', 'firstname', 'password', 'role'],
})
