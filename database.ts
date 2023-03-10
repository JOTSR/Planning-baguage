import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0"
import { UUID } from './types.ts'

const { SUPABASE_PWD, SUPABASE_ENDPOINT } = Deno.env.toObject()

export class DbTable<T extends { uuid: UUID }> {
	#supabase = createClient(SUPABASE_ENDPOINT, SUPABASE_PWD)
	#tableName: string
	constructor(tableName: string) {
		this.#tableName = tableName
	}

	async readAll(): Promise<T[]> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.select('*')
		if (error) {
			throw Error
		}
		return data
	}

	async read({ uuid }: Pick<T, 'uuid'>): Promise<T> {
		const { data, error } = await this.#supabase.from(this.#tableName)
			.select('*').eq('uuid', uuid)

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
