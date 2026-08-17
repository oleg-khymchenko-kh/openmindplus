import Link from 'next/link'

export default function Home() {
  return (
    <main className="bg-zinc-950 text-zinc-100">

      {/* Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-5 py-24">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 border border-zinc-700 rounded-full px-4 py-1.5 mb-8 tracking-widest uppercase">
          AI · Engineering · Product
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
          Open<span className="text-zinc-400">Mind</span><span className="text-white">+</span>
        </h1>
        <p className="text-lg sm:text-xl text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed">
          We find broken systems and build smarter tools to fix them.
          12 minds — engineers, researchers, writers, and AI agents — working across borders as one team.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto justify-center">
          <Link href="/projects"
            className="bg-zinc-100 text-zinc-900 px-6 py-3 rounded-lg font-semibold text-sm hover:bg-white transition-colors text-center">
            Our Projects
          </Link>
          <Link href="/team"
            className="border border-zinc-700 text-zinc-300 px-6 py-3 rounded-lg font-semibold text-sm hover:border-zinc-500 hover:text-zinc-100 transition-colors text-center">
            Meet the Team
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/60" />

      {/* Featured project */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8">Latest Project</p>
          <div className="group border border-zinc-800 rounded-2xl p-8 sm:p-10 hover:border-zinc-600 transition-colors bg-zinc-900/40">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">GetOSH</h2>
                <p className="text-zinc-400 font-medium">Fight your parking fine. In minutes.</p>
              </div>
              <a href="https://getosh.today" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-lg px-4 py-2 hover:border-zinc-500 hover:text-zinc-200 transition-colors whitespace-nowrap self-start">
                getosh.today ↗
              </a>
            </div>
            <p className="text-zinc-400 leading-relaxed max-w-2xl">
              AI-powered platform that helps UK drivers understand, challenge, and manage parking fines.
              Send a photo of your ticket via WhatsApp or Telegram — get a professional appeal letter in seconds.
              No forms, no accounts, no legal jargon.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/60" />

      {/* Stats row */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
          {[
            { value: '12+', label: 'Team members' },
            { value: '3',   label: 'Live projects' },
            { value: '🌍',  label: 'Global reach' },
            { value: 'AI',  label: 'Powered' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-1">{s.value}</p>
              <p className="text-sm text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-800/60" />

      {/* CTA */}
      <section className="py-24 px-5 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Believe in what we're building?</h2>
          <p className="text-zinc-300 text-lg mb-8">We'd love to hear from you.</p>
          <Link href="/contact"
            className="inline-block bg-zinc-100 text-zinc-900 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white transition-colors">
            Get in Touch
          </Link>
        </div>
      </section>

    </main>
  )
}
