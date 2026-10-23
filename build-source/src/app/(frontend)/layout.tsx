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

// Manrope for headings and Mulish for body text, the pair used by blush.xocoweb.workers.dev (owner, 23 Oct 2026). Both are
// variable fonts under the SIL Open Font License; the Latin subsets are kept in src/fonts so the build needs no network.
const mulish = localFont({
  src: [
    { path: '../../fonts/mulish/Mulish-Variable-latin.woff2', weight: '200 1000', style: 'normal' },
    { path: '../../fonts/mulish/Mulish-Variable-italic-latin.woff2', weight: '200 1000', style: 'italic' },
  ],
  variable: '--font-mulish',
  display: 'swap',
})

const manrope = localFont({
  src: [{ path: '../../fonts/manrope/Manrope-Variable-latin.woff2', weight: '200 800', style: 'normal' }],
  variable: '--font-manrope',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html
      className={cn(mulish.variable, manrope.variable, GeistSans.variable, GeistMono.variable)}
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
