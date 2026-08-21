import Link from 'next/link'

interface Project {
  slug: string
  name: string
  tagline: string | null
  description: string | null
  url: string | null
  logoUrl: string | null
  createdAt: string
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

export default async function Home() {
  const projects = await getProjects()
  // The newest project takes the featured slot, so it never goes stale again.
  const latest = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]

  return (
    <main className="bg-zinc-950 text-zinc-100">

      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-5 py-24">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 border border-zinc-700 rounded-full px-4 py-1.5 mb-8 tracking-widest uppercase">
          AI · Engineering · Product
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
          Open<span className="text-zinc-400">Mind</span><span className="text-white">+</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed">
          We find broken systems and build smarter tools to fix them.
          12 minds — engineers, researchers, writers, and AI agents — working across borders as one team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
          <Link href="/projects"
            className="bg-zinc-100 text-zinc-900 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white transition-colors text-center">
            Our Projects
          </Link>
          <Link href="/team"
            className="border border-zinc-700 text-zinc-300 px-6 py-3 rounded-lg font-semibold text-sm hover:border-zinc-500 hover:text-zinc-100 transition-colors text-center">
            Meet the Team
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/60" />

      {/* Featured project */}
      {latest && (
        <>
          <section className="py-24 px-5">
            <div className="max-w-5xl mx-auto">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8">Latest Project</p>
              <Link href={`/projects/${latest.slug}`}
                className="group block border border-zinc-800 rounded-2xl p-8 sm:p-10 hover:border-zinc-600 transition-colors bg-zinc-900/40">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    {latest.logoUrl && (
                      <span className="shrink-0 inline-flex items-center justify-center w-20 h-12 rounded-lg bg-zinc-100 p-2">
                        <img src={latest.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                      </span>
                    )}
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">{latest.name}</h2>
                      {latest.tagline && <p className="text-zinc-400 font-medium">{latest.tagline}</p>}
                    </div>
                  </div>
                  {latest.url && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 group-hover:border-zinc-500 group-hover:text-zinc-200 transition-colors whitespace-nowrap self-start">
                      {latest.url.replace('https://', '')} ↗
                    </span>
                  )}
                </div>
                {latest.description && (
                  <p className="text-zinc-400 leading-relaxed max-w-2xl">{latest.description}</p>
                )}
              </Link>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-zinc-800/60" />
        </>
      )}

      {/* Stats row */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
          {[
            { value: '12+', label: 'Team members' },
            { value: String(projects.length || 3), label: projects.length === 1 ? 'Live project' : 'Live projects' },
            { value: '🌍',  label: 'Global reach' },
            { value: 'AI',  label: 'Powered' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-1">{s.value}</p>
              <p className="text-sm text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/60" />

      {/* CTA */}
      <section className="py-24 px-5 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Believe in what we're building?</h2>
          <p className="text-zinc-300 text-lg mb-8">We'd love to hear from you.</p>
          <Link href="/contact"
            className="inline-block bg-zinc-100 text-zinc-900 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>

    </main>
  )
}
