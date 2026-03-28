'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return <>{children}</>

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <nav className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-zinc-100 tracking-tight">
            Open<span className="text-zinc-400">Mind</span><span className="text-white">+</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-300">
            <Link href="/team" className="hover:text-white transition-colors">Team</Link>
            <Link href="/projects" className="hover:text-white transition-colors">Projects</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </nav>
      </header>

      <div className="flex-1 pt-14">
        {children}
      </div>

      <footer className="border-t border-zinc-700 py-8 px-5 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} OpenMind+ · Built with ❤️ by our team
      </footer>
    </>
  )
}
