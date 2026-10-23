import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, Camera, Headphones, Lightbulb, Mic, Armchair, CheckCircle2, XCircle } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { FAQSection, type FAQItem } from '@/components/FAQSection'
import { Media } from '@/components/Media'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://solostack.au'
const PAGE_URL = `${SITE_URL}/best-gear`
const TITLE = 'Best Gear for Solo Creators and One-Person Businesses (2026)'
const DESCRIPTION =
  'What to buy, and in what order, to look and sound professional on your own: microphone, lighting, camera, headphones and a desk setup that will not wreck your back. No studio required.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, type: 'article', siteName: 'SoloStack' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const FAQS: FAQItem[] = [
  {
    question: 'What should I buy first if my budget is tight?',
    answer:
      'A microphone, then a light, then a camera. People will sit through average video, but they leave when the sound is bad. A decent microphone placed close to your mouth and one soft light beside your screen will do more for your content than any camera upgrade.',
  },
  {
    question: 'Is a USB microphone good enough, or do I need XLR?',
    answer:
      'USB is good enough for most solo creators and is much simpler: plug it in and record. XLR microphones need an audio interface, which adds cost and setup, but they let you upgrade each part separately later. Start with USB unless you already know you want a multi-mic or broadcast-style setup.',
  },
  {
    question: 'Do I need a dedicated camera, or is my phone enough?',
    answer:
      'A recent phone is enough for most work. Buy a webcam or camera when you need something a phone cannot do, such as sitting on your monitor for live calls, a longer battery life, or swapping lenses. Light and framing matter more than the camera body.',
  },
  {
    question: 'How much should I spend on a chair?',
    answer:
      'Spend what you can on the thing you sit in for six or more hours a day, and test it or check the return policy first. Adjustable seat height, seat depth, lumbar support and armrests matter more than the brand name.',
  },
  {
    question: 'Are the gear picks on this page affiliate links?',
    answer:
      'Some links may earn SoloStack a commission at no extra cost to you. That never changes what we list or the order we list it in. Prices move often, so check the retailer before you buy.',
  },
]

type Section = {
  id: string
  nav: string
  icon: React.ComponentType<{ className?: string }>
  heading: string
  intro: string
  buyThis: string
  skipThis: string
  points: [string, string][]
  match: RegExp
}

const SECTIONS: Section[] = [
  {
    id: 'audio',
    nav: 'Microphone',
    icon: Mic,
    heading: 'Microphone: fix your sound first',
    intro:
      'Clear audio is the biggest single upgrade for podcasts, courses, client calls and video. Viewers forgive a plain picture. They do not forgive an echoey room.',
    buyThis: 'A dynamic microphone you can place close to your mouth.',
    skipThis: 'An expensive condenser in an untreated room.',
    points: [
      ['Dynamic or condenser', 'Dynamic microphones ignore most room noise, which suits a normal home office. Condensers hear more detail, but also more echo and traffic.'],
      ['USB or XLR', 'USB is cheaper and simpler. XLR costs more up front but lets you upgrade the interface and microphone separately.'],
      ['Distance beats price', 'Keep the microphone a hand-width from your mouth, slightly off to the side, with a pop filter. A mid-range mic used well beats a top one used badly.'],
    ],
    match: /micro|\bmic\b|sm7b|yeti|podmic|nt-usb|at2040|solocast|k669/i,
  },
  {
    id: 'lighting',
    nav: 'Lighting',
    icon: Lightbulb,
    heading: 'Lighting: the cheapest big upgrade',
    intro:
      'One soft light in the right spot makes a budget camera look professional. A great camera in a dim room still looks dim.',
    buyThis: 'One soft, adjustable key light.',
    skipThis: 'A multi-light kit before you have placed the first one well.',
    points: [
      ['Soft, slightly above, to one side', 'Put a diffused light at roughly 45 degrees and just above eye level. Avoid lighting from directly below.'],
      ['Use a window', 'Face natural light when you can. Never sit with a bright window behind you.'],
      ['Add depth later', 'A small background light stops you blending into the wall. It is a nice extra, not a first purchase.'],
    ],
    match: /light|lamp|led/i,
  },
  {
    id: 'camera',
    nav: 'Camera',
    icon: Camera,
    heading: 'Camera: start with what you already own',
    intro:
      'A recent phone shoots very good video. Upgrade when you hit a real limit, such as low light, a fixed lens, or needing a camera that stays on your desk all day.',
    buyThis: 'A webcam or a stable phone mount if calls are your main use.',
    skipThis: 'A 4K camera when your lighting and framing are not sorted.',
    points: [
      ['Keep it steady', 'A tripod or fixed mount removes the amateur look straight away.'],
      ['Eye level, tidy frame', 'Lens at eye level, a little headroom, and a background you would be happy for clients to see.'],
      ['Record locally when you can', 'Recording on your own device avoids the compression of a video call and keeps full quality for editing.'],
    ],
    match: /webcam|camera|gopro|osmo|powershot|facecam|streamcam/i,
  },
  {
    id: 'headphones',
    nav: 'Headphones',
    icon: Headphones,
    heading: 'Headphones: hear what you actually recorded',
    intro:
      'Headphones let you catch hums, clipping and background noise while you record, and keep playback from leaking into your microphone.',
    buyThis: 'Closed-back headphones you can wear for hours.',
    skipThis: 'Paying extra for features you will not use while recording.',
    points: [
      ['Closed-back for recording', 'The closed design keeps sound out of your microphone.'],
      ['Comfort over hours', 'Weight and ear-cup comfort matter as much as sound during a long edit.'],
    ],
    match: /headphone|headset|earbud|wh-1000|live 780/i,
  },
  {
    id: 'desk',
    nav: 'Desk and chair',
    icon: Armchair,
    heading: 'Desk setup: protect the one tool you cannot replace',
    intro:
      'In a one-person business, your body is the equipment. Chair, screen height and a comfortable mouse and keyboard decide how long you can focus.',
    buyThis: 'An adjustable chair, a monitor or laptop stand at eye level, and a mouse that fits your hand.',
    skipThis: 'Gaming-style chairs chosen on looks rather than adjustability.',
    points: [
      ['Chair', 'Look for adjustable seat height, seat depth, lumbar support and armrests. Try it first or check the return policy.'],
      ['Screen height', 'The top of the screen should sit at or slightly below eye level, about an arm’s length away.'],
      ['Move through the day', 'A sit-stand desk only helps if you actually change position. Set a reminder.'],
    ],
    match: /chair|desk|monitor|stand|mouse|keyboard|dock|hub|mat|router|deco/i,
  },
]

const ORDER = [
  { title: 'Microphone', note: 'Clear sound keeps people watching and listening.', href: '#audio' },
  { title: 'Light', note: 'One soft light beside your screen.', href: '#lighting' },
  { title: 'Camera', note: 'Your phone may already be enough.', href: '#camera' },
  { title: 'Desk and chair', note: 'So you can keep working for years.', href: '#desk' },
]

type Pick = {
  key: string
  name: string
  brand?: string | null
  blurb?: string | null
  bestFor?: string | null
  specs: string[]
  price?: string | null
  image: any
}

// Curated Hardware entries, plus every Product that is not rejected or discontinued.

async function getPicks(): Promise<Pick[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const [hardware, products] = await Promise.all([
      payload.find({ collection: 'hardware', limit: 50, depth: 1, sort: 'createdAt' }),
      payload.find({
        collection: 'products' as any,
        limit: 100,
        depth: 1,
        sort: 'name',
        overrideAccess: true,
        where: { status: { not_in: ['rejected', 'discontinued'] }, productType: { equals: 'hardware' } },
      }),
    ])

    const fromHardware: Pick[] = (hardware.docs as any[]).map((h) => ({
      key: `h-${h.id}`,
      name: h.name,
      brand: h.manufacturer,
      blurb: typeof h.verdict === 'string' ? h.verdict : null,
      specs: Array.isArray(h.specs) ? h.specs.map((x: any) => x?.spec).filter(Boolean) : [],
      price: h.priceRange,
      image: h.image && typeof h.image === 'object' ? h.image : null,
    }))
    const fromProducts: Pick[] = (products.docs as any[]).map((p) => ({
      key: `p-${p.id}`,
      name: p.name,
      brand: p.brand,
      blurb: p.summary,
      bestFor: p.bestFor,
      specs: Array.isArray(p.specs) ? p.specs.slice(0, 3).map((x: any) => `${x.label}: ${x.value}`) : [],
      image: p.image && typeof p.image === 'object' ? p.image : null,
    }))
    return [...fromHardware, ...fromProducts]
  } catch (error) {
    console.warn('Gear picks fetch error on /best-gear:', error)
    return []
  }
}

export default async function BestGearPage() {
  const picks = await getPicks()
  const claimed = new Set<string>()
  const picksFor = (section: Section) =>
    picks.filter((p) => {
      if (claimed.has(p.key) || !section.match.test(`${p.name} ${p.brand || ''}`)) return false
      claimed.add(p.key)
      return true
    })

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: TITLE,
      description: DESCRIPTION,
      mainEntityOfPage: PAGE_URL,
      author: { '@type': 'Organization', name: 'SoloStack' },
      publisher: { '@type': 'Organization', name: 'SoloStack' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Best Gear', item: PAGE_URL },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ]

  return (
    <div className="pb-24">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      {/* Hero */}
      <header className="border-b border-border bg-neutral-50/70 dark:bg-card/40">
        <div className="mx-auto max-w-[1366px] px-4 md:px-8 pt-20 pb-12 lg:pb-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:underline">Home</Link> <span aria-hidden>/</span> <span>Best Gear</span>
          </nav>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Buying guide · Updated 2026
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight leading-[1.1]">
                The gear that makes one person look like a studio
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                You do not need a studio. You need clear sound, one good light, a steady camera and a chair you can
                live in. Here is what to buy, in what order, and what to skip.
              </p>
              <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-1">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                  >
                    {sec.nav}
                  </a>
                ))}
              </nav>
            </div>

            <aside className="rounded-[8px] border border-border bg-background p-6 shadow-sm">
              <h2 className="text-base font-bold mb-4">Buy in this order</h2>
              <ol className="space-y-4">
                {ORDER.map((item, i) => (
                  <li key={item.title}>
                    <a href={item.href} className="group flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <span>
                        <span className="block font-semibold group-hover:text-emerald-700 transition-colors">{item.title}</span>
                        <span className="block text-sm text-muted-foreground">{item.note}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </div>
      </header>

      {/* Sections */}
      <div className="mx-auto max-w-[1366px] px-4 md:px-8">
        {SECTIONS.map((section) => {
          const Icon = section.icon
          const sectionPicks = picksFor(section)
          return (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-h`}
              className="scroll-mt-24 border-b border-border py-14 last:border-b-0"
            >
              <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
                <div className="space-y-5">
                  <h2 id={`${section.id}-h`} className="flex items-start gap-3 text-2xl md:text-3xl font-bold tracking-tight">
                    <Icon className="mt-1 size-7 shrink-0 text-emerald-600" aria-hidden />
                    {section.heading}
                  </h2>
                  <p className="leading-relaxed text-muted-foreground">{section.intro}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <div className="rounded-[8px] border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="size-4" aria-hidden /> Buy this
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{section.buyThis}</p>
                    </div>
                    <div className="rounded-[8px] border border-border bg-muted/40 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <XCircle className="size-4" aria-hidden /> Skip this
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{section.skipThis}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <ul className="space-y-4">
                    {section.points.map(([label, text]) => (
                      <li key={label} className="rounded-[8px] border border-border bg-card p-5">
                        <h3 className="font-semibold">{label}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                      </li>
                    ))}
                  </ul>

                  {sectionPicks.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Our picks</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {sectionPicks.map((pick) => (
                          <article key={pick.key} className="flex flex-col overflow-hidden rounded-[8px] border border-border bg-card">
                            {pick.image && (
                              <div className="aspect-16/9 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                <Media
                                  resource={pick.image}
                                  size="33vw"
                                  className="size-full"
                                  imgClassName="size-full object-cover object-center"
                                />
                              </div>
                            )}
                            <div className="flex flex-1 flex-col gap-1.5 p-4">
                              {pick.brand && (
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{pick.brand}</p>
                              )}
                              <h4 className="font-bold leading-snug">{pick.name}</h4>
                              {pick.blurb && <p className="text-sm leading-relaxed">{pick.blurb}</p>}
                              {pick.bestFor && (
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-foreground">Best for:</strong> {pick.bestFor}
                                </p>
                              )}
                              {pick.specs.length > 0 && (
                                <p className="text-xs text-muted-foreground">{pick.specs.join(' • ')}</p>
                              )}
                              {pick.price && <p className="mt-auto pt-2 text-sm font-semibold">Typical price: {pick.price}</p>}
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}

        {/* Software CTA */}
        <section className="my-14 rounded-[8px] border border-border bg-neutral-50/70 p-8 dark:bg-card/40 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Pair your gear with the right software</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                Good hardware is half the setup. See the tools we use to record, edit, invoice and automate a
                one-person business, and the stacks that put them together.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                Software directory <ArrowRight className="size-4" />
              </Link>
              <Link href="/stacks" className="inline-flex items-center gap-1.5 rounded-[8px] border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
                Stack blueprints <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl">
          <FAQSection title="Creator gear FAQ" items={FAQS} />
          <p className="mt-8 text-xs text-muted-foreground">
            SoloStack is reader-supported. Some links may earn us a commission at no extra cost to you. See our{' '}
            <Link href="/affiliate-disclosure" className="underline">affiliate disclosure</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
