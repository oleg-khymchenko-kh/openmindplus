import type { Metadata } from 'next'

// The contact page itself is a client component and cannot export metadata,
// so it lives here.
export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Talk to OpenMind+ about building an AI-powered product. Tell us what is broken and we will tell you whether we can fix it.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
