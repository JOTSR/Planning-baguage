import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { cookieSession, WithSession } from 'fresh_session/mod.ts'

export type State = Record<string, unknown> & WithSession

const session = cookieSession()

function sessionHandler(req: Request, ctx: MiddlewareHandlerContext<State>) {
	return session(req, ctx)
}

export const handler = [sessionHandler]
