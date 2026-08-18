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

  // Other projects (no team links yet)
  const projects = [
    {
      slug: 'argo-aero',
      name: 'Argo Aero',
      tagline: 'Gyrocopters in London — sales, training, maintenance.',
      description: `Argo Aero is the official UK dealer for Polish-built gyroplanes, operating out of London. The company sells the ARGON 915 iS and ARGON GTL, runs pilot training and test flights, and provides maintenance and repair. Gyroplanes combine helicopter-like flight with mechanical simplicity, which makes them compact, highly reliable and far cheaper to own and run than a helicopter — suited to recreational flying, aerial photography and agricultural monitoring. Argo Aero holds CAA A8-21 Factory Approval, with full BCAR-T certification in progress.`,
      url: 'https://argoaero.co.uk',
      order: 2,
    },
    {
      slug: 'autoe',
      name: 'AutoE',
      tagline: 'The Joy of Charging Well.',
      description: `AutoE builds and operates EV charging infrastructure across the UK. The company designs and manufactures its own charge point controllers and stations (Type 1, Type 2, CCS Combo and CHAdeMO), installs them for homes, businesses and car parks, and runs a public charging network. Drivers use the AutoE app to find a free station nearby, start and stop a session from their phone and top up their balance; station owners get a web dashboard to set their own tariffs, add idle fees and track income. Existing charger owners can join the network to have their hardware upgraded and monetised, backed by 24/7 support.`,
      url: 'https://autoe.co.uk',
      order: 3,
    },
  ]

  for (const p of projects) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: {}, create: p })
  }
  console.log(`${projects.length} additional projects seeded`)

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

  // Team assignments for the other projects. A member can be on several projects.
  const assignments = {
    'argo-aero': [
      'natalia-petrenko',   // Frontend Engineer
      'viktoria-lysenko',   // Backend Engineer
      'alina-moroz',        // AI Integration Engineer — Telegram enquiry bot
      'olena-kravchenko',   // DevOps Engineer
      'sofia-kovalenko',    // Content Writer
      'maria-kryvoruchko',  // Editorial Lead
    ],
    autoe: [
      'iryna-marchenko',    // Systems Architect
      'viktoria-lysenko',   // Backend Engineer
      'natalia-petrenko',   // Frontend Engineer
      'polina-savchenko',   // Data Engineer — charge point telemetry
      'olena-kravchenko',   // DevOps Engineer
      'yulia-tkachenko',    // AI Product Engineer
    ],
  }

  const bySlug = new Map(allMembers.map(m => [m.slug, m]))
  for (const [projectSlug, memberSlugs] of Object.entries(assignments)) {
    const target = await prisma.project.findUnique({ where: { slug: projectSlug } })
    if (!target) continue
    for (const memberSlug of memberSlugs) {
      const member = bySlug.get(memberSlug)
      if (!member) {
        console.warn(`  ! unknown member slug: ${memberSlug}`)
        continue
      }
      await prisma.projectMember.upsert({
        where: { projectId_memberId: { projectId: target.id, memberId: member.id } },
        update: {},
        create: { projectId: target.id, memberId: member.id },
      })
    }
    console.log(`Project ${projectSlug} linked to ${memberSlugs.length} members`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
