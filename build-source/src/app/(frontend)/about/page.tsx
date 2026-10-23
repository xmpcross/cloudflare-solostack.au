import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { ExplainerGrid, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
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
  { title: 'Plain answers first', body: 'Every guide opens with the answer. The detail follows for those who want it.' },
  {
    title: 'Honest about limits',
    body: 'We say who a product is not for, and where it falls short. A recommendation with no downsides is an advert.',
  },
  {
    title: 'Sources, not hype',
    body: 'We build on what makers publish and other credible sources. Prices change, so we point you to the maker for the final word.',
  },
]

const TOPICS = [
  { title: 'Creator Media Lab', text: 'Podcasts, video and audio.', slug: 'creator-media-lab', href: '/posts/category/creator-media-lab', image: 'solo-podcast-recording-workflow' },
  { title: 'Solopreneur Operations', text: 'Clients, money and a desk that works.', slug: 'solopreneur-operations', href: '/posts/category/solopreneur-operations', image: 'ergonomic-minimalist-remote-workstation-setup' },
  { title: 'Websites & Hosting', text: 'Domains, hosts and site basics.', slug: 'websites-hosting', href: '/posts/category/websites-hosting', image: 'website-builder-vs-wordpress' },
  { title: 'Marketing & Growth', text: 'Email, search and social.', slug: 'marketing-growth', href: '/posts/category/marketing-growth', image: 'newsletter-business-stack' },
  { title: 'AI & Automation', text: 'Workflows that run without you.', slug: 'ai-automation', href: '/posts/category/ai-automation', image: 'building-50k-solo-operations-engine' },
  { title: 'Stacks', text: 'Whole setups, tool by tool.', slug: 'stacks', href: '/stacks', image: 'course-creator-stack' },
] as const

export default async function AboutPage() {
  const counts: Record<string, number> = {}
  let guides = 0
  let gear = 0
  let tools = 0
  let retailers = 0

  try {
    const payload = await getPayload({ config: configPromise })
    const published = { _status: { equals: 'published' } }
    const [all, g, t, ...perTopic] = await Promise.all([
      payload.count({ collection: 'posts', overrideAccess: true, where: published }),
      payload.count({
        collection: 'products' as any,
        overrideAccess: true,
        where: { and: [{ productType: { equals: 'hardware' } }, { status: { equals: 'approved' } }] },
      }),
      payload.count({ collection: 'tools', overrideAccess: true }),
      ...TOPICS.map((tp) =>
        payload.count({
          collection: 'posts',
          overrideAccess: true,
          where: { and: [published, { 'categories.slug': { equals: tp.slug } }] },
        }),
      ),
    ])
    guides = all.totalDocs
    gear = g.totalDocs
    tools = t.totalDocs
    TOPICS.forEach((tp, i) => (counts[tp.slug] = perTopic[i].totalDocs))

    const offers = await payload.find({
      collection: 'products' as any,
      limit: 200,
      depth: 0,
      overrideAccess: true,
      select: { offers: true } as any,
    })
    retailers = new Set(
      (offers.docs as any[]).flatMap((p) => (p.offers ?? []).map((o: any) => o?.merchant)).filter(Boolean),
    ).size
  } catch (error) {
    console.warn('Database connection error in /about:', error)
  }

  const facts = [
    ...(guides ? [{ label: 'Guides', value: String(guides) }] : []),
    ...(gear ? [{ label: 'Gear picks', value: String(gear) }] : []),
    ...(tools ? [{ label: 'Software tools', value: String(tools) }] : []),
  ]

  return (
    <div className="road">
      <RoadHero
        title="Tools and setups for people who work on their own."
        intro="One person can run a real business. The right few tools make it easier, and the wrong many make it harder. SoloStack helps you tell the difference."
        facts={facts}
        aside={
          <div className="panel overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
              <Image
                src={img('ergonomic-minimalist-remote-workstation-setup')}
                alt="A tidy standing desk with a monitor, desk lamp and ergonomic chair against a warm wall"
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-wrap gap-3 px-2 pb-2 pt-4 sm:px-3">
              <Link
                href="/posts"
                className="sign-type group inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-5 py-3 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110"
              >
                Read the guides
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/stacks"
                className="sign-type inline-flex items-center rounded-xl border-2 border-[color:var(--road-green)] px-5 py-3 text-sm font-bold hover:bg-[color:var(--road-green)]/10"
              >
                Browse stacks
              </Link>
            </div>
          </div>
        }
      />

      {/* WHAT WE DO: picture and words side by side */}
      <section className="py-16 sm:py-24">
        <div className={`${WRAP} grid items-center gap-10 lg:grid-cols-12 lg:gap-16`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[color:var(--road-rule)] lg:col-span-6">
            <Image
              src={img('solo-podcaster-stack')}
              alt="A dynamic microphone on a boom arm beside black over-ear headphones"
              fill
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="lg:col-span-6">
            <h2 className="sign-type text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              We read the small print so you can get on with the work.
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-[color:var(--road-muted)]">
              <p>
                Most software and gear is built for large teams. If you work alone, you need things that are quick to
                set up, fairly priced and dependable when nobody else is there to fix them.
              </p>
              <p>
                So we write about the tools, hardware and workflows that suit one person: how a podcast comes together,
                how to price your work, which kind of hosting you need, and how the pieces connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-[color:var(--road-rule)] bg-[color:var(--sign-white)]">
        <ExplainerGrid heading="Three habits we hold ourselves to." points={PRINCIPLES} />
      </div>

      {/* WHAT WE COVER: six areas, each with its photo and real guide count */}
      <section className="py-16 sm:py-24">
        <div className={WRAP}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[color:var(--road-green)] pb-6">
            <h2 className="sign-type text-3xl font-bold tracking-tight sm:text-4xl">Six areas of a one-person business</h2>
            <Link href="/posts" className="sign-type text-sm font-bold underline underline-offset-4">
              All guides
            </Link>
          </div>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <li key={t.title}>
                <Link href={t.href} className="group block">
                  <span className="relative block aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                    <Image
                      src={img(t.image)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      unoptimized
                    />
                  </span>
                  <span className="mt-4 flex items-start justify-between gap-4">
                    <span>
                      <span className="sign-type block text-xl font-bold group-hover:underline">{t.title}</span>
                      <span className="mt-1 block text-[color:var(--road-muted)]">{t.text}</span>
                    </span>
                    {counts[t.slug] ? (
                      <span className="num sign-type grid size-10 shrink-0 place-items-center rounded-full bg-[color:var(--road-green)] text-base font-bold text-[color:var(--sign-white)]">
                        {counts[t.slug]}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PAID + BEHIND IT */}
      <section className="border-t border-[color:var(--road-rule)] bg-[color:var(--road-tint)] py-16 sm:py-24">
        <div className={`${WRAP} grid gap-6 lg:grid-cols-2 lg:gap-10`}>
          <div className="panel p-8 sm:p-10">
            <h2 className="sign-type text-balance text-3xl font-bold leading-tight tracking-tight">
              Reader-supported, and upfront about it.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[color:var(--road-muted)]">
              Some links on SoloStack are affiliate links. If you buy through one, the merchant may pay us a commission.
              You pay the same price, and the commission does not buy a recommendation.
            </p>
            {retailers > 0 ? (
              <p className="mt-4 leading-relaxed text-[color:var(--road-muted)]">
                Prices on gear pages come from <span className="num font-bold text-[color:var(--road-ink)]">{retailers}</span>{' '}
                Australian and international retailers, shown in Australian dollars where the retailer lists them.
              </p>
            ) : null}
            <Link
              href="/affiliate-disclosure"
              className="sign-type group mt-6 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
            >
              Read the full disclosure
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="panel p-8 sm:p-10">
            <h2 className="sign-type text-balance text-3xl font-bold leading-tight tracking-tight">
              An Australian business in Perth.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[color:var(--road-muted)]">
              Found a mistake, or have a tool we should look at? We read every email.
            </p>
            <dl className="mt-6 divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)]">
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-[color:var(--road-muted)]">Operated by</dt>
                <dd className="sign-type text-right font-bold">{BUSINESS.operator}</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-[color:var(--road-muted)]">ABN</dt>
                <dd className="num sign-type text-right font-bold">{BUSINESS.abn}</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-[color:var(--road-muted)]">Based in</dt>
                <dd className="sign-type text-right font-bold">West Perth, Western Australia</dd>
              </div>
            </dl>
            <Link
              href="/contact"
              className="sign-type group mt-6 inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-6 py-3.5 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110"
            >
              Get in touch
              <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
