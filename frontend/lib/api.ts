const API = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchTeam() {
  const res = await fetch(`${API}/api/team`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch team')
  return res.json()
}

export async function fetchTeamMember(slug: string) {
  const res = await fetch(`${API}/api/team/${slug}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

export async function fetchProjects() {
  const res = await fetch(`${API}/api/projects`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

export async function fetchProject(slug: string) {
  const res = await fetch(`${API}/api/projects/${slug}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}
