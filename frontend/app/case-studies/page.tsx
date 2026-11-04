import type { Metadata } from 'next'
import Link from 'next/link'
import { publishedStudies } from '../lib/case-studies'

export const metadata: Metadata = {
  title: 'Case studies',
  description:
    'What we built, why, and what changed for the business — told in plain words, with the technical detail for engineers underneath.',
  alternates: { canonical: '/case-studies' },
}

export default function CaseStudiesPage() {
  const studies = publishedStudies()

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Case studies</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight text-balance">
          Problems we took on, and what changed
        </h1>
        <p className="text-zinc-300 text-xl mb-16 max-w-2xl leading-relaxed">
          Each one is written for the person who runs the business, with the engineering detail kept
          at the end for whoever has to check our work. Every figure names its source.
        </p>

        {studies.length === 0 ? (
          <p className="text-zinc-500">The first case studies are being written.</p>
        ) : (
          <div className="grid gap-4">
            {studies.map(s => {
              const lead = s.stats?.[0]
              return (
                <Link key={s.slug} href={`/case-studies/${s.slug}`}
                  className="group grid sm:grid-cols-[1fr_auto] gap-6 items-start rounded-2xl border border-zinc-800 p-6 sm:p-8 hover:border-zinc-600 hover:bg-zinc-900/50 transition-all">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">
                      <span>{s.client}</span>
                      <span className="text-zinc-700">·</span>
                      <span>{s.industry}</span>
                      {s.status === 'in-progress' && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-300">In progress</span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-100 group-hover:text-white tracking-tight mb-3 text-balance">{s.title}</h2>
                    <p className="text-zinc-400 leading-relaxed max-w-2xl">{s.lede}</p>
                  </div>
                  {lead && (
                    <div className="sm:text-right sm:min-w-[9rem]">
                      <p className="text-3xl font-bold text-white tabular-nums">{lead.value}</p>
                      <p className="text-sm text-zinc-500 leading-snug sm:max-w-[11rem] sm:ml-auto">{lead.label}</p>
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
