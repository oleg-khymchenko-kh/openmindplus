import bcrypt from 'bcrypt'
import prisma from '../lib/prisma.js'

export default async function authRoutes(app) {
  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const token = app.jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      { expiresIn: '7d' }
    )

    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return { ok: true, email: user.email, role: user.role }
  })

  // POST /api/auth/logout
  app.post('/logout', async (request, reply) => {
    reply.clearCookie('token')
    return { ok: true }
  })

  // GET /api/auth/me
  app.get('/me', {
    preHandler: async (request, reply) => {
      try {
        const token = request.cookies?.token
        if (!token) throw new Error('No token')
        request.user = request.server.jwt.verify(token)
      } catch {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    },
  }, async (request) => {
    return { user: request.user }
  })
}
