import prisma from '../lib/prisma.js'

// Simple Telegram message sender
async function sendTelegramMessage(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
  return res.json()
}

// Parse token from cookie header directly (bypass fastify cookie parser race)
function getToken(request) {
  // Try fastify parsed cookies first
  if (request.cookies?.token) return request.cookies.token
  // Fallback: parse raw Cookie header
  const raw = request.headers?.cookie || ''
  const match = raw.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

function requireRole(...roles) {
  return async (request, reply) => {
    try {
      const token = getToken(request)
      if (!token) throw new Error('No token')
      request.user = request.server.jwt.verify(token)
      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({ error: 'Forbidden' })
      }
    } catch (e) {
      if (e.message === 'Forbidden') return reply.status(403).send({ error: 'Forbidden' })
      return reply.status(401).send({ error: 'Unauthorized' })
    }
  }
}

export default async function agentRoutes(app) {
  const canView    = { preHandler: requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER') }
  const canOperate = { preHandler: requireRole('SUPER_ADMIN', 'ADMIN', 'OPERATOR') }
  const canManage  = { preHandler: requireRole('SUPER_ADMIN', 'ADMIN') }

  // GET /api/agents — full tree for canvas
  app.get('/', canView, async () => {
    const agents = await prisma.agent.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        project: { select: { slug: true, name: true } },
      },
    })
    return agents.map(a => ({
      ...a,
      botToken: undefined,
    }))
  })

  // GET /api/agents/:id
  app.get('/:id', canView, async (request, reply) => {
    const agent = await prisma.agent.findUnique({
      where: { id: Number(request.params.id) },
      include: {
        project: { select: { slug: true, name: true } },
        children: { select: { id: true, name: true } },
        commands: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { sentBy: { select: { email: true } } },
        },
      },
    })
    if (!agent) return reply.status(404).send({ error: 'Not found' })
    return { ...agent, botToken: undefined }
  })

  // POST /api/agents — create agent
  app.post('/', canManage, async (request, reply) => {
    const { name, description, botToken, botUsername, chatId, projectId, parentId, posX, posY, color } = request.body
    if (!name || !botToken) {
      return reply.status(400).send({ error: 'name and botToken are required' })
    }
    const agent = await prisma.agent.create({
      data: { name, description, botToken, botUsername, chatId, projectId, parentId, posX, posY, color },
    })
    return { ...agent, botToken: undefined }
  })

  // PATCH /api/agents/:id — update (incl. canvas position)
  app.patch('/:id', canManage, async (request, reply) => {
    const id = Number(request.params.id)
    const agent = await prisma.agent.update({
      where: { id },
      data: request.body,
    })
    return { ...agent, botToken: undefined }
  })

  // DELETE /api/agents/:id
  app.delete('/:id', canManage, async (request, reply) => {
    await prisma.agent.delete({ where: { id: Number(request.params.id) } })
    return { ok: true }
  })

  // POST /api/agents/:id/send — send message to agent's Telegram bot
  app.post('/:id/send', canOperate, async (request, reply) => {
    const { message } = request.body
    if (!message) return reply.status(400).send({ error: 'message is required' })

    const agent = await prisma.agent.findUnique({
      where: { id: Number(request.params.id) },
    })
    if (!agent) return reply.status(404).send({ error: 'Agent not found' })
    if (!agent.chatId) return reply.status(400).send({ error: 'Agent has no chatId configured' })

    const cmd = await prisma.agentCommand.create({
      data: {
        agentId: agent.id,
        sentById: request.user.id,
        message,
        status: 'PENDING',
      },
    })

    try {
      const result = await sendTelegramMessage(agent.botToken, agent.chatId, message)
      await prisma.agentCommand.update({
        where: { id: cmd.id },
        data: {
          status: result.ok ? 'SENT' : 'FAILED',
          response: JSON.stringify(result),
        },
      })
      return { ok: result.ok, messageId: result.result?.message_id }
    } catch (err) {
      await prisma.agentCommand.update({
        where: { id: cmd.id },
        data: { status: 'FAILED', response: err.message },
      })
      return reply.status(500).send({ error: 'Failed to send message' })
    }
  })

  // PATCH /api/agents/:id/position — save canvas position
  app.patch('/:id/position', canManage, async (request, reply) => {
    const { posX, posY } = request.body
    await prisma.agent.update({
      where: { id: Number(request.params.id) },
      data: { posX, posY },
    })
    return { ok: true }
  })
}
