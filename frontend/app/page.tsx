import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Open<span className="text-blue-600">Mind</span>Plus
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          We find broken systems and build smarter tools to fix them.
          12 minds — engineers, researchers, writers, and AI agents — working as one team.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/projects"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Our Projects
          </Link>
          <Link
            href="/team"
            className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-400 transition"
          >
            Meet the Team
          </Link>
        </div>
      </section>

      {/* Featured project */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-4">Latest Project</p>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-md transition">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">GetOSH</h2>
            <p className="text-gray-500 mb-4">Fight your parking fine. In minutes.</p>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-2xl">
              AI-powered platform that helps UK drivers understand, challenge, and manage parking fines.
              Send a photo of your ticket via WhatsApp or Telegram — get a professional appeal letter in seconds.
            </p>
            <a
              href="https://getosh.today"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-semibold hover:underline"
            >
              Visit getosh.today →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Believe in what we're building?</h2>
        <p className="text-gray-500 mb-8">We'd love to hear from you.</p>
        <Link
          href="/contact"
          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
        >
          Get in Touch
        </Link>
      </section>
    </main>
  )
}
