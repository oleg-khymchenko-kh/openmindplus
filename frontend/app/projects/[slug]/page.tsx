import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getProject(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`)
    if (!res.ok) return []
    const projects = await res.json()
    return projects.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch { return [] }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-3xl mx-auto">
        <Link href="/projects" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-10 transition-colors">
          ← Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-3">{project.name}</h1>
            {project.tagline && (
              <p className="text-xl text-zinc-400">{project.tagline}</p>
            )}
          </div>
          {project.url && (
            <a href={project.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-lg px-4 py-2.5 hover:border-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap self-start">
              Visit site ↗
            </a>
          )}
        </div>

        {project.description && (
          <p className="text-zinc-400 leading-relaxed mb-16 text-base border-t border-zinc-800 pt-8">{project.description}</p>
        )}

        {project.members?.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {project.members.map((pm: { member: { slug: string; name: string; role: string; photoUrl: string | null } }) => (
                <Link key={pm.member.slug} href={`/team/${pm.member.slug}`}
                  className="group flex flex-col items-center text-center p-4 rounded-xl border border-transparent hover:border-zinc-700 hover:bg-zinc-900/50 transition-all">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 mb-3 overflow-hidden flex items-center justify-center">
                    {pm.member.photoUrl
                      ? <img src={pm.member.photoUrl} alt={pm.member.name} className="w-full h-full object-cover" />
                      : <span className="text-lg font-bold text-zinc-500">{pm.member.name[0]}</span>
                    }
                  </div>
                  <p className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors leading-tight mb-0.5">{pm.member.name}</p>
                  <p className="text-xs text-zinc-600 leading-tight">{pm.member.role}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
