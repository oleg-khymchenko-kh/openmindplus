import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getMember(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/team/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/team`)
    if (!res.ok) return []
    const team = await res.json()
    return team.map((m: { slug: string }) => ({ slug: m.slug }))
  } catch { return [] }
}

export default async function TeamMemberPage({ params }: { params: { slug: string } }) {
  const member = await getMember(params.slug)
  if (!member) notFound()

  const socials = [
    { label: 'LinkedIn',  url: member.linkedinUrl,  icon: 'in' },
    { label: 'Instagram', url: member.instagramUrl, icon: '◉' },
    { label: 'X',         url: member.xUrl,         icon: '✕' },
    { label: 'Telegram',  url: member.telegramUrl,  icon: '✈' },
  ].filter(s => s.url)

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-2xl mx-auto">
        <Link href="/team" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-10 transition-colors">
          ← Back to Team
        </Link>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {member.photoUrl
              ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold text-zinc-500">{member.name[0]}</span>
            }
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">{member.name}</h1>
            <p className="text-zinc-500 mt-1 text-sm">{member.role}</p>
          </div>
        </div>

        {member.bio && (
          <p className="text-zinc-400 leading-relaxed mb-8 text-base">{member.bio}</p>
        )}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-12">
            {socials.map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                <span className="font-bold">{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        )}

        {member.projects?.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-5 border-b border-zinc-800 pb-4">Projects</h2>
            <div className="space-y-3">
              {member.projects.map((p: { project: { slug: string; name: string; tagline: string } }) => (
                <Link key={p.project.slug} href={`/projects/${p.project.slug}`}
                  className="flex items-center justify-between border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all group">
                  <div>
                    <p className="font-semibold text-zinc-100 text-sm group-hover:text-white transition-colors">{p.project.name}</p>
                    {p.project.tagline && <p className="text-xs text-zinc-500 mt-0.5">{p.project.tagline}</p>}
                  </div>
                  <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
