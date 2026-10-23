import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = {
  title: 'About SoloStack | Tools and setups for one-person businesses',
  description:
    'SoloStack is a guide for solo creators and one-person businesses: honest write-ups of the tools, hardware and workflows that help one person do the work of a small team.',
  openGraph: {
    title: 'About SoloStack',
    description: 'Honest guides to the tools, hardware and workflows that help one person run a business.',
    type: 'website',
    url: 'https://solostack.au/about',
  },
  alternates: { canonical: 'https://solostack.au/about' },
}

const img = (name: string) => `/api/media/file/${name}.webp`

const PRINCIPLES = [
  { n: '01', title: 'Plain answers first', text: 'Every guide opens with the answer. The detail follows for those who want it.' },
  { n: '02', title: 'Honest about limits', text: 'We say who a product is not for, and where it falls short. A recommendation with no downsides is an advert.' },
  { n: '03', title: 'Sources, not hype', text: 'We build on what makers publish and other credible sources. Prices change, so we point you to the maker for the final word.' },
] as const

const TOPICS = [
  { title: 'Creator Media Lab', text: 'Podcasts, video and audio.', href: '/posts?category=creator-media-lab', image: 'solo-podcast-recording-workflow' },
  { title: 'Solopreneur Operations', text: 'Clients, money and a desk that works.', href: '/posts?category=solopreneur-operations', image: 'ergonomic-minimalist-remote-workstation-setup' },
  { title: 'Websites & Hosting', text: 'Domains, hosts and site basics.', href: '/posts?category=websites-hosting', image: 'website-builder-vs-wordpress' },
  { title: 'Marketing & Growth', text: 'Email, search and social.', href: '/posts?category=marketing-growth', image: 'newsletter-business-stack' },
  { title: 'AI & Automation', text: 'Workflows that run without you.', href: '/posts?category=ai-automation', image: 'building-50k-solo-operations-engine' },
  { title: 'Stacks', text: 'Whole setups, tool by tool.', href: '/stacks', image: 'course-creator-stack' },
] as const

export default function AboutPage() {
  return (
    <div className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[1366px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">About SoloStack</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Tools and setups for people who work on their own.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              One person can run a real business. The right few tools make it easier, and the wrong many make it harder. SoloStack helps you tell the
              difference.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Read the guides <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/stacks" className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Browse stacks
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <img
              src={img('ergonomic-minimalist-remote-workstation-setup')}
              alt="A tidy standing desk with a monitor, desk lamp and ergonomic chair against a warm wall"
              width={1024}
              height={576}
              loading="eager"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="border-y border-border bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="mx-auto grid w-full max-w-[1366px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="order-2 overflow-hidden rounded-3xl border border-border lg:order-1">
            <img
              src={img('solo-podcaster-stack')}
              alt="A dynamic microphone on a boom arm beside black over-ear headphones"
              width={1024}
              height={576}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">What we do</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">We read the small print so you can get on with the work.</h2>
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              <p>
                Most software and gear is built for large teams. If you work alone, you need things that are quick to set up, fairly priced and
                dependable when nobody else is there to fix them.
              </p>
              <p>
                So we write about the tools, hardware and workflows that suit one person: how a podcast comes together, how to price your work, which
                kind of hosting you need, and how the pieces connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How we choose */}
      <section className="mx-auto w-full max-w-[1366px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">How we work</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Three habits we hold ourselves to.</h2>
        </div>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <li key={p.n} className="bg-white p-6 dark:bg-neutral-950 sm:p-8">
              <p className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{p.n}</p>
              <h3 className="mt-3 text-xl font-bold tracking-tight">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-neutral-600 dark:text-neutral-400">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What we cover */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1366px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">What we cover</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Six areas of a one-person business.</h2>
            </div>
            <Link href="/posts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              All guides <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <li key={t.title}>
                <Link href={t.href} className="group block overflow-hidden rounded-2xl border border-border transition-colors hover:border-neutral-400 dark:hover:border-neutral-600">
                  <div className="overflow-hidden">
                    <img
                      src={img(t.image)}
                      alt=""
                      width={1024}
                      height={576}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 p-5">
                    <div>
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{t.text}</p>
                    </div>
                    <ArrowRight className="size-5 flex-none text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-600" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we are paid + who is behind it */}
      <section className="border-t border-border bg-neutral-50/70 dark:bg-neutral-900/40">
        <div className="mx-auto grid w-full max-w-[1366px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">How we are paid</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Reader-supported, and upfront about it.</h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Some links on SoloStack are affiliate links. If you buy through one, the merchant may pay us a commission. You pay the same price, and the
              commission does not buy a recommendation.
            </p>
            <Link href="/affiliate-disclosure" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              Read the full disclosure <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Who is behind it</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">An Australian business in Perth.</h2>
            <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              SoloStack is run by {BUSINESS.operator} (ABN {BUSINESS.abn}), based in West Perth, Western Australia. Found a mistake, or have a tool we
              should look at? We read every email.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Get in touch <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
