import type { MetadataRoute } from 'next'
import { SITE_URL } from './lib/seo'

// Rebuilt hourly so a newly added project or team member shows up without a deploy.
export const revalidate = 3600

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${path}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, team] = await Promise.all([
    fetchList<{ slug: string; createdAt: string }>('/api/projects'),
    fetchList<{ slug: string }>('/api/team'),
  ])

  return [
    { url: SITE_URL,                changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/projects`,  changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/team`,      changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`,   changeFrequency: 'yearly',  priority: 0.7 },
    ...projects.map(p => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.createdAt ? new Date(p.createdAt) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...team.map(m => ({
      url: `${SITE_URL}/team/${m.slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    })),
  ]
}
