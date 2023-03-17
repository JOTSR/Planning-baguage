import { Code } from '../../../types.ts'
import { ApiRules, RespondJson } from '../../../utils.ts'
import { qrcode } from 'https://deno.land/x/qrcode@v2.0.0/mod.ts'
import { DbTable, restHandler } from '../../../database.ts'

export const codesTable = new DbTable<Code>('codes')

export const handler = restHandler(codesTable, {
	get: ApiRules,
	put: ApiRules.notImplemented(),
	post: ApiRules.notImplemented(),
	delete: ApiRules.notImplemented(),
}, ['uuid', 'code', 'createdAt'])

handler.POST = async function (req, _ctx) {
	try {
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
	} catch (error) {
		if (error instanceof Response) return error
		return RespondJson({
			data: { error },
			message: 'Erreur interne',
			status: 500,
		})
	}
}
