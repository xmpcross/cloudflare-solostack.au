import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import localFont from 'next/font/local'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { DeferredLinkScripts } from '@/components/DeferredLinkScripts'
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
        <meta name="mitgo-verification" content="700ed40a-83fa-4da1-b27a-ca857393c2c2" />
        <meta name="impact-site-verification" content="fd59399a-96f0-482a-8eb3-e33a18a33668" />
        {/* Google AdSense */}
        {/* Loaded after the window load event, once the browser is idle (or on first interaction), so error and navigation pages (404, /search) are skipped via their noindex robots meta. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('load',function(){
  if(document.querySelector('meta[name=robots][content*=noindex]'))return;
  var done=false;
  function go(){
    if(done)return;done=true;
    var s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2867376862905050';
    document.head.appendChild(s);
  }
  ['pointerdown','touchstart','keydown','scroll'].forEach(function(e){window.addEventListener(e,go,{once:true,passive:true});});
  if('requestIdleCallback' in window)requestIdleCallback(function(){setTimeout(go,2000);},{timeout:4000});else setTimeout(go,4000);
});`,
          }}
        />
        {/* Ahrefs Web Analytics */}
        <script src="https://analytics.ahrefs.com/analytics.js" data-key="dY+Ra6F+l5JxpNXmSWr75g" async />
      </head>
      <body>
        <Providers>
          {/* Static export: no Payload admin bar (there is no /api on Cloudflare Pages). */}
          <Header />
          <SiteBreadcrumbs />
          {children}
          <Footer />
        </Providers>
        <DeferredLinkScripts />
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
