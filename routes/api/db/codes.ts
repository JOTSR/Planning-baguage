import { Code } from '../../../types.ts'
import { RespondJson } from '../../../utils.ts'
import { WithSessionHandlers } from '../login.ts'
import { qrcode } from 'https://deno.land/x/qrcode@v2.0.0/mod.ts'
import { DbTable } from '../../../database.ts'

export const handler: WithSessionHandlers = {
	async GET(_req, _ctx) {
		return RespondJson({
			data: { codes: await codesTable.readAll() },
			message: 'Ok',
			status: 200,
		})
	},
	async POST(req, _ctx) {
		const { origin } = new URL(req.url)
		const code = Date.now().toString(16).toUpperCase().slice(5)
		const endpoint = `${origin}/code/`
		const link = `${endpoint}${code}`
		const qr = await qrcode(link) as unknown as string

		await codesTable.create({ code, createdAt: new Date().toISOString() })

		return RespondJson({
			data: { qr, endpoint, code, link },
			message: 'Ok',
			status: 200,
		})
	},
}

export const codesTable = new DbTable<Code>('codes')
