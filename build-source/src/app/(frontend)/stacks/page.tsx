import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight, BookOpen } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'
import { DisclosureBand, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
import { BUILD_ORDER, BUILT_FOR, EXCHANGE_NOTE, FAQ, PRICES_CHECKED, STACK_GUIDE, costNumber } from '@/utilities/stackContent'

export const revalidate = 600

const SITE = 'https://solostack.au'

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/stacks' },
    title: 'Tech Stack Blueprints for One-Person Businesses (2026) | SoloStack',
    description:
      'Eight priced tech stack blueprints for Australian solo operators: creators, consultants, newsletter writers, SaaS founders and freelancers. Software from A$47 a month, prices in A$.',
  }
}

const imageUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return img
  return img.url || img.sizes?.medium?.url || null
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export default async function StacksPage() {
  let stacks: any[] = []
  let guides: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({ collection: 'stacks', depth: 2, limit: 100 })
    // Cheapest software first, so the page leads with the easiest stack to start.
    stacks = result.docs.sort((a: any, b: any) => (costNumber(a.monthlySoftwareCost) ?? 1e9) - (costNumber(b.monthlySoftwareCost) ?? 1e9))
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 20,
      depth: 1,
      overrideAccess: true,
      sort: '-publishedAt',
      where: { 'categories.slug': { equals: 'stacks' } },
      select: { title: true, slug: true, publishedAt: true, heroImage: true, meta: true, categories: true },
    })
    guides = posts.docs
  } catch (error) {
    console.warn('Database connection error in /stacks:', error)
  }

  const costs = stacks.map((s) => costNumber(s.monthlySoftwareCost)).filter((n): n is number => n !== null)
  const cheapest = costs.length ? Math.min(...costs) : null
  const featured = stacks.find((s) => s.slug === '1-person-youtube-studio') ?? stacks[0]
  const featuredHw: any[] = (featured?.hardware || []).filter((h: any) => typeof h === 'object')
  const featuredImage = imageUrl(featuredHw.find((h) => imageUrl(h.image))?.image)
  const lead = guides[0]
  const rest = guides.slice(1)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}/stacks#page`,
        url: `${SITE}/stacks`,
        name: 'Tech Stack Blueprints for One-Person Businesses',
        description: 'Priced software and gear blueprints for Australian solo operators.',
        isPartOf: { '@type': 'WebSite', name: 'SoloStack', url: SITE },
      },
      {
        '@type': 'ItemList',
        name: 'Stack blueprints',
        itemListElement: stacks.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.title,
          url: `${SITE}/stacks/${s.slug}`,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      },
    ],
  }

  return (
    <div className="road">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. HERO: what a blueprint is, beside one fully priced stack */}
      <RoadHero
        title="Stack blueprints for one-person businesses."
        intro="A complete, ordered set of software and gear for one outcome, such as running a video channel or a consulting practice, with every price in Australian dollars. Each blueprint shows how the pieces fit together instead of reviewing tools one at a time."
        facts={[
          { label: 'Priced stacks', value: String(stacks.length) },
          ...(cheapest !== null ? [{ label: 'Software from', value: `A$${cheapest}/mo` }] : []),
          { label: 'Stack guides', value: String(guides.length) },
        ]}
        aside={
          featured ? (
            <Link href={`/stacks/${featured.slug}`} className="panel group block overflow-hidden p-3 sm:p-4" aria-label={`Open ${featured.title}`}>
              {featuredImage ? (
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                  <Image
                    src={featuredImage}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 640px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="flex items-end justify-between gap-6 px-2 pb-2 pt-5 sm:px-3">
                <div className="min-w-0">
                  <span className="sign-type block text-2xl font-bold leading-tight sm:text-3xl">{featured.title}</span>
                  <span className="mt-1 block text-sm text-[color:var(--road-muted)]">Built for {(BUILT_FOR[featured.slug] || featured.businessModel || '').toLowerCase()}s</span>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {featured.monthlySoftwareCost ? (
                    <span className="text-right">
                      <span className="num sign-type block text-2xl font-bold text-[color:var(--road-green)]">{featured.monthlySoftwareCost}</span>
                      <span className="block text-xs text-[color:var(--road-muted)]">software a month</span>
                    </span>
                  ) : null}
                  <ArrowRight aria-hidden className="lane-arrow size-8 text-[color:var(--road-green)]" />
                </div>
              </div>
            </Link>
          ) : undefined
        }
      />

      {/* 2. DIRECTORY: one card per stack */}
      <section className="py-16 sm:py-24">
        <div className={WRAP}>
          <h2 className="sign-type max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Pick the stack for the business you run
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stacks.map((s) => {
              const tools: any[] = (s.tools || []).filter((t: any) => typeof t === 'object')
              const hw: any[] = (s.hardware || []).filter((h: any) => typeof h === 'object')
              return (
                <li key={s.id}>
                  <Link href={`/stacks/${s.slug}`} className="panel group flex h-full flex-col p-5">
                    <span className="num text-xs font-bold uppercase tracking-wide text-[color:var(--road-green)]">
                      {BUILT_FOR[s.slug] || s.businessModel}
                    </span>
                    <span className="sign-type mt-2 text-xl font-bold leading-snug group-hover:underline">{s.title}</span>
                    {s.description ? (
                      <span className="mt-2 text-sm leading-relaxed text-[color:var(--road-muted)]">{s.description}</span>
                    ) : null}
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      {tools.slice(0, 5).map((t) => (
                        <BrandMark key={t.id} slug={t.slug} name={t.name} className="size-9" />
                      ))}
                    </span>
                    <span className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <span className="num text-xs text-[color:var(--road-muted)]">
                        {tools.length} tool{tools.length === 1 ? '' : 's'}
                        {hw.length ? ` · ${hw.length} gear` : ''}
                      </span>
                      <span className="text-right">
                        <span className="num sign-type block text-xl font-bold text-[color:var(--road-green)]">{s.monthlySoftwareCost}</span>
                        <span className="block text-xs text-[color:var(--road-muted)]">software a month</span>
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[color:var(--road-muted)]">{EXCHANGE_NOTE}</p>
        </div>
      </section>

      {/* 3. STACK GUIDES: one lead and four more, each with its own image */}
      {lead ? (
        <section className="border-y border-[color:var(--road-rule)] bg-[color:var(--sign-white)] py-16 sm:py-24">
          <div className={WRAP}>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[color:var(--road-green)] pb-6">
              <h2 className="sign-type text-3xl font-bold tracking-tight sm:text-4xl">Stack guides</h2>
              <Link
                href="/posts/category/stacks"
                className="sign-type text-sm font-bold underline underline-offset-4"
              >
                All stack guides
              </Link>
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
              <article className="group lg:col-span-7">
                <Link href={`/posts/${lead.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                    {imageUrl(lead.heroImage || lead.meta?.image) ? (
                      <Image
                        src={imageUrl(lead.heroImage || lead.meta?.image) as string}
                        alt={lead.title}
                        fill
                        sizes="(min-width: 1024px) 760px, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        unoptimized
                      />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <BookOpen className="size-10 text-[color:var(--road-muted)]" />
                      </div>
                    )}
                  </div>
                  <time className="num mt-5 block text-sm text-[color:var(--road-muted)]" dateTime={lead.publishedAt}>
                    {formatDate(lead.publishedAt)}
                  </time>
                  <h3 className="sign-type mt-2 text-balance text-2xl font-bold leading-tight group-hover:underline sm:text-4xl">
                    {lead.title}
                  </h3>
                  {lead.meta?.description ? (
                    <p className="mt-3 max-w-2xl leading-relaxed text-[color:var(--road-muted)]">
                      {lead.meta.description}
                    </p>
                  ) : null}
                </Link>
              </article>

              <ul className="grid gap-6 lg:col-span-5 lg:self-start">
                {rest.map((post) => (
                  <li key={post.id}>
                    <Link href={`/posts/${post.slug}`} className="lane group grid grid-cols-[9.5rem_1fr] gap-5 sm:grid-cols-[12rem_1fr]">
                      <span className="relative block aspect-[3/2] overflow-hidden rounded-lg bg-[color:var(--road-rule)]">
                        {imageUrl(post.heroImage || post.meta?.image) ? (
                          <Image
                            src={imageUrl(post.heroImage || post.meta?.image) as string}
                            alt=""
                            fill
                            sizes="192px"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                            unoptimized
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="num block text-xs text-[color:var(--road-muted)]">
                          {formatDate(post.publishedAt)}
                        </span>
                        <span className="sign-type mt-1 block text-lg font-bold leading-snug group-hover:underline">
                          {post.title}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. BUILD ORDER */}
      <section className="border-t border-[color:var(--road-rule)] py-16 sm:py-24">
        <div className={WRAP}>
          <h2 className="sign-type max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Build your stack in this order
          </h2>
          <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {BUILD_ORDER.map((step, i) => (
              <li key={step.title} className="border-t-2 border-[color:var(--road-green)] pt-5">
                <span className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{i + 1}</span>
                <h3 className="sign-type mt-2 text-xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. PRICING NOTE AND FAQ (native details elements keep the answers in the HTML) */}
      <section className="border-t border-[color:var(--road-rule)] bg-[color:var(--sign-white)] py-16 sm:py-24">
        <div className={`${WRAP} grid gap-10 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-4">
            <h2 className="sign-type text-balance text-3xl font-bold tracking-tight sm:text-4xl">Questions about stacks and prices</h2>
            <p className="mt-5 leading-relaxed text-[color:var(--road-muted)]">
              Prices checked {PRICES_CHECKED}. Confirm the final price on the vendor&apos;s site before you buy.
            </p>
          </div>
          <div className="divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)] lg:col-span-8">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="sign-type flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                  {f.q}
                  <span aria-hidden className="num text-2xl text-[color:var(--road-green)] group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-[color:var(--road-muted)]">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <DisclosureBand />
    </div>
  )
}
