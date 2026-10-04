import type { MetadataRoute } from 'next'
import { SITE_URL } from './lib/seo'

// A crawler obeys only the first group that names it and never reads the "*"
// group, so every rule has to be repeated per agent. Without that, the AI
// crawlers below would miss the ?_rsc= exclusion and index Next's prefetch
// payloads as duplicates of real pages.
const AGENTS = ['*', 'GPTBot', 'ClaudeBot', 'OAI-SearchBot', 'PerplexityBot', 'Google-Extended']

const DISALLOW = [
  '/admin/',     // nothing behind the login belongs in an index
  '/api/',
  '/*?_rsc=',    // Next.js prefetch URLs, served as full HTML
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: AGENTS.map(userAgent => ({ userAgent, allow: '/', disallow: DISALLOW })),
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
