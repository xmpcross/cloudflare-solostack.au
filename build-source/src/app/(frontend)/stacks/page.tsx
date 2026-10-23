import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight, BookOpen, Check } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'

export const revalidate = 600

const WRAP = 'mx-auto w-full max-w-[1366px] px-4 sm:px-8'

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/stacks' },
    title: 'Solopreneur Stack Directory & Operational Blueprints | SoloStack',
    description:
      'Curated software and hardware toolchains for 1-person businesses, creators, and remote agency operators.',
  }
}

const imageUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return img
  return img.url || img.sizes?.medium?.url || null
}

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const POINTS = [
  {
    title: 'Built around an outcome',
    body: 'Every blueprint starts from the result a solo operator wants, then works back to the minimum set of tools and equipment needed to reach it.',
  },
  {
    title: 'Software and hardware together',
    body: 'Workflows are limited as much by the microphone, camera or desk as by the apps. Blueprints list both, with price ranges so you can budget the whole setup.',
  },
  {
    title: 'Adapt, do not copy',
    body: 'Treat a blueprint as a starting point. Swap in tools you already own, and add the pieces you are missing one at a time rather than buying everything at once.',
  },
]

export default async function StacksPage() {
  let stacks: any[] = []
  let guides: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({ collection: 'stacks', depth: 2, limit: 100 })
    stacks = result.docs
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

  const stack = stacks[0]
  const tools: any[] = (stack?.tools || []).filter((t: any) => typeof t === 'object')
  const hardware: any[] = (stack?.hardware || []).filter((h: any) => typeof h === 'object')
  const stackImage = imageUrl(hardware[0]?.image)
  const lead = guides[0]
  const rest = guides.slice(1)

  return (
    <div className="road">
      {/* 1. HERO: what a blueprint is, beside the one fully priced stack */}
      <section className="relative overflow-hidden bg-[color:var(--road-tint)] text-[color:var(--road-ink)]">
        <div className={`${WRAP} grid gap-10 pb-16 pt-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-24 lg:pt-16`}>
          <div className="lg:col-span-6">
            <h1 className="sign-type text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Stack blueprints for one-person businesses.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[color:var(--road-muted)]">
              A complete, ordered set of software and hardware for one outcome, such as running a video channel or a
              consulting practice. Instead of reviewing tools one at a time, each blueprint shows how the pieces fit
              together.
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="text-sm text-[color:var(--road-muted)]">Priced stacks</dt>
                <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{stacks.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-[color:var(--road-muted)]">Stack guides</dt>
                <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{guides.length}</dd>
              </div>
            </dl>
          </div>

          {stack ? (
            <div className="lg:col-span-6">
              <Link
                href={`/stacks/${stack.slug}`}
                className="panel group block overflow-hidden p-3 sm:p-4"
                aria-label={`Open ${stack.title}`}
              >
                {stackImage ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                    <Image
                      src={stackImage}
                      alt={hardware[0]?.image?.alt || stack.title}
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
                    <span className="sign-type block text-2xl font-bold leading-tight sm:text-3xl">{stack.title}</span>
                    {stack.businessModel ? (
                      <span className="mt-1 block text-sm text-[color:var(--road-muted)]">Built for {String(stack.businessModel).toLowerCase()}s</span>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {stack.monthlySoftwareCost ? (
                      <span className="text-right">
                        <span className="num sign-type block text-2xl font-bold text-[color:var(--road-green)]">
                          {stack.monthlySoftwareCost}
                        </span>
                        <span className="block text-xs text-[color:var(--road-muted)]">software</span>
                      </span>
                    ) : null}
                    <ArrowRight aria-hidden className="lane-arrow size-8 text-[color:var(--road-green)]" />
                  </div>
                </div>
              </Link>
            </div>
          ) : null}
        </div>
        <div
          aria-hidden
          className="h-2 w-full"
          style={{ background: 'repeating-linear-gradient(90deg, var(--sign-yellow) 0 56px, var(--road-green) 56px 96px)' }}
        />
      </section>

      {/* 2. THE STACK: every tool and piece of gear with what it does and what it costs */}
      {stack ? (
        <section className="py-16 sm:py-24">
          <div className={`${WRAP} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <div className="lg:col-span-4">
              <h2 className="sign-type text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                What is in {stack.title}
              </h2>
              {stack.description ? (
                <p className="mt-5 text-lg leading-relaxed text-[color:var(--road-muted)]">{stack.description}</p>
              ) : null}
              <Link
                href={`/stacks/${stack.slug}`}
                className="sign-type group mt-8 inline-flex items-center gap-3 rounded-xl bg-[color:var(--road-green)] px-6 py-4 text-base font-bold text-[color:var(--sign-white)] hover:brightness-110"
              >
                Open the full stack
                <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ol className="divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)] lg:col-span-8">
              {tools.map((tool) => (
                <li key={tool.id} className="grid gap-4 py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-6">
                  <BrandMark slug={tool.slug} name={tool.name} className="size-14" />
                  <div className="min-w-0">
                    <Link href={`/tools/${tool.slug}`} className="sign-type text-xl font-bold hover:underline">
                      {tool.name}
                    </Link>
                    {tool.summary ? (
                      <p className="mt-1 max-w-2xl leading-relaxed text-[color:var(--road-muted)]">{tool.summary}</p>
                    ) : tool.tagline ? (
                      <p className="mt-1 text-[color:var(--road-muted)]">{tool.tagline}</p>
                    ) : null}
                    {tool.pros?.length ? (
                      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                        {tool.pros.slice(0, 2).map((p: any, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check aria-hidden className="size-4 shrink-0 text-[color:var(--road-green)]" />
                            {p.pro}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="sm:text-right">
                    <span className="num sign-type block text-xl font-bold">{tool.startingPrice}</span>
                    <span className="num block text-xs text-[color:var(--road-muted)]">
                      {tool.pricingType}
                      {tool.rating ? ` · ${tool.rating}/5` : ''}
                    </span>
                  </div>
                </li>
              ))}
              {hardware.map((item) => {
                const thumb = imageUrl(item.image)
                return (
                  <li key={`hw-${item.id}`} className="grid gap-4 py-7 sm:grid-cols-[auto_1fr_auto] sm:gap-6">
                    <span className="relative block size-14 shrink-0 overflow-hidden rounded-lg bg-[color:var(--road-rule)] ring-1 ring-black/10">
                      {thumb ? (
                        <Image src={thumb} alt="" fill sizes="56px" className="object-cover" unoptimized />
                      ) : null}
                    </span>
                    <div className="min-w-0">
                      <span className="sign-type text-xl font-bold">{item.name}</span>
                      {item.verdict ? (
                        <p className="mt-1 max-w-2xl leading-relaxed text-[color:var(--road-muted)]">{item.verdict}</p>
                      ) : null}
                    </div>
                    <div className="sm:text-right">
                      <span className="num sign-type block text-xl font-bold">{item.priceRange}</span>
                      <span className="block text-xs text-[color:var(--road-muted)]">hardware</span>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      ) : null}

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

      {/* 4. HOW TO USE A BLUEPRINT */}
      <section className="py-16 sm:py-24">
        <div className={WRAP}>
          <h2 className="sign-type max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            What is a stack blueprint?
          </h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {POINTS.map((point) => (
              <div key={point.title} className="border-t-2 border-[color:var(--road-green)] pt-5">
                <h3 className="sign-type text-xl font-bold">{point.title}</h3>
                <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DISCLOSURE */}
      <section className="bg-[color:var(--sign-yellow)] py-12 text-[color:var(--road-green-deep)]">
        <div className={`${WRAP} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
          <p className="sign-type max-w-3xl text-balance text-xl font-bold leading-snug sm:text-2xl">
            Some links on this page are affiliate links. SoloStack may earn a commission at no extra cost to you.
          </p>
          <Link
            href="/affiliate-disclosure"
            className="sign-type group inline-flex shrink-0 items-center gap-3 rounded-xl bg-[color:var(--road-green-deep)] px-6 py-3.5 text-base font-bold text-[color:var(--sign-white)] hover:brightness-125"
          >
            Affiliate disclosure
            <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  )
}
