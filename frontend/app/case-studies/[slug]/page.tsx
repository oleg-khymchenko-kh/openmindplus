import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '../../components/JsonLd'
import { Block, findStudy, publishedStudies } from '../../lib/case-studies'
import { ORGANIZATION_ID, SITE_URL, clamp } from '../../lib/seo'

export function generateStaticParams() {
  return publishedStudies().map(s => ({ slug: s.slug }))
}

// Drafts are not prerendered and must not resolve on demand either.
export const dynamicParams = false

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const study = findStudy(slug)
  if (!study?.published) return {}
  const canonical = `/case-studies/${slug}`
  const description = clamp(`${study.lede} ${study.summary.outcome}`)
  // Absolute: the layout's " · OpenMind+" suffix would push these past 60
  // characters, and Google shows the site name on its own line anyway.
  const title = study.seoTitle ?? study.title
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { type: 'article', url: canonical, title, description },
  }
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        typeof b === 'string'
          ? <p key={i}>{b}</p>
          : (
            <ul key={i} className="list-disc pl-5 space-y-2 marker:text-zinc-600">
              {b.list.map((li, j) => <li key={j}>{li}</li>)}
            </ul>
          ),
      )}
    </>
  )
}

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const study = findStudy(slug)
  if (!study?.published) notFound()

  const others = publishedStudies().filter(s => s.slug !== slug).slice(0, 2)
  const url = `${SITE_URL}/case-studies/${slug}`

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: study.title,
        description: study.lede,
        url,
        dateModified: study.checked,
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        about: study.client,
      }} />

      <article className="max-w-5xl mx-auto">
        <nav className="text-sm text-zinc-500 mb-10">
          <Link href="/case-studies" className="hover:text-zinc-300 transition-colors">Case studies</Link>
          <span className="mx-2 text-zinc-700">/</span>
          <span className="text-zinc-400">{study.client}</span>
        </nav>

        {/* Headline block */}
        <header className="max-w-3xl mb-12">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">
            <span>{study.industry}</span>
            <span className="text-zinc-700">·</span>
            <span>{study.location}</span>
            {study.status === 'in-progress' && (
              <span className="ml-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-amber-300 tracking-wider">
                In progress
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight leading-[1.1] mb-6 text-balance">
            {study.title}
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">{study.lede}</p>
        </header>

        {/* Twenty-second summary */}
        <section className="grid sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-800 mb-12">
          {([
            ['The challenge', study.summary.challenge],
            ['What we built', study.summary.solution],
            ['The outcome', study.summary.outcome],
          ] as const).map(([label, text]) => (
            <div key={label} className="bg-zinc-900/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">{label}</p>
              <p className="text-zinc-200 leading-relaxed">{text}</p>
            </div>
          ))}
        </section>

        {/* Figures, each with its source */}
        {study.stats && study.stats.length > 0 && (
          <section className="mb-16">
            <div className={`grid gap-4 ${study.stats.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              {study.stats.map(s => (
                <div key={s.label} className="rounded-2xl border border-zinc-800 p-6">
                  <p className="text-4xl font-bold text-white tracking-tight tabular-nums mb-2">{s.value}</p>
                  <p className="text-zinc-400 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-1 text-xs text-zinc-600">
              {study.stats.map(s => <li key={s.label}>{s.value}: {s.source}</li>)}
            </ul>
          </section>
        )}

        <div className="grid lg:grid-cols-[1fr_17rem] gap-12 lg:gap-16">
          {/* The story, in plain words */}
          <div className="min-w-0">
            {study.story.map(section => (
              <section key={section.heading} className="mb-12">
                <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mb-5 text-balance">{section.heading}</h2>
                <div className="space-y-4 text-zinc-300 text-[1.0625rem] leading-relaxed max-w-[65ch]">
                  <Blocks blocks={section.body} />
                </div>
              </section>
            ))}

            {/* For the engineer evaluating us */}
            <section className="mb-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-5">For specialists</h2>
              <div className="space-y-3 text-zinc-300 leading-relaxed max-w-[65ch]">
                <Blocks blocks={study.technical.notes} />
              </div>
            </section>

            <p className="text-sm text-zinc-600">
              Facts checked against the code and the team on {dateFmt.format(new Date(study.checked))}.
            </p>
          </div>

          {/* Facts at a glance */}
          <aside className="lg:sticky lg:top-24 self-start">
            <dl className="space-y-6 text-sm">
              {([
                ['Client', study.client],
                ['Industry', study.industry],
                ['Location', study.location],
                ['Period', study.period],
              ] as const).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-1">{k}</dt>
                  <dd className="text-zinc-300">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">Stack</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {study.technical.stack.map(t => (
                    <span key={t} className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400 font-mono">
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
              {(study.projectSlug || study.url) && (
                <div className="flex flex-col gap-2 pt-2">
                  {study.projectSlug && (
                    <Link href={`/projects/${study.projectSlug}`} className="text-zinc-400 hover:text-white transition-colors">
                      About the project →
                    </Link>
                  )}
                  {study.url && (
                    <a href={study.url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
                      {study.url.replace(/^https?:\/\//, '')} ↗
                    </a>
                  )}
                </div>
              )}
            </dl>
          </aside>
        </div>

        {/* Next step */}
        <section className="mt-20 rounded-2xl border border-zinc-800 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-balance">Got a system that holds your business back?</h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">Tell us what is broken. We will tell you plainly whether we can fix it.</p>
          <Link href="/contact" className="inline-block bg-zinc-100 text-zinc-900 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white transition-colors">
            Get in touch
          </Link>
        </section>

        {others.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-6">More case studies</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {others.map(o => (
                <Link key={o.slug} href={`/case-studies/${o.slug}`}
                  className="group rounded-2xl border border-zinc-800 p-6 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">{o.client}</p>
                  <p className="text-lg font-semibold text-zinc-100 leading-snug group-hover:text-white">{o.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  )
}
