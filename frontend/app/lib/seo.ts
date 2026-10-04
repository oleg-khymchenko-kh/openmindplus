export const SITE_URL = 'https://openmindplus.com'
export const SITE_NAME = 'OpenMind+'

/** Google cuts titles past ~60 chars, and the brand suffix counts. */
const TITLE_BUDGET = 48

function cutAtWord(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return (space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,.;:—-]+$/, '')
}

/**
 * "Name — what it is", trimmed so the rendered title with " · OpenMind+"
 * still fits. Figures are deliberately kept out of titles: Google rewrites
 * titles carrying a number far more readily than titles without one.
 */
export function entityTitle(name: string, qualifier?: string | null): string {
  if (!qualifier) return name
  const budget = TITLE_BUDGET - name.length - 3
  if (budget < 12) return name

  // Take the first clause rather than letting the length cut land mid-phrase:
  // "Gyrocopters in London — sales, training" reads worse than "Gyrocopters
  // in London".
  const clause = qualifier.replace(/\s+/g, ' ').trim().split(/\s+—\s+|\.\s+|,\s+/)[0]
  const trimmed = clause.replace(/[\s,.;:—-]+$/, '')

  // A fragment is worse than no qualifier: "Warranty++ — Your free extra
  // warranty has a" reads as a bug. If the clause does not fit whole, the
  // name stands alone.
  if (trimmed.length > budget) return name
  return `${name} — ${trimmed}`
}

/** Trim a description down to what a search result can show in full. */
export function clamp(text: string | null | undefined, max = 155): string | undefined {
  if (!text) return undefined
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return cutAtWord(clean, max - 1) + '…'
}

export function absolute(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith('http') ? path : `${SITE_URL}${path}`
}

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Engineering and product studio building AI-powered tools — from parking-fine appeals to EV charging networks.',
  }
}

interface PersonInput {
  slug: string
  name: string
  role: string
  photoUrl?: string | null
  linkedinUrl?: string | null
  instagramUrl?: string | null
  xUrl?: string | null
  telegramUrl?: string | null
}

/**
 * The @id is shared with argoaero.co.uk, whose articles these people author.
 * Matching ids is what lets a model treat both mentions as one person — do not
 * change the shape without telling the argoaero side.
 */
export function personSchema(m: PersonInput) {
  const sameAs = [m.linkedinUrl, m.instagramUrl, m.xUrl, m.telegramUrl].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/team/${m.slug}#person`,
    url: `${SITE_URL}/team/${m.slug}`,
    name: m.name,
    jobTitle: m.role,
    ...(m.photoUrl ? { image: absolute(m.photoUrl) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { '@id': ORGANIZATION_ID },
  }
}
