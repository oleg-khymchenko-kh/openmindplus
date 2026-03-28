import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import cookie from '@fastify/cookie'
import 'dotenv/config'

const app = Fastify({ logger: true })

// Plugins
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'changeme',
})

await app.register(cookie)

// Routes
import authRoutes from './routes/auth.js'
import healthRoutes from './routes/health.js'

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(healthRoutes, { prefix: '/api' })

// Start server
const PORT = process.env.PORT || 4000

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Server running on port ${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
