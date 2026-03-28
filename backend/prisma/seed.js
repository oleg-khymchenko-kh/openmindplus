import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@openmindplus.com'
  const password = process.env.ADMIN_PASSWORD || 'changeme'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin user already exists: ${email}`)
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, role: 'ADMIN' },
  })

  console.log(`Admin user created: ${user.email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
