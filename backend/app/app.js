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

await app.register(cookie)

await app.register(jwt, {
  secret: process.env.JWT_SECRET || 'changeme',
  cookie: {
    cookieName: 'token',
    signed: false,
  },
})

// Routes
import authRoutes from './routes/auth.js'
import healthRoutes from './routes/health.js'
import teamRoutes from './routes/team.js'
import projectRoutes from './routes/projects.js'
import contactRoutes from './routes/contact.js'
import agentRoutes from './routes/agents.js'

await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(healthRoutes, { prefix: '/api' })
await app.register(teamRoutes, { prefix: '/api/team' })
await app.register(projectRoutes, { prefix: '/api/projects' })
await app.register(contactRoutes, { prefix: '/api/contact' })
await app.register(agentRoutes, { prefix: '/api/agents' })

// Start server
const PORT = process.env.PORT || 4000

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`Server running on port ${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
