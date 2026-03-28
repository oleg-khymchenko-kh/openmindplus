import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenMindPlus",
  description: "We find broken systems and build smarter tools to fix them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
          <nav className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-zinc-100 tracking-tight">
              Open<span className="text-zinc-400">Mind</span>Plus
            </Link>
            <div className="flex items-center gap-6 text-sm text-zinc-400">
              <Link href="/team" className="hover:text-zinc-100 transition-colors">Team</Link>
              <Link href="/projects" className="hover:text-zinc-100 transition-colors">Projects</Link>
              <Link href="/contact" className="hover:text-zinc-100 transition-colors">Contact</Link>
            </div>
          </nav>
        </header>

        <div className="flex-1 pt-14">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-zinc-800/60 py-8 px-5 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} OpenMindPlus · Built with ❤️ by our team
        </footer>

      </body>
    </html>
  );
}
