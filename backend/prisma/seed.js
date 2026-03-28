import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const email = process.env.ADMIN_EMAIL || 'admin@openmindplus.com'
  const password = process.env.ADMIN_PASSWORD || 'changeme'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.create({ data: { email, password: hashed, role: 'ADMIN' } })
    console.log(`Admin user created: ${email}`)
  } else {
    console.log(`Admin user already exists: ${email}`)
  }

  // Team members
  const members = [
    // Engineering
    { slug: 'natalia-petrenko',   name: 'Natalia Petrenko',   role: 'Frontend Engineer',       department: 'engineering', order: 1 },
    { slug: 'viktoria-lysenko',   name: 'Viktoria Lysenko',   role: 'Backend Engineer',         department: 'engineering', order: 2 },
    { slug: 'alina-moroz',        name: 'Alina Moroz',        role: 'AI Integration Engineer',  department: 'engineering', order: 3 },
    { slug: 'polina-savchenko',   name: 'Polina Savchenko',   role: 'Data Engineer',            department: 'engineering', order: 4 },
    { slug: 'anastasia-bondar',   name: 'Anastasia Bondar',   role: 'ML Research Engineer',     department: 'engineering', order: 5 },
    { slug: 'yulia-tkachenko',    name: 'Yulia Tkachenko',    role: 'AI Product Engineer',      department: 'engineering', order: 6 },
    { slug: 'iryna-marchenko',    name: 'Iryna Marchenko',    role: 'Systems Architect',        department: 'engineering', order: 7 },
    { slug: 'olena-kravchenko',   name: 'Olena Kravchenko',   role: 'DevOps Engineer',          department: 'engineering', order: 8 },
    // Content
    { slug: 'sofia-kovalenko',    name: 'Sofia Kovalenko',    role: 'Content Writer',           department: 'content', order: 9 },
    { slug: 'darya-melnyk',       name: 'Darya Melnyk',       role: 'Staff Journalist',         department: 'content', order: 10 },
    { slug: 'kateryna-shevchenko',name: 'Kateryna Shevchenko',role: 'Correspondent',            department: 'content', order: 11 },
    { slug: 'maria-kryvoruchko',  name: 'Maria Kryvoruchko',  role: 'Editorial Lead',           department: 'content', order: 12 },
  ]

  for (const m of members) {
    await prisma.teamMember.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    })
  }
  console.log(`${members.length} team members seeded`)

  // Project: getosh.today
  const project = await prisma.project.upsert({
    where: { slug: 'getosh' },
    update: {},
    create: {
      slug: 'getosh',
      name: 'GetOSH',
      tagline: 'Fight your parking fine. In minutes.',
      description: `GetOSH is an AI-powered platform that helps UK drivers understand, challenge, and manage parking fines. Send a photo of your ticket via WhatsApp or Telegram — GetOSH analyses it in seconds, identifies the legal grounds, deadlines, and generates a professional appeal letter ready to send. No forms. No accounts. No legal jargon. Just clarity, fast.`,
      url: 'https://getosh.today',
      order: 1,
    },
  })

  // Link all members to getosh project
  const allMembers = await prisma.teamMember.findMany()
  for (const member of allMembers) {
    await prisma.projectMember.upsert({
      where: { projectId_memberId: { projectId: project.id, memberId: member.id } },
      update: {},
      create: { projectId: project.id, memberId: member.id },
    })
  }
  console.log(`Project getosh seeded, linked to ${allMembers.length} members`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
