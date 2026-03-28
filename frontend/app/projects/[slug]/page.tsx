import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getProject(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects/${slug}`, {
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`)
    if (!res.ok) return []
    const projects = await res.json()
    return projects.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/projects" className="text-blue-600 hover:underline text-sm mb-8 inline-block">
          ← Back to Projects
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">{project.name}</h1>
        {project.tagline && (
          <p className="text-xl text-gray-500 mb-6">{project.tagline}</p>
        )}
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8 text-blue-600 hover:underline"
          >
            🌐 {project.url}
          </a>
        )}
        {project.description && (
          <p className="text-gray-600 leading-relaxed mb-12">{project.description}</p>
        )}

        {project.members?.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Team</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {project.members.map((pm: { member: { slug: string; name: string; role: string; photoUrl: string | null } }) => (
                <Link
                  key={pm.member.slug}
                  href={`/team/${pm.member.slug}`}
                  className="text-center group"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2 overflow-hidden">
                    {pm.member.photoUrl ? (
                      <img src={pm.member.photoUrl} alt={pm.member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">
                        {pm.member.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {pm.member.name}
                  </p>
                  <p className="text-xs text-gray-400">{pm.member.role}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
