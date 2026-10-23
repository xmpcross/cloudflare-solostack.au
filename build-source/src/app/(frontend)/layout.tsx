import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import Script from 'next/script'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { SiteBreadcrumbs } from '@/components/SiteBreadcrumbs'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// Be Vietnam Pro for headings and body text, Geist Mono for numbers and labels (owner, 23 Oct 2026). The font files are
// kept in src/fonts so the build needs no network; next/font serves them from this site.
const beVietnamPro = localFont({
  src: [
    { path: '../../fonts/be-vietnam-pro/BeVietnamPro-400-latin.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/be-vietnam-pro/BeVietnamPro-500-latin.woff2', weight: '500', style: 'normal' },
    { path: '../../fonts/be-vietnam-pro/BeVietnamPro-600-latin.woff2', weight: '600', style: 'normal' },
    { path: '../../fonts/be-vietnam-pro/BeVietnamPro-700-latin.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
})

// Inter (variable, so every weight from one file) for h1, h2 and h3 only. The Latin set covers English text.
const inter = localFont({
  src: [{ path: '../../fonts/inter/Inter-Variable-latin.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html
      className={cn(beVietnamPro.variable, inter.variable, GeistSans.variable, GeistMono.variable)}
      data-theme="light"
      lang="en-AU"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/apple-touch-icon.png" rel="apple-touch-icon" />
        <meta name="mitgo-verification" content="28d34b81-9840-44ac-adb1-9ae7ef0ae384" />
        <meta name="impact-site-verification" content="fd59399a-96f0-482a-8eb3-e33a18a33668" />
      </head>
      <body>
        <Providers>
          {/* Static export: no Payload admin bar (there is no /api on Cloudflare Pages). */}
          <Header />
          <SiteBreadcrumbs />
          {children}
          <Footer />
        </Providers>
        <Script
          src="https://convertlink.com/script/ce8f3235-a4ab-4b5b-bde4-b86890fd281b/bundle.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@solostack',
  },
}
