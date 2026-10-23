import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, Camera, Headphones, Lightbulb, Mic, Armchair, CheckCircle2, XCircle } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { FAQSection, type FAQItem } from '@/components/FAQSection'
import Image from 'next/image'
import { BrandMark } from '@/components/marketing/BrandMark'
import { DisclosureBand, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
import { bestOffer, formatAud, formatDay, logoKeyOf, mediaUrl, type BestOffer } from '@/utilities/gearOffers'

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

const SECTION_IMAGES: Record<string, { src: string; alt: string }> = {
  audio: { src: '/api/media/file/solo-podcast-recording-workflow-1.webp', alt: 'Podcast recording workflow for solo hosts' },
  lighting: { src: '/api/media/file/batch-content-recording-1.webp', alt: 'Key light, camera and tripod set up for batch recording' },
  camera: { src: '/api/media/file/1-person-video-podcast-setup.webp', alt: 'One-person video podcast setup with microphone, camera and lamp' },
  headphones: { src: '/api/media/file/solo-podcaster-stack-3.webp', alt: 'Microphone and over-ear headphones' },
  desk: { src: '/api/media/file/herman-miller-embody.webp', alt: 'Ergonomic chair at a desk by a window' },
}

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
  rating?: number | null
  offer?: BestOffer | null
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
      rating: null,
      offer: null,
      image: h.image && typeof h.image === 'object' ? h.image : null,
    }))
    const fromProducts: Pick[] = (products.docs as any[]).map((p) => ({
      key: `p-${p.id}`,
      name: p.name,
      brand: p.brand,
      blurb: p.summary,
      bestFor: p.bestFor,
      specs: Array.isArray(p.specs) ? p.specs.slice(0, 3).map((x: any) => `${x.label}: ${x.value}`) : [],
      rating: typeof p.rating === 'number' ? p.rating : null,
      offer: bestOffer(p.offers),
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
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
  ]

  const stamp = formatDay(
    picks
      .map((p) => p.offer?.checkedAt)
      .filter(Boolean)
      .sort()
      .pop() as string | undefined,
  )

  return (
    <div className="road">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}

      <RoadHero
        title="The gear that makes one person look like a studio."
        intro="You do not need a studio. You need clear sound, one good light, a steady camera and a chair you can live in. Here is what to buy, in what order, and what to skip."
        facts={[
          { label: 'Gear picks', value: String(picks.filter((p) => p.key.startsWith('p-')).length) },
          { label: 'Guides below', value: String(SECTIONS.length) },
        ]}
        aside={
          <div className="panel overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src="/api/media/file/shure-sm7b.webp"
                alt="Shure SM7B microphone on a boom arm in a home studio"
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <ol className="mt-3 grid divide-y divide-[color:var(--road-rule)] sm:grid-cols-2 sm:divide-y-0">
              {ORDER.map((item, i) => (
                <li key={item.title}>
                  <a href={item.href} className="lane group flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-[color:var(--road-green)]/10">
                    <span className="num sign-type grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--sign-yellow)] text-sm font-bold text-[color:var(--road-green-deep)]">
                      {i + 1}
                    </span>
                    <span>
                      <span className="sign-type block font-bold">{item.title}</span>
                      <span className="block text-sm leading-snug text-[color:var(--road-muted)]">{item.note}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        }
      />

      <nav aria-label="On this page" className="sticky top-0 z-20 border-b border-[color:var(--road-rule)] bg-[color:var(--road-ground)]/95 backdrop-blur">
        <div className={`${WRAP} flex gap-2 overflow-x-auto py-3`}>
          {SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className="sign-type whitespace-nowrap rounded-full border-2 border-[color:var(--road-green)] px-4 py-1.5 text-sm font-bold hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)]"
            >
              {sec.nav}
            </a>
          ))}
        </div>
      </nav>

      {SECTIONS.map((section, idx) => {
        const sectionPicks = picksFor(section)
        const photo = SECTION_IMAGES[section.id]
        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-h`}
            className={`scroll-mt-16 border-b border-[color:var(--road-rule)] py-14 sm:py-20 ${
              idx % 2 ? 'bg-[color:var(--sign-white)]' : ''
            }`}
          >
            <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-20">
                  {photo ? (
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                      <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" unoptimized />
                    </div>
                  ) : null}
                  <h2 id={`${section.id}-h`} className="sign-type mt-6 text-balance text-3xl font-bold leading-tight tracking-tight">
                    {section.heading}
                  </h2>
                  <p className="mt-3 leading-relaxed text-[color:var(--road-muted)]">{section.intro}</p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-[color:var(--road-green)] bg-[color:var(--road-tint)] p-4">
                      <p className="sign-type flex items-center gap-1.5 text-sm font-bold text-[color:var(--road-green)]">
                        <CheckCircle2 className="size-4" aria-hidden /> Buy this
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{section.buyThis}</p>
                    </div>
                    <div className="rounded-xl border-2 border-[color:var(--road-green)] p-4">
                      <p className="sign-type flex items-center gap-1.5 text-sm font-bold">
                        <XCircle className="size-4" aria-hidden /> Skip this
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed">{section.skipThis}</p>
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-4">
                    {section.points.map(([label, text]) => (
                      <div key={label} className="border-t-2 border-[color:var(--road-green)] pt-3">
                        <dt className="sign-type font-bold">{label}</dt>
                        <dd className="mt-1 text-sm leading-relaxed text-[color:var(--road-muted)]">{text}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="lg:col-span-7">
                {sectionPicks.length > 0 ? (
                  <>
                    <h3 className="sign-type border-b-2 border-[color:var(--road-green)] pb-3 text-xl font-bold">
                      Our picks <span className="num text-[color:var(--road-muted)]">({sectionPicks.length})</span>
                    </h3>
                    <ul className="divide-y divide-[color:var(--road-rule)]">
                      {sectionPicks.map((pick) => {
                        const photoUrl = mediaUrl(pick.image)
                        return (
                          <li key={pick.key} className="grid grid-cols-[auto_1fr] gap-4 py-5 sm:grid-cols-[auto_1fr_auto] sm:gap-5">
                            {photoUrl ? (
                              <span className="relative block size-16 shrink-0 overflow-hidden rounded-lg bg-[color:var(--road-rule)] ring-1 ring-black/10">
                                <Image src={photoUrl} alt="" fill sizes="64px" className="object-cover" unoptimized />
                              </span>
                            ) : (
                              <BrandMark slug={logoKeyOf(pick.brand)} name={pick.brand || pick.name} className="size-16" />
                            )}
                            <div className="min-w-0">
                              <h4 className="sign-type text-lg font-bold leading-snug">{pick.name}</h4>
                              {pick.blurb ? <p className="mt-1 text-sm leading-relaxed">{pick.blurb}</p> : null}
                              {pick.bestFor ? (
                                <p className="mt-1 text-sm text-[color:var(--road-muted)]">
                                  <strong className="font-bold text-[color:var(--road-ink)]">Best for:</strong> {pick.bestFor}
                                </p>
                              ) : null}
                            </div>
                            <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:block sm:text-right">
                              {pick.offer ? (
                                <a
                                  href={pick.offer.url || '#'}
                                  target="_blank"
                                  rel="sponsored nofollow noopener noreferrer"
                                  className="lane group inline-flex flex-col items-start rounded-lg border-2 border-[color:var(--road-green)] px-3 py-2 hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)] sm:items-end"
                                >
                                  <span className="num sign-type text-xl font-bold leading-none">{formatAud(pick.offer.price)}</span>
                                  <span className="mt-1 text-xs">at {pick.offer.merchant}</span>
                                </a>
                              ) : pick.price ? (
                                <span className="num sign-type block text-lg font-bold">{pick.price}</span>
                              ) : null}
                              {pick.rating ? (
                                <span className="num block text-xs text-[color:var(--road-muted)] sm:mt-1.5">{pick.rating}/5 rating</span>
                              ) : null}
                              {pick.offer && pick.offer.retailers > 1 ? (
                                <span className="block text-xs text-[color:var(--road-muted)]">{pick.offer.retailers} retailers</span>
                              ) : null}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        )
      })}

      <section className="bg-[color:var(--road-tint)] py-14 sm:py-20">
        <div className={`${WRAP} grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-center`}>
          <div>
            <h2 className="sign-type text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Pair your gear with the right software
            </h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[color:var(--road-muted)]">
              Good hardware is half the setup. See the tools we use to record, edit, invoice and automate a one-person
              business, and the stacks that put them together.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/tools" className="sign-type inline-flex items-center gap-2 rounded-xl bg-[color:var(--sign-yellow)] px-5 py-3.5 text-sm font-bold text-[color:var(--road-green-deep)] hover:brightness-95">
              Software directory <ArrowRight className="size-4" />
            </Link>
            <Link href="/stacks" className="sign-type inline-flex items-center gap-2 rounded-xl border-2 border-[color:var(--road-green)] px-5 py-3.5 text-sm font-bold hover:bg-[color:var(--road-green)]/10">
              Stack blueprints <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-8">
          <FAQSection title="Creator gear FAQ" items={FAQS} />
          {stamp ? (
            <p className="mt-8 text-sm text-[color:var(--road-muted)]">
              Prices are the lowest Australian-dollar offer found at the last check ({stamp}). Prices move often, so
              confirm with the retailer before you buy.
            </p>
          ) : null}
        </div>
      </div>
      <DisclosureBand text="SoloStack is reader-supported. Some links may earn us a commission at no extra cost to you." />
    </div>
  )
}
