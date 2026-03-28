import Link from 'next/link'

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
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">What we build</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">Projects</h1>
        <p className="text-zinc-400 text-lg mb-16 max-w-xl">We find broken systems and build better tools.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <Link key={p.slug} href={`/projects/${p.slug}`}
              className="group border border-zinc-800 rounded-2xl p-6 sm:p-8 hover:border-zinc-600 hover:bg-zinc-900/40 transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">{p.name}</h2>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5">→</span>
              </div>
              {p.tagline && <p className="text-zinc-400 text-sm mb-4">{p.tagline}</p>}
              {p.url && (
                <p className="text-xs text-zinc-600 font-mono">{p.url.replace('https://', '')}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
