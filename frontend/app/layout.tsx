import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import PublicShell from "./components/PublicShell";
import JsonLd from "./components/JsonLd";
import { SITE_NAME, SITE_URL, organizationSchema } from "./lib/seo";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OpenMind+",
    template: "%s · OpenMind+",
  },
  description: "We find broken systems and build smarter tools to fix them. 12 minds — engineers, researchers, writers, and AI agents — working as one.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: SITE_URL,
  },
  twitter: { card: "summary" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}>
        <JsonLd data={organizationSchema()} />
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  )
}
