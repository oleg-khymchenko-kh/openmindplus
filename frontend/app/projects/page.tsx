import Link from 'next/link'

interface Project {
  slug: string
  name: string
  tagline: string | null
  url: string | null
  logoUrl: string | null
}

async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/projects`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Projects</h1>
        <p className="text-lg text-gray-500 mb-16">
          We find broken systems and build better tools.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map(p => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="border border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-md transition group"
            >
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition mb-2">
                {p.name}
              </h2>
              {p.tagline && <p className="text-gray-500">{p.tagline}</p>}
              {p.url && (
                <p className="text-sm text-blue-500 mt-4">{p.url.replace('https://', '')}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
