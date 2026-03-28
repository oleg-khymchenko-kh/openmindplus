import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Team' }

interface TeamMember {
  slug: string
  name: string
  role: string
  department: string
  photoUrl: string | null
}

async function getTeam(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/team`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function TeamPage() {
  const team = await getTeam()
  const engineering = team.filter(m => m.department === 'engineering')
  const content = team.filter(m => m.department === 'content')

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">The Team</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">12 minds. One vision.</h1>
        <p className="text-zinc-400 text-lg mb-16 max-w-xl">
          Engineers, researchers, writers — and AI agents — all working toward the same goal.
        </p>

        <Section title="AI & Engineering" members={engineering} />
        <Section title="Product & Content" members={content} />
      </div>
    </main>
  )
}

function Section({ title, members }: { title: string; members: TeamMember[] }) {
  return (
    <div className="mb-16">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {members.map(m => (
          <Link key={m.slug} href={`/team/${m.slug}`}
            className="group flex flex-col items-center text-center p-4 rounded-xl border border-transparent hover:border-zinc-700 hover:bg-zinc-900/50 transition-all">
            <div className="w-20 h-20 rounded-full bg-zinc-800 mb-4 overflow-hidden flex items-center justify-center">
              {m.photoUrl
                ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-zinc-500">{m.name[0]}</span>
              }
            </div>
            <p className="font-semibold text-zinc-100 text-sm group-hover:text-white transition-colors leading-tight mb-1">{m.name}</p>
            <p className="text-xs text-zinc-500 leading-tight">{m.role}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
