import { HandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.10.0'
import { UUID } from './types.ts'
import {
	ApiRules,
	getPatchFromBody,
	getPatchFromParams,
	RespondJson,
} from './utils.ts'

const { SUPABASE_KEY, SUPABASE_ENDPOINT } = Deno.env.toObject()

export class DbTable<T extends { uuid: UUID }> {
	#supabase = createClient(SUPABASE_ENDPOINT, SUPABASE_KEY)
	#tableName: string
	constructor(tableName: string) {
		this.#tableName = tableName
	}

	async readAll(): Promise<T[]> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.select()

		if (error) {
			throw Error
		}
		return data
	}

	async read({ uuid }: Pick<T, 'uuid'>): Promise<T> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.select().eq('uuid', uuid)

		if (error) {
			throw Error
		}

		return data[0]
	}

	async create(entry: Omit<T, 'uuid'>): Promise<T> {
		const newEntry = { ...entry, uuid: crypto.randomUUID() } as T

		const { error } = await this.#supabase.from(this.#tableName).insert(
			newEntry,
		)

		if (error) {
			throw Error
		}

		return newEntry
	}

	async update(newEntry: Partial<T> & Pick<T, 'uuid'>): Promise<T> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.update(newEntry).eq('uuid', newEntry.uuid).select()

		if (error) {
			throw Error
		}

		return data[0]
	}

	async delete(entry: Pick<T, 'uuid'>): Promise<T> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.delete().eq('uuid', entry.uuid).select()

		if (error) {
			throw Error
		}

		return data[0]
	}
}

type RoutesRules = {
	get: ApiRules
	post: ApiRules
	put: ApiRules
	delete: ApiRules
}

export class RestHandler<T extends { uuid: UUID }> {
	#entriesTable: DbTable<T>
	#routesRules: RoutesRules
	#tableKeys: (keyof T | 'uuid')[]

	constructor(
		entriesTable: DbTable<T>,
		routesRules: RoutesRules,
		tableKeys: (keyof T | 'uuid')[],
	) {
		this.#entriesTable = entriesTable
		this.#routesRules = routesRules
		this.#tableKeys = tableKeys
	}

	async GET(req: Request, ctx: HandlerContext<never, WithSession>) {
		const { session } = ctx.state

		try {
			await this.#routesRules.get.execute(session)
			const uuid = new URL(req.url).searchParams.get('uuid')

			if (uuid) {
				return RespondJson({
					data: { entry: await this.#entriesTable.read({ uuid }) },
					message: 'Ok',
					status: 200,
				})
			}

			return RespondJson({
				data: { entries: await this.#entriesTable.readAll() },
				message: 'Ok',
				status: 200,
			})
		} catch (error) {
			if (error instanceof Response) return error
			return RespondJson({
				data: { error },
				message: 'Erreur interne',
				status: 500,
			})
		}
	}

	async PUT(req: Request, ctx: HandlerContext<never, WithSession>) {
		const { session } = ctx.state

		try {
			await this.#routesRules.put.execute(session)
			const patch = await getPatchFromBody<T, 'uuid'>(
				req,
				...this.#tableKeys,
			)

			return RespondJson({
				data: { entry: await this.#entriesTable.update(patch) },
				message: 'Ok',
				status: 201,
			})
		} catch (e) {
			return e
		}
	}

	async POST(req: Request, ctx: HandlerContext<never, WithSession>) {
		const { session } = ctx.state

		try {
			const keys = this.#tableKeys.filter((key) =>
				key !== 'uuid'
			) as (keyof T)[]
			await this.#routesRules.post.execute(session)
			const entry = await getPatchFromBody<T, typeof keys[number]>(
				req,
				...keys,
			)

			return RespondJson({
				data: { entry: await this.#entriesTable.create(entry) },
				message: 'Ok',
				status: 200,
			})
		} catch (e) {
			return e
		}
	}

	async DELETE(req: Request, ctx: HandlerContext<never, WithSession>) {
		const { session } = ctx.state

		try {
			await this.#routesRules.delete.execute(session)
			const deleted = getPatchFromParams<T, 'uuid'>(req, 'uuid')

			return RespondJson({
				data: { entry: await this.#entriesTable.delete(deleted) },
				message: 'Ok',
				status: 200,
			})
		} catch (e) {
			return e
		}
	}
}
