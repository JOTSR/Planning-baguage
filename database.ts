import { HandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.10.0'
import { SessionData, WithSessionHandlers } from './routes/api/login.ts'
import { HttpMethod, UUID } from './types.ts'
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
	[k in Lowercase<HttpMethod>]: typeof ApiRules
}

type RoutesHooks = {
	[k in Lowercase<HttpMethod>]?: {
		onReceive?: HookHandler
		onSuccess?: HookHandler
		onError?: HookHandler
	}
}

export type HookHandler<T extends Record<string, unknown> = never> = (
	req: Request,
	ctx: HandlerContext<T & SessionData>,
) => void | Promise<void>

export function restHandler<
	T extends { uuid: UUID },
	U extends Record<string, unknown> = never,
>(
	entriesTable: DbTable<T>,
	{
		routesRules,
		routesHooks,
		tableKeys,
	}: {
		routesRules: RoutesRules
		routesHooks?: RoutesHooks
		tableKeys: (keyof T | 'uuid')[]
	},
): WithSessionHandlers<U> {
	return {
		async GET(
			req: Request,
			ctx: HandlerContext<U & SessionData, WithSession>,
		) {
			try {
				await routesHooks?.get?.onReceive?.(req, ctx)
				await routesRules.get.execute<U & SessionData>(req, ctx)
				const uuid = new URL(req.url).searchParams.get('uuid')

				if (uuid) {
					await routesHooks?.get?.onSuccess?.(req, ctx)
					return RespondJson({
						data: { entry: await entriesTable.read({ uuid }) },
						message: 'Ok',
						status: 200,
					})
				}

				await routesHooks?.get?.onSuccess?.(req, ctx)
				return RespondJson({
					data: { entries: await entriesTable.readAll() },
					message: 'Ok',
					status: 200,
				})
			} catch (error) {
				await routesHooks?.get?.onError?.(req, ctx)
				if (error instanceof Response) return error
				return RespondJson({
					data: { error },
					message: 'Erreur interne',
					status: 500,
				})
			}
		},
		async PUT(
			req: Request,
			ctx: HandlerContext<U & SessionData, WithSession>,
		) {
			try {
				await routesHooks?.get?.onReceive?.(req, ctx)
				await routesRules.put.execute<U & SessionData>(req, ctx)
				const patch = await getPatchFromBody<T, 'uuid'>(
					req,
					...tableKeys,
				)

				await routesHooks?.get?.onSuccess?.(req, ctx)
				return RespondJson({
					data: { entry: await entriesTable.update(patch) },
					message: 'Entrée modifiée',
					status: 201,
				})
			} catch (e) {
				await routesHooks?.get?.onError?.(req, ctx)
				return e
			}
		},
		async POST(
			req: Request,
			ctx: HandlerContext<U & SessionData, WithSession>,
		) {
			try {
				await routesHooks?.get?.onReceive?.(req, ctx)
				const keys = tableKeys.filter((key) =>
					key !== 'uuid'
				) as (keyof T)[]
				await routesRules.post.execute<U & SessionData>(req, ctx)
				const entry = await getPatchFromBody<T, typeof keys[number]>(
					req,
					...keys,
				)

				await routesHooks?.get?.onSuccess?.(req, ctx)
				return RespondJson({
					data: { entry: await entriesTable.create(entry) },
					message: 'Entrée crée',
					status: 200,
				})
			} catch (e) {
				await routesHooks?.get?.onError?.(req, ctx)
				return e
			}
		},
		async DELETE(
			req: Request,
			ctx: HandlerContext<U & SessionData, WithSession>,
		) {
			try {
				await routesHooks?.get?.onReceive?.(req, ctx)
				await routesRules.delete.execute<U & SessionData>(req, ctx)
				const deleted = getPatchFromParams<T, 'uuid'>(req, 'uuid')

				await routesHooks?.get?.onSuccess?.(req, ctx)
				return RespondJson({
					data: { entry: await entriesTable.delete(deleted) },
					message: 'Entrée supprimée',
					status: 200,
				})
			} catch (e) {
				await routesHooks?.get?.onError?.(req, ctx)
				return e
			}
		},
	}
}
