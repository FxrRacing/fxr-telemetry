// sessions.ts
import { Context, Hono } from 'hono'
import { listCheckoutSessions } from '../../db/queries/sessions'

const app = new Hono()

app.get('/', listSessions)
app.post('/', createSession)
app.get('/:id', (c) => c.json(`get ${c.req.param('id')}`))

export default app



async function listSessions(c: Context) {
  const sessions = await listCheckoutSessions(c.var.db)
  return c.json(sessions)
}

async function createSession(c: Context) {
  const body = await c.req.json()

  return c.json({ success: true, message: 'Session created', data: body }, 200)

}