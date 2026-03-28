import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getMember(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/team/${slug}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/team`)
    if (!res.ok) return []
    const team = await res.json()
    return team.map((m: { slug: string }) => ({ slug: m.slug }))
  } catch {
    return []
  }
}

export default async function TeamMemberPage({ params }: { params: { slug: string } }) {
  const member = await getMember(params.slug)
  if (!member) notFound()

  const socials = [
    { label: 'LinkedIn', url: member.linkedinUrl, icon: '🔗' },
    { label: 'Instagram', url: member.instagramUrl, icon: '📸' },
    { label: 'X', url: member.xUrl, icon: '𝕏' },
    { label: 'Telegram', url: member.telegramUrl, icon: '✈️' },
  ].filter(s => s.url)

  return (
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/team" className="text-blue-600 hover:underline text-sm mb-8 inline-block">
          ← Back to Team
        </Link>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                {member.name[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{member.name}</h1>
            <p className="text-gray-500 mt-1">{member.role}</p>
          </div>
        </div>

        {member.bio && (
          <p className="text-gray-600 leading-relaxed mb-8">{member.bio}</p>
        )}

        {socials.length > 0 && (
          <div className="flex gap-4 mb-12">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        )}

        {member.projects?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Projects</h2>
            <div className="space-y-3">
              {member.projects.map((p: { project: { slug: string; name: string; tagline: string; url: string } }) => (
                <Link
                  key={p.project.slug}
                  href={`/projects/${p.project.slug}`}
                  className="block border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <p className="font-semibold text-gray-900">{p.project.name}</p>
                  {p.project.tagline && <p className="text-sm text-gray-500 mt-1">{p.project.tagline}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
