import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight, Award } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'
import { DisclosureBand, ExplainerGrid, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
import { bestOffer, formatAud, formatDay, logoKeyOf, mediaUrl, type BestOffer } from '@/utilities/gearOffers'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/comparisons' },
    title: 'Head-to-Head Software & Hardware Battles | SoloStack Comparisons',
    description:
      'Direct comparisons between top B2B tools and hardware equipment to help you decide what to buy.',
  }
}

const POINTS = [
  {
    title: 'Price and plans',
    body: 'We compare the entry price and what each plan includes, because the cheapest tier often leaves out the feature you bought the tool for.',
  },
  {
    title: 'Fit for a one-person workflow',
    body: 'Features built for large teams, such as approval chains and admin roles, count for less here than speed, simplicity and automation.',
  },
  {
    title: 'Where each option falls short',
    body: 'Every comparison names the trade-offs of each product alongside its strengths, so the right choice depends on your situation rather than a single winner.',
  },
]

type Group = { id: string; title: string; match: RegExp; image: string; alt: string; more: string }

// Researched products are grouped by what they are, so like is compared with like.
const GROUPS: Group[] = [
  { id: 'microphones', title: 'Microphones', match: /micro|\bmic\b|sm7b|yeti|podmic|nt-usb|at2040|solocast|k669|mv7/i, image: 'solo-podcast-recording-workflow-1', alt: 'Microphone with pop filter', more: '/best-gear#audio' },
  { id: 'webcams', title: 'Webcams and cameras', match: /webcam|facecam|streamcam|c920|c270|brio|smartcam|c960|camera|gopro|osmo|powershot/i, image: '1-person-video-podcast-setup', alt: 'Camera, microphone and lamp on a desk', more: '/best-gear#camera' },
  { id: 'lights', title: 'Video lights', match: /\blight\b/i, image: 'batch-content-recording-1', alt: 'Key light and camera on tripods', more: '/best-gear#lighting' },
  { id: 'headphones', title: 'Headphones', match: /headphone|headset|earbud|wh-1000|live 780/i, image: 'solo-podcaster-stack-3', alt: 'Microphone and over-ear headphones', more: '/best-gear#headphones' },
  { id: 'chairs', title: 'Office chairs', match: /chair/i, image: 'herman-miller-embody', alt: 'Ergonomic chair at a desk by a window', more: '/best-gear#desk' },
  { id: 'desks', title: 'Standing desks', match: /standing desk|sit-stand/i, image: 'ergonomic-minimalist-remote-workstation-setup-1', alt: 'Minimalist desk setup with monitor and chair', more: '/best-gear#desk' },
]

const GUIDE_TITLE = /\bvs\.?\b|\bor\b.*\?|choose|explained|compare/i

type Row = {
  id: string | number
  name: string
  brand?: string
  bestFor?: string
  rating?: number
  offer: BestOffer | null
}

function ComparisonTable({ rows }: { rows: Row[] }) {
  return (
    <div role="table" aria-label="Product comparison" className="border-y-2 border-[color:var(--road-green)]">
      <div
        role="row"
        className="sign-type hidden grid-cols-[minmax(0,2.2fr)_minmax(0,2fr)_5rem_9rem] gap-4 border-b border-[color:var(--road-rule)] py-3 text-sm font-bold text-[color:var(--road-muted)] md:grid"
      >
        <span role="columnheader">Product</span>
        <span role="columnheader">Best for</span>
        <span role="columnheader">Rating</span>
        <span role="columnheader" className="text-right">Lowest price</span>
      </div>
      <div className="divide-y divide-[color:var(--road-rule)]">
        {rows.map((r) => (
          <div
            key={r.id}
            role="row"
            className="grid gap-x-4 gap-y-2 py-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,2fr)_5rem_9rem] md:items-center"
          >
            <div role="cell" className="flex items-center gap-3">
              <BrandMark slug={logoKeyOf(r.brand)} name={r.brand || r.name} className="size-12" />
              <span className="min-w-0">
                <span className="sign-type block font-bold leading-snug">{r.name}</span>
              </span>
            </div>
            <p role="cell" className={`text-sm leading-snug text-[color:var(--road-muted)] ${r.bestFor ? '' : 'hidden md:block'}`}>
              {r.bestFor || '—'}
            </p>
            <p role="cell" className={`num text-sm ${r.rating ? '' : 'hidden md:block'}`}>
              {r.rating ? `${r.rating}/5` : '—'}
            </p>
            <div role="cell" className="md:text-right">
              {r.offer ? (
                <a
                  href={r.offer.url || '#'}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="lane group inline-flex flex-col rounded-lg border-2 border-[color:var(--road-green)] px-3 py-1.5 hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)] md:items-end"
                >
                  <span className="num sign-type text-lg font-bold leading-none">{formatAud(r.offer.price)}</span>
                  <span className="mt-0.5 text-xs">at {r.offer.merchant}</span>
                </a>
              ) : (
                <span className="text-sm text-[color:var(--road-muted)]">No price listed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ComparisonsDirectoryPage() {
  let comparisons: any[] = []
  let products: any[] = []
  let services: any[] = []
  let posts: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const [comps, hw, sv, ps] = await Promise.all([
      payload.find({ collection: 'comparisons', depth: 2, limit: 100 }),
      payload.find({
        collection: 'products' as any,
        limit: 200,
        depth: 0,
        sort: 'name',
        overrideAccess: true,
        where: { status: { not_in: ['rejected', 'discontinued'] }, productType: { equals: 'hardware' } },
      }),
      payload.find({
        collection: 'products' as any,
        limit: 100,
        depth: 0,
        sort: 'name',
        overrideAccess: true,
        where: { status: { not_in: ['rejected', 'discontinued'] }, productType: { equals: 'service' } },
      }),
      payload.find({
        collection: 'posts',
        draft: false,
        limit: 100,
        depth: 1,
        overrideAccess: true,
        sort: '-publishedAt',
        select: { title: true, slug: true, publishedAt: true, heroImage: true, meta: true },
      }),
    ])
    comparisons = comps.docs
    products = hw.docs as any[]
    services = sv.docs as any[]
    posts = ps.docs
  } catch (error) {
    console.warn('Database connection error in /comparisons:', error)
  }

  const claimed = new Set<string | number>()
  const groups = GROUPS.map((g) => {
    const rows: Row[] = products
      .filter((p) => {
        if (claimed.has(p.id) || !g.match.test(`${p.name}`)) return false
        claimed.add(p.id)
        return true
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        bestFor: p.bestFor,
        rating: typeof p.rating === 'number' ? p.rating : undefined,
        offer: bestOffer(p.offers),
      }))
      // cheapest first; products with no listed price go last
      .sort((a, b) => (a.offer?.price ?? Infinity) - (b.offer?.price ?? Infinity))
    const prices = rows.map((r) => r.offer?.price).filter((n): n is number => typeof n === 'number')
    return { ...g, rows, min: prices.length ? Math.min(...prices) : null, max: prices.length ? Math.max(...prices) : null }
  }).filter((g) => g.rows.length >= 2)

  const hosting: Row[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    brand: s.brand || s.name,
    bestFor: s.bestFor,
    rating: undefined,
    offer: null,
  }))

  const allOffers = [...products, ...services].flatMap((p) => p.offers ?? [])
  const retailers = new Set(allOffers.map((o: any) => o?.merchant).filter(Boolean)).size
  const checked = formatDay(
    allOffers
      .map((o: any) => o?.checkedAt)
      .filter(Boolean)
      .sort()
      .pop(),
  )
  const compared = groups.reduce((n, g) => n + g.rows.length, 0)

  const guides = posts.filter((p) => GUIDE_TITLE.test(p.title) && mediaUrl(p.heroImage || p.meta?.image)).slice(0, 4)

  return (
    <div className="road">
      <RoadHero
        title="Compare before you buy."
        intro="Comparisons help when two products look similar on a feature list but suit different people. Each one sets the options side by side on the points that matter most to a solo operator."
        facts={[
          { label: 'Products compared', value: String(compared) },
          { label: 'Australian retailers', value: String(retailers) },
        ]}
        aside={
          <Link
            href="/posts/website-builder-vs-wordpress"
            className="panel group block overflow-hidden p-3 sm:p-4"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
              <Image
                src="/api/media/file/website-builder-vs-wordpress-1.webp"
                alt="Two laptops side by side, one showing a design tool and one showing code"
                fill
                priority
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                unoptimized
              />
            </div>
            <div className="flex items-end justify-between gap-6 px-2 pb-2 pt-5 sm:px-3">
              <span className="sign-type text-xl font-bold leading-snug sm:text-2xl">
                Website Builder vs WordPress: which is right for a solo business?
              </span>
              <ArrowRight aria-hidden className="size-8 shrink-0 text-[color:var(--road-green)]" />
            </div>
          </Link>
        }
      />

      {/* HEAD-TO-HEAD records, when any are published */}
      {comparisons.length > 0 ? (
        <section className="py-16 sm:py-24">
          <div className={WRAP}>
            <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Head to head
            </h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {comparisons.map((comp) => (
                <li key={comp.id}>
                  <Link
                    href={`/comparisons/${comp.slug}`}
                    className="lane group block rounded-xl border-2 border-[color:var(--road-green)] p-6 hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)]"
                  >
                    {comp.winnerBadge ? (
                      <span className="sign-type mb-3 inline-flex items-center gap-1.5 rounded bg-[color:var(--sign-yellow)] px-2.5 py-1 text-xs font-bold text-[color:var(--road-green-deep)]">
                        <Award className="size-3.5" aria-hidden /> Winner: {comp.winnerBadge}
                      </span>
                    ) : null}
                    <span className="sign-type block text-2xl font-bold leading-tight">{comp.title}</span>
                    <span className="mt-4 flex items-center gap-3 text-sm font-bold">
                      {comp.toolA?.name || 'Option A'}
                      <span className="opacity-60">vs</span>
                      {comp.toolB?.name || 'Option B'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* SIDE BY SIDE: researched products grouped by type, cheapest first */}
      {groups.map((g, idx) => (
        <section
          key={g.id}
          id={g.id}
          className={`scroll-mt-16 border-b border-[color:var(--road-rule)] py-14 sm:py-20 ${
            idx % 2 ? 'bg-[color:var(--sign-white)]' : ''
          }`}
        >
          <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                  <Image
                    src={`/api/media/file/${g.image}.webp`}
                    alt={g.alt}
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h2 className="sign-type mt-6 text-3xl font-bold leading-tight tracking-tight">{g.title}</h2>
                <p className="mt-3 leading-relaxed text-[color:var(--road-muted)]">
                  <span className="num">{g.rows.length}</span> researched
                  {g.min !== null && g.max !== null ? (
                    <>
                      , from <span className="num font-bold text-[color:var(--road-ink)]">{formatAud(g.min)}</span> to{' '}
                      <span className="num font-bold text-[color:var(--road-ink)]">{formatAud(g.max)}</span> at Australian
                      retailers.
                    </>
                  ) : (
                    '.'
                  )}
                </p>
                <Link
                  href={g.more}
                  className="sign-type group mt-5 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
                >
                  What to look for
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-8">
              <ComparisonTable rows={g.rows} />
            </div>
          </div>
        </section>
      ))}

      {/* HOSTING AND DOMAINS */}
      {hosting.length >= 2 ? (
        <section id="hosting" className="scroll-mt-16 border-b border-[color:var(--road-rule)] py-14 sm:py-20">
          <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                  <Image
                    src="/api/media/file/how-to-choose-web-hosting-1.webp"
                    alt="Rows of web servers in a data centre"
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <h2 className="sign-type mt-6 text-3xl font-bold leading-tight tracking-tight">Hosting and domains</h2>
                <p className="mt-3 leading-relaxed text-[color:var(--road-muted)]">
                  <span className="num">{hosting.length}</span> providers researched, including Australian registrars.
                </p>
                <Link
                  href="/posts/how-to-choose-web-hosting"
                  className="sign-type group mt-5 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
                >
                  How to choose hosting
                  <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-8">
              <ComparisonTable rows={hosting} />
            </div>
          </div>
        </section>
      ) : null}

      {/* GUIDES that compare */}
      {guides.length > 0 ? (
        <section className="bg-[color:var(--sign-white)] py-16 sm:py-24">
          <div className={WRAP}>
            <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Comparison guides
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {guides.map((post) => (
                <li key={post.id}>
                  <Link href={`/posts/${post.slug}`} className="group block">
                    <span className="relative block aspect-[3/2] overflow-hidden rounded-lg bg-[color:var(--road-rule)]">
                      <Image
                        src={mediaUrl(post.heroImage || post.meta?.image) as string}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 320px, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        unoptimized
                      />
                    </span>
                    <span className="num mt-4 block text-xs text-[color:var(--road-muted)]">{formatDay(post.publishedAt)}</span>
                    <span className="sign-type mt-1 block text-lg font-bold leading-snug group-hover:underline">
                      {post.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ExplainerGrid heading="How we compare tools and gear" points={POINTS} />

      {checked ? (
        <p className={`${WRAP} pb-10 text-sm text-[color:var(--road-muted)]`}>
          Prices are the lowest Australian-dollar offer found at the last check ({checked}). Prices move often, so
          confirm with the retailer before you buy.
        </p>
      ) : null}
      <DisclosureBand />
    </div>
  )
}
