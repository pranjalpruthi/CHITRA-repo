// import Provider from '@/app/provider'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthWrapper from '@/components/wrapper/auth-wrapper'
import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'
import { RootProvider } from 'fumadocs-ui/provider';

export const metadata: Metadata = {
  metadataBase: new URL("https://starter.rasmic.xyz"),
  title: {
    default: 'CHITRA - Chromosome Interactive Tool for Rearrangement Analysis',
    template: `%s | CHITRA`
  },
  description: 'CHITRA (Chromosome Interactive Tool for Rearrangement Analysis) - A powerful tool for analyzing chromosome rearrangements and synteny visualization',
  openGraph: {
    description: 'CHITRA (CHromosome Interactive Tool for Rearrangement Analysis) - A powerful tool for analyzing chromosome rearrangements and synteny visualization',
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
    url: 'https://starter.rasmic.xyz/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHITRA - CHromosome Interactive Tool for Rearrangement Analysis',
    description: 'CHITRA (CHromosome Interactive Tool for Rearrangement Analysis) - A powerful tool for analyzing chromosome rearrangements and synteny visualization',
    siteId: "",
    creator: "@rasmic",
    creatorId: "",
    images: ['https://utfs.io/f/8a428f85-ae83-4ca7-9237-6f8b65411293-eun6ii.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthWrapper>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="preload"
            href="https://utfs.io/f/31dba2ff-6c3b-4927-99cd-b928eaa54d5f-5w20ij.png"
            as="image"
          />
          <link
            rel="preload"
            href="https://utfs.io/f/69a12ab1-4d57-4913-90f9-38c6aca6c373-1txg2.png"
            as="image"
          />
        </head>
        <body className={`${GeistSans.className} flex min-h-screen flex-col`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="chitra-theme"
            forcedTheme={undefined}
            themes={['light', 'dark', 'system']}
          >
            <RootProvider>
              {children}
              <Toaster />
            </RootProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </AuthWrapper>
  )
}