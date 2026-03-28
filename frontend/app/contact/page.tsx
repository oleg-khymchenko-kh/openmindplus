'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setName(''); setEmail(''); setMessage('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 py-20 px-5">
      <div className="max-w-lg mx-auto">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 mb-4 tracking-tight">Get in touch</h1>
        <p className="text-zinc-400 mb-12 text-base">
          Have a question or want to work with us? Drop us a message or find us on social media.
        </p>

        {status === 'success' ? (
          <div className="border border-zinc-700 bg-zinc-900/50 rounded-xl p-6 text-zinc-300 text-center">
            ✅ Message sent! We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            />
            <textarea
              placeholder="Your message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
            />
            {status === 'error' && (
              <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-zinc-100 text-zinc-900 rounded-xl py-3 text-sm font-semibold hover:bg-white disabled:opacity-50 transition-colors"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <p className="text-xs text-zinc-600 mt-8 text-center">
          Or email us: <a href="mailto:hello@openmindplus.com" className="text-zinc-500 hover:text-zinc-300 transition-colors">hello@openmindplus.com</a>
        </p>
      </div>
    </main>
  )
}
