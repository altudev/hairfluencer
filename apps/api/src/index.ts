import { Hono } from 'hono'
import { auth } from './auth'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Mount Better Auth routes
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

export default app
