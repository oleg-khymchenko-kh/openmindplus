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
    <main className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact</h1>
        <p className="text-gray-500 mb-10">
          Have a question or want to work with us? Drop us a message or reach out to the team on social media.
        </p>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-green-700">
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
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Your message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            {status === 'error' && (
              <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 mt-8 text-center">
          Or email us directly: <a href="mailto:hello@openmindplus.com" className="text-blue-500 hover:underline">hello@openmindplus.com</a>
        </p>
      </div>
    </main>
  )
}
