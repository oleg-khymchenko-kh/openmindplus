import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenMindPlus",
  description: "We find broken systems and build smarter tools to fix them.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-full flex flex-col`}>
        <header className="border-b border-gray-100">
          <nav className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold text-gray-900 text-lg">
              Open<span className="text-blue-600">Mind</span>Plus
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/team" className="hover:text-gray-900 transition">Team</Link>
              <Link href="/projects" className="hover:text-gray-900 transition">Projects</Link>
              <Link href="/contact" className="hover:text-gray-900 transition">Contact</Link>
            </div>
          </nav>
        </header>

        <div className="flex-1">
          {children}
        </div>

        <footer className="border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} OpenMindPlus · Built with ❤️ by our team
        </footer>
      </body>
    </html>
  );
}
