import prisma from '../lib/prisma.js'

export default async function teamRoutes(app) {
  // GET /api/team
  app.get('/', async () => {
    return prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        slug: true, name: true, role: true, department: true,
        photoUrl: true, linkedinUrl: true, instagramUrl: true,
        xUrl: true, telegramUrl: true,
      },
    })
  })

  // GET /api/team/:slug
  app.get('/:slug', async (request, reply) => {
    const member = await prisma.teamMember.findUnique({
      where: { slug: request.params.slug },
      include: {
        projects: {
          include: {
            project: {
              select: { slug: true, name: true, tagline: true, url: true, logoUrl: true },
            },
          },
        },
      },
    })
    if (!member) return reply.status(404).send({ error: 'Not found' })
    return member
  })
}
