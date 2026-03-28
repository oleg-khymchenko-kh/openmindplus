import prisma from '../lib/prisma.js'

export default async function projectRoutes(app) {
  // GET /api/projects
  app.get('/', async () => {
    return prisma.project.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        slug: true, name: true, tagline: true, url: true, logoUrl: true,
      },
    })
  })

  // GET /api/projects/:slug
  app.get('/:slug', async (request, reply) => {
    const project = await prisma.project.findUnique({
      where: { slug: request.params.slug },
      include: {
        members: {
          include: {
            member: {
              select: {
                slug: true, name: true, role: true, photoUrl: true,
              },
            },
          },
          orderBy: { member: { order: 'asc' } },
        },
      },
    })
    if (!project) return reply.status(404).send({ error: 'Not found' })
    return project
  })
}
