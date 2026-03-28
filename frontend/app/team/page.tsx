import Link from 'next/link'

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
  } catch {
    return []
  }
}

export default async function TeamPage() {
  const team = await getTeam()
  const engineering = team.filter(m => m.department === 'engineering')
  const content = team.filter(m => m.department === 'content')

  return (
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Team</h1>
        <p className="text-lg text-gray-500 mb-16">
          12 minds. Engineers, researchers, writers — building tools for a better world.
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
      <h2 className="text-xl font-semibold text-gray-400 uppercase tracking-widest mb-8">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
        {members.map(m => (
          <Link key={m.slug} href={`/team/${m.slug}`} className="group text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 mx-auto mb-3 overflow-hidden">
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                  {m.name[0]}
                </div>
              )}
            </div>
            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{m.name}</p>
            <p className="text-sm text-gray-500">{m.role}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
