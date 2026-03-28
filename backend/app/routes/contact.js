import prisma from '../lib/prisma.js'

export default async function contactRoutes(app) {
  // POST /api/contact
  app.post('/', async (request, reply) => {
    const { name, email, message } = request.body

    if (!name || !email || !message) {
      return reply.status(400).send({ error: 'All fields are required' })
    }

    await prisma.contactMessage.create({
      data: { name, email, message },
    })

    return { ok: true }
  })
}
