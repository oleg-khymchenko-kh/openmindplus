import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hierarchy based on openclaw.json subagents allowAgents
// main → [getosh-backend, getosh-web, pcn-downloader-agent, wise-worker, wise-updater, dise-worker, openmindplus, app-frontend]
// getosh-backend → [wise-worker, wise-updater, dise-worker, app-frontend, pcn-downloader-agent, getosh-web]
// wise-worker → [app-frontend, wise-updater]
// wise-updater → [wise-worker]
// dise-worker → [app-frontend]
// app-frontend → [wise-worker]

// Project mapping
const GETOSH_PROJECT_SLUG = 'getosh'
const OMP_PROJECT_SLUG = 'openmindplus'

// Color scheme per role
const COLORS = {
  orchestrator: '#1e40af',  // dark blue - top level
  architect:    '#7c3aed',  // purple - architects
  worker:       '#065f46',  // green - workers
  content:      '#92400e',  // amber - content/web
  system:       '#374151',  // gray - system
}

async function main() {
  const getoshProject = await prisma.project.findUnique({ where: { slug: GETOSH_PROJECT_SLUG } })
  const ompProject = await prisma.project.findUnique({ where: { slug: OMP_PROJECT_SLUG } })

  // Note: botTokens are redacted in config — admin must update them manually via UI
  // We seed the structure and descriptions; tokens stored as placeholder
  const agentDefs = [
    {
      slug: 'main',
      name: 'Main Orchestrator',
      description: 'Top-level OpenClaw agent. Coordinates all other agents. Receives commands from Dev (Oleg).',
      botUsername: 'main',
      color: COLORS.orchestrator,
      projectId: null,
      parentSlug: null,
      posX: 400, posY: 0,
    },
    {
      slug: 'getosh-backend',
      name: 'GetOSH Backend & Architect',
      description: 'Senior architect for GetOSH project. Manages wise-worker, wise-updater, dise-worker, app-frontend, pcn-downloader-agent, getosh-web.',
      botUsername: 'getosh-backend',
      color: COLORS.architect,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'main',
      posX: 150, posY: 150,
    },
    {
      slug: 'system-architect',
      name: 'System Architect',
      description: 'High-level system architecture and design decisions.',
      botUsername: 'system-architect',
      color: COLORS.architect,
      projectId: null,
      parentSlug: 'main',
      posX: 400, posY: 150,
    },
    {
      slug: 'openmindplus',
      name: 'OpenMindPlus Agent',
      description: 'Manages openmindplus.com website development and maintenance. That\'s me!',
      botUsername: 'openmindplus',
      color: COLORS.content,
      projectId: ompProject?.id ?? null,
      parentSlug: 'main',
      posX: 650, posY: 150,
    },
    {
      slug: 'wise-worker',
      name: 'Wise Worker',
      description: 'Core worker for GetOSH. Handles Wise financial integrations and data processing. Can spawn app-frontend and wise-updater.',
      botUsername: 'wise-worker',
      color: COLORS.worker,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 0, posY: 320,
    },
    {
      slug: 'wise-updater',
      name: 'Wise Updater',
      description: 'Updates Wise integration data. Spawned by wise-worker or getosh-backend. Can respawn wise-worker.',
      botUsername: 'wise-updater',
      color: COLORS.worker,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 160, posY: 320,
    },
    {
      slug: 'dise-worker',
      name: 'Dise Worker',
      description: 'Handles DISE (direct debit/financial) processing for GetOSH. Can spawn app-frontend.',
      botUsername: 'dise-worker',
      color: COLORS.worker,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 320, posY: 320,
    },
    {
      slug: 'app-frontend',
      name: 'App Frontend Agent',
      description: 'Frontend development for GetOSH app (app.getosh.today). React + Vite. Can spawn wise-worker.',
      botUsername: 'app-frontend',
      color: COLORS.content,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 480, posY: 320,
    },
    {
      slug: 'pcn-downloader-agent',
      name: 'PCN Downloader',
      description: 'Downloads and processes PCN (Penalty Charge Notice) data for UK parking fines.',
      botUsername: 'pcn-downloader',
      color: COLORS.worker,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 640, posY: 320,
    },
    {
      slug: 'getosh-web',
      name: 'GetOSH Website Agent',
      description: 'Manages getosh.today public website (Next.js static). Handles content and deployments.',
      botUsername: 'getosh-web',
      color: COLORS.content,
      projectId: getoshProject?.id ?? null,
      parentSlug: 'getosh-backend',
      posX: 800, posY: 320,
    },
  ]

  // Upsert all agents (without parentId first)
  const agentMap = {}
  for (const def of agentDefs) {
    const { parentSlug, slug, ...data } = def
    const agent = await prisma.agent.upsert({
      where: { id: (await prisma.agent.findFirst({ where: { name: data.name } }))?.id ?? 0 },
      update: { ...data, botToken: 'REDACTED' },
      create: { ...data, botToken: 'REDACTED' },
    })
    agentMap[slug] = agent
  }

  // Set parent relationships
  for (const def of agentDefs) {
    if (def.parentSlug && agentMap[def.parentSlug] && agentMap[def.slug]) {
      await prisma.agent.update({
        where: { id: agentMap[def.slug].id },
        data: { parentId: agentMap[def.parentSlug].id },
      })
    }
  }

  console.log(`✅ ${agentDefs.length} agents seeded`)
  console.log('⚠️  Bot tokens are set to REDACTED — update them via Admin UI')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
