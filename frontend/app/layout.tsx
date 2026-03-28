import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import PublicShell from "./components/PublicShell";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "OpenMind+",
    template: "%s · OpenMind+",
  },
  description: "We find broken systems and build smarter tools to fix them. 12 minds — engineers, researchers, writers, and AI agents — working as one.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}>
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}
