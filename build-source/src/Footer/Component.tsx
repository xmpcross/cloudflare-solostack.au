import { getCachedGlobal } from '@/utilities/getGlobals'
import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Logo } from '@/components/Logo/Logo'

// Categories that have their own section instead of the filtered posts list.
const TOPIC_HREF_OVERRIDES: Record<string, string> = {
  stacks: '/stacks',
}

async function getTopics(): Promise<{ title: string; href: string }[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'categories',
      sort: 'createdAt',
      limit: 20,
      depth: 0,
      select: { title: true, slug: true },
    })
    return docs
      .filter((cat) => cat.title && cat.slug)
      .map((cat) => ({
        title: cat.title,
        href: TOPIC_HREF_OVERRIDES[cat.slug as string] || `/posts/category/${cat.slug}`,
      }))
  } catch (error) {
    console.warn('Footer categories fetch error:', error)
    return []
  }
}

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const topics = await getTopics()

  return (
    <footer className="mt-auto bg-slate-900 text-slate-100">
      {/* 4-Column Main Footer Area */}
      <div className="container py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-8 justify-between">
          {/* Column 1: 55% Width */}
          <div className="w-full lg:w-[55%] lg:pr-10">
            <Link className="inline-flex items-center mb-4 group" href="/">
              <Logo mode="dark" />
            </Link>
            <p className="mb-5 max-w-xl text-[0.9375rem] leading-relaxed text-slate-300">
              SoloStack curates production-tested software, ergonomic hardware workstations, and automated zero-headcount blueprints for solopreneurs, indie hackers, and creators scaling 1-person businesses.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span>Operated by FXN Holdings</span>
              <span>&bull;</span>
              <span>ABN 53 274 423 748</span>
              <span>&bull;</span>
              <span>West Perth, WA, Australia</span>
            </div>
          </div>

          {/* Column 2: 15% Width - About & Resources */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">
              About &amp; Resources
            </h2>
            <ul className="space-y-0.5 text-[0.9375rem] text-slate-100">
              <li>
                <Link href="/about" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/tools" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Software Directory
                </Link>
              </li>
              <li>
                <Link href="/best-gear" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Best Gear for Creators
                </Link>
              </li>
              <li>
                <Link href="/contact" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: 15% Width - Topics */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">
              Topics
            </h2>
            <ul className="space-y-0.5 text-[0.9375rem] text-slate-100">
              {topics.map((topic) => (
                <li key={topic.href}>
                  <Link href={topic.href} className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                    {topic.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: 15% Width - Useful Links */}
          <div className="w-full sm:w-1/3 lg:w-[15%]">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">
              Useful Links
            </h2>
            <ul className="space-y-0.5 text-[0.9375rem] text-slate-100">
              <li>
                <Link href="/affiliate-disclosure" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="inline-block py-1.5 transition-colors hover:text-emerald-400 hover:underline hover:underline-offset-4">
                  Editorial Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sub-Footer Legal & Compliance Bar */}
      <div className="border-t border-white/15">
        <div className="container py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-col gap-1">
            <p>
              &copy; {new Date().getFullYear()} SoloStack. This website is operated by FXN Holdings (ABN: 53 274 423 748). solostack.au is a subsidiary business under FXN Holdings.
            </p>
            <p className="text-slate-300">
              Mailing Address: PO Box 500, WEST PERTH, WA 6872, Australia &bull; Contact: <a href="mailto:contact@solostack.au" className="underline underline-offset-4 hover:text-white">contact@solostack.au</a>
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <ThemeSelector />
            <p className="max-w-md text-slate-300 md:text-right">
              SoloStack is reader-supported. We independently research and evaluate tools and gear. We may earn an affiliate commission on qualifying purchases at no extra cost to you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
