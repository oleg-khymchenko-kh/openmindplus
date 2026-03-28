import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Projects' }

interface Project {
  slug: string
  name: string
  tagline: string | null
  url: string | null
}

async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">What we build</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Projects</h1>
        <p className="text-zinc-300 text-xl mb-16 max-w-xl">We find broken systems and build better tools.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link key={p.slug} href={`/projects/${p.slug}`}
              className="group border border-zinc-700 rounded-2xl p-6 sm:p-8 hover:border-zinc-500 hover:bg-zinc-900/60 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-2xl font-bold text-white transition-colors">{p.name}</h2>
                <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors mt-0.5 text-lg">→</span>
              </div>
              {p.tagline && <p className="text-zinc-300 text-base mb-4">{p.tagline}</p>}
              {p.url && (
                <p className="text-sm text-zinc-400 font-mono">{p.url.replace('https://', '')}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
