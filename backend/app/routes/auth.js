// Temporary in-memory auth (replace with DB later)
const ADMIN_USER = {
  email: process.env.ADMIN_EMAIL || 'admin@openmindplus.com',
  password: process.env.ADMIN_PASSWORD || 'changeme',
}

export default async function authRoutes(app) {
  // POST /api/auth/login
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body

    if (email !== ADMIN_USER.email || password !== ADMIN_USER.password) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    const token = app.jwt.sign(
      { email, role: 'admin' },
      { expiresIn: '7d' }
    )

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return { ok: true, email }
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
        await request.jwtVerify({ onlyCookie: true })
      } catch {
        reply.status(401).send({ error: 'Unauthorized' })
      }
    },
  }, async (request) => {
    return { user: request.user }
  })
}
