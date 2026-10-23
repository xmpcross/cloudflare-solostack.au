'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search, BookOpen, X } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'

export interface CategoryData {
  id: string | number
  title: string
  slug: string
  postCount?: number
}

export interface PostData {
  id: string | number
  title: string
  slug: string
  meta?: {
    description?: string
    image?: any
  }
  heroImage?: any
  categories?: any[]
  publishedAt?: string
  authors?: any[]
}

export interface StackData {
  id: string | number
  title: string
  slug: string
  businessModel?: string
  description?: string
  monthlySoftwareCost?: string
  tools?: any[]
  hardware?: any[]
}

export interface ToolData {
  id: string | number
  name: string
  slug: string
  tagline?: string
  startingPrice?: string
  pricingType?: string
  rating?: number
}

export interface HardwareData {
  id: string | number
  name: string
  slug: string
  manufacturer?: string
  priceRange?: string
  verdict?: string
}

interface HomePageClientProps {
  categories: CategoryData[]
  posts: PostData[]
  stacks: StackData[]
  tools: ToolData[]
  hardware: HardwareData[]
  gearCount?: number
  providerCount?: number
}

// Posts shown in the guides section: one lead plus the list beside it (newest first).
const MAX_HOME_POSTS = 7

const WRAP = 'mx-auto w-full max-w-[1366px] px-4 sm:px-8'

const getImageUrl = (imageObj: any): string | null => {
  if (!imageObj) return null
  if (typeof imageObj === 'string') return imageObj
  return imageObj.url || imageObj.sizes?.medium?.url || imageObj.sizes?.thumbnail?.url || null
}

const postCategory = (post: PostData) => {
  const c = post.categories?.[0]
  return typeof c === 'object' && c ? { title: c.title as string, slug: c.slug as string } : null
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function HomePageClient({
  categories,
  posts,
  stacks,
  tools,
  hardware,
  gearCount = 0,
  providerCount = 0,
}: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => {
        const inCat = posts.filter((p) =>
          p.categories?.some((c) => (typeof c === 'object' ? c.slug === cat.slug : c === cat.slug)),
        )
        return { ...cat, count: inCat.length, latest: inCat[0] }
      }),
    [categories, posts],
  )

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return posts.filter((post) => {
      const inCategory =
        selectedCategory === 'all' ||
        post.categories?.some((cat) => (typeof cat === 'object' ? cat.slug === selectedCategory : cat === selectedCategory))
      const inSearch =
        !q || post.title.toLowerCase().includes(q) || post.meta?.description?.toLowerCase().includes(q)
      return inCategory && inSearch
    })
  }, [posts, selectedCategory, searchQuery])

  const shown = matches.slice(0, MAX_HOME_POSTS)
  const lead = shown[0]
  const rest = shown.slice(1)
  const stack = stacks[0]

  const jumpToGuides = () => {
    document.getElementById('guides')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const lanes = [
    { label: 'Guides', note: `${posts.length} to read`, href: '/posts', show: posts.length > 0 },
    { label: 'Stack blueprints', note: `${stacks.length} worked out`, href: '/stacks', show: stacks.length > 0 },
    { label: 'Software', note: `${tools.length} tools priced`, href: '/tools', show: tools.length > 0 },
    { label: 'Best gear', note: `${gearCount} picks`, href: '/best-gear', show: gearCount > 0 },
    {
      label: 'Hosting & domains',
      note: `${providerCount} providers`,
      href: '/posts?category=websites-hosting',
      show: providerCount > 0,
    },
  ].filter((l) => l.show)

  return (
    <main className="road min-h-screen">
      {/* 1. GANTRY: the first viewport is an overhead sign pointing to the site's real sections */}
      <section className="relative overflow-hidden bg-[color:var(--road-green)] text-[color:var(--sign-white)]">
        <div className={`${WRAP} grid gap-10 pb-16 pt-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-24 lg:pt-20`}>
          <div className="lg:col-span-6">
            <h1 className="sign-type text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Tools, gear and stacks for a business of one.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-white/85">
              Guides, gear picks, software reviews and a worked-out stack for people running a business on their own in
              Australia.
            </p>

            <form
              role="search"
              className="mt-8 max-w-[34rem]"
              onSubmit={(e) => {
                e.preventDefault()
                setSelectedCategory('all')
                jumpToGuides()
              }}
            >
              <label htmlFor="home-search" className="sr-only">
                Search guides
              </label>
              <div className="on-light flex items-center rounded-xl bg-[color:var(--sign-white)] p-1.5 text-[color:var(--road-ink)]">
                <Search aria-hidden className="ml-3 size-5 shrink-0 text-[color:var(--road-muted)]" />
                <input
                  id="home-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${posts.length} guides`}
                  className="w-full bg-transparent px-3 py-3 text-base placeholder:text-[color:var(--road-muted)]/80 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="mr-1 grid size-9 place-items-center rounded-lg text-[color:var(--road-muted)] hover:bg-black/5"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
                <button
                  type="submit"
                  className="sign-type rounded-lg bg-[color:var(--sign-yellow)] px-5 py-3 text-sm font-bold text-[color:var(--road-green-deep)] hover:brightness-95"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <nav aria-label="Browse SoloStack" className="lg:col-span-6">
            <div className="panel p-3 sm:p-4">
              <ul className="divide-y divide-white/25">
                {lanes.map((lane, i) => (
                  <li key={lane.href} className="lane-in" style={{ ['--i' as any]: i }}>
                    <Link
                      href={lane.href}
                      className="lane group flex items-center justify-between gap-4 rounded-lg px-4 py-5 hover:bg-white/10 sm:px-6"
                    >
                      <span>
                        <span className="sign-type block text-2xl font-bold leading-tight sm:text-3xl">{lane.label}</span>
                        <span className="num mt-1 block text-sm text-white/75">{lane.note}</span>
                      </span>
                      <ArrowRight aria-hidden className="lane-arrow size-8 shrink-0 text-[color:var(--sign-yellow)] sm:size-10" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        {/* centre line */}
        <div
          aria-hidden
          className="h-2 w-full"
          style={{
            background:
              'repeating-linear-gradient(90deg, var(--sign-yellow) 0 56px, transparent 56px 96px)',
          }}
        />
      </section>

      {/* 2. LANES: the six categories, each pointing at its newest guide */}
      <section className="border-b border-[color:var(--road-rule)] py-16 sm:py-20">
        <div className={WRAP}>
          <h2 className="sign-type max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Start with the part of the business you are building
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((cat) => {
              const active = selectedCategory === cat.slug
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedCategory(active ? 'all' : cat.slug)
                      setSearchQuery('')
                      jumpToGuides()
                    }}
                    className={`lane group flex h-full w-full flex-col justify-between gap-6 rounded-xl border-2 p-6 text-left ${
                      active
                        ? 'border-[color:var(--road-green)] bg-[color:var(--road-green)] text-[color:var(--sign-white)]'
                        : 'border-[color:var(--road-green)] bg-[color:var(--sign-white)] hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)]'
                    }`}
                  >
                    <span className="flex items-start justify-between gap-4">
                      <span className="sign-type text-xl font-bold leading-snug">{cat.title}</span>
                      <span
                        className={`num sign-type grid size-10 shrink-0 place-items-center rounded-full text-base font-bold ${
                          active
                            ? 'bg-[color:var(--sign-yellow)] text-[color:var(--road-green-deep)]'
                            : 'bg-[color:var(--road-green)] text-[color:var(--sign-white)] group-hover:bg-[color:var(--sign-yellow)] group-hover:text-[color:var(--road-green-deep)]'
                        }`}
                      >
                        {cat.count}
                      </span>
                    </span>
                    {cat.latest ? (
                      <span className="block text-sm leading-snug opacity-80">
                        Newest: {cat.latest.title}
                      </span>
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* 3. THE STACK: a priced route through the one published stack blueprint */}
      {stack ? (
        <section className="bg-[color:var(--road-green-deep)] py-16 text-[color:var(--sign-white)] sm:py-24">
          <div className={`${WRAP} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <div className="lg:col-span-5">
              <h2 className="sign-type text-balance text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {stack.title}
              </h2>
              {stack.description ? (
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">{stack.description}</p>
              ) : null}
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {stack.monthlySoftwareCost ? (
                  <div>
                    <dt className="text-sm text-white/70">Software</dt>
                    <dd className="num sign-type text-3xl font-bold text-[color:var(--sign-yellow)]">
                      {stack.monthlySoftwareCost}
                    </dd>
                  </div>
                ) : null}
                {stack.businessModel ? (
                  <div>
                    <dt className="text-sm text-white/70">Built for</dt>
                    <dd className="sign-type text-3xl font-bold capitalize">{stack.businessModel}s</dd>
                  </div>
                ) : null}
              </dl>
              <Link
                href={`/stacks/${stack.slug}`}
                className="sign-type group mt-10 inline-flex items-center gap-3 rounded-xl bg-[color:var(--sign-yellow)] px-6 py-4 text-base font-bold text-[color:var(--road-green-deep)] hover:brightness-95"
              >
                Open the full stack
                <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="lg:col-span-7">
              <div className="panel p-3 sm:p-4">
                <ol className="divide-y divide-white/25">
                  {(stack.tools || [])
                    .filter((t: any) => typeof t === 'object')
                    .map((tool: any) => (
                      <li key={tool.id} className="flex items-center gap-4 px-3 py-4 sm:px-5">
                        <BrandMark slug={tool.slug} name={tool.name} />
                        <span className="min-w-0">
                          <Link href={`/tools/${tool.slug}`} className="sign-type text-lg font-bold hover:underline">
                            {tool.name}
                          </Link>
                          {tool.tagline ? (
                            <span className="mt-0.5 block text-sm leading-snug text-white/75">{tool.tagline}</span>
                          ) : null}
                        </span>
                        <span className="leader hidden sm:block" aria-hidden />
                        <span className="num sign-type ml-auto shrink-0 text-lg font-bold sm:ml-0">
                          {tool.startingPrice}
                        </span>
                      </li>
                    ))}
                  {(stack.hardware || [])
                    .filter((h: any) => typeof h === 'object')
                    .map((h: any) => (
                      <li key={`hw-${h.id}`} className="flex items-center gap-4 px-3 py-4 sm:px-5">
                        <BrandMark slug={(h.manufacturer || '').toLowerCase().replace(/\s+/g, '-')} name={h.name} />
                        <span className="min-w-0">
                          <span className="sign-type text-lg font-bold">{h.name}</span>
                          {h.manufacturer ? (
                            <span className="mt-0.5 block text-sm leading-snug text-white/75">{h.manufacturer}</span>
                          ) : null}
                        </span>
                        <span className="leader hidden sm:block" aria-hidden />
                        <span className="num sign-type ml-auto shrink-0 text-lg font-bold sm:ml-0">{h.priceRange}</span>
                      </li>
                    ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. GUIDES: newest first, filterable, with the lead guide given the room */}
      <section id="guides" className="scroll-mt-4 py-16 sm:py-24">
        <div className={WRAP}>
          <div className="flex flex-col justify-between gap-6 border-b-2 border-[color:var(--road-green)] pb-6 md:flex-row md:items-end">
            <h2 className="sign-type text-3xl font-bold tracking-tight sm:text-4xl">Latest guides</h2>
            <div className="on-light flex flex-wrap gap-2" role="group" aria-label="Filter guides by category">
              <button
                type="button"
                aria-pressed={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
                className={`sign-type rounded-full border-2 border-[color:var(--road-green)] px-4 py-1.5 text-sm font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-[color:var(--road-green)] text-[color:var(--sign-white)]'
                    : 'hover:bg-[color:var(--road-green)]/10'
                }`}
              >
                All <span className="num">{posts.length}</span>
              </button>
              {categoryStats.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={selectedCategory === cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`sign-type rounded-full border-2 border-[color:var(--road-green)] px-4 py-1.5 text-sm font-bold ${
                    selectedCategory === cat.slug
                      ? 'bg-[color:var(--road-green)] text-[color:var(--sign-white)]'
                      : 'hover:bg-[color:var(--road-green)]/10'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>

          {searchQuery ? (
            <p className="mt-4 text-sm text-[color:var(--road-muted)]" role="status">
              {matches.length} {matches.length === 1 ? 'guide matches' : 'guides match'} “{searchQuery}”
            </p>
          ) : null}

          {shown.length === 0 ? (
            <div className="mt-10 rounded-xl border-2 border-dashed border-[color:var(--road-green)] p-12 text-center">
              <p className="sign-type text-xl font-bold">No guides match that.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="sign-type mt-5 rounded-lg bg-[color:var(--road-green)] px-5 py-2.5 text-sm font-bold text-[color:var(--sign-white)]"
              >
                Show all guides
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-14">
              {lead ? (
                <article className="group lg:col-span-7">
                  <Link href={`/posts/${lead.slug}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--road-rule)]">
                      {getImageUrl(lead.heroImage || lead.meta?.image) ? (
                        <Image
                          src={getImageUrl(lead.heroImage || lead.meta?.image) as string}
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
                    <div className="mt-5 flex items-center gap-3 text-sm text-[color:var(--road-muted)]">
                      {postCategory(lead) ? (
                        <span className="sign-type rounded bg-[color:var(--road-green)] px-2.5 py-1 text-xs font-bold text-[color:var(--sign-white)]">
                          {postCategory(lead)!.title}
                        </span>
                      ) : null}
                      <time className="num" dateTime={lead.publishedAt}>
                        {formatDate(lead.publishedAt)}
                      </time>
                    </div>
                    <h3 className="sign-type mt-3 text-balance text-2xl font-bold leading-tight group-hover:underline sm:text-4xl">
                      {lead.title}
                    </h3>
                    {lead.meta?.description ? (
                      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[color:var(--road-muted)]">
                        {lead.meta.description}
                      </p>
                    ) : null}
                  </Link>
                </article>
              ) : null}

              <ul className="divide-y divide-[color:var(--road-rule)] border-y border-[color:var(--road-rule)] lg:col-span-5 lg:self-start">
                {rest.map((post) => (
                  <li key={post.id}>
                    <Link href={`/posts/${post.slug}`} className="lane group flex gap-4 py-5">
                      <span className="min-w-0 flex-1">
                        <span className="num block text-xs text-[color:var(--road-muted)]">
                          {postCategory(post)?.title}
                          {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ''}
                        </span>
                        <span className="sign-type mt-1 block text-lg font-bold leading-snug group-hover:underline">
                          {post.title}
                        </span>
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="lane-arrow mt-1 size-5 shrink-0 text-[color:var(--road-green)]"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <Link
              href="/posts"
              className="sign-type group inline-flex items-center gap-3 rounded-xl border-2 border-[color:var(--road-green)] px-6 py-3.5 text-base font-bold hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)]"
            >
              All {posts.length} guides
              <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DISTANCE BOARD: software by monthly price, gear by price range */}
      <section className="border-y border-[color:var(--road-rule)] bg-[color:var(--sign-white)] py-16 sm:py-24">
        <div className={`${WRAP} grid gap-14 lg:grid-cols-2 lg:gap-20`}>
          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="sign-type text-3xl font-bold tracking-tight sm:text-4xl">Software, priced</h2>
              <Link href="/tools" className="sign-type text-sm font-bold underline underline-offset-4">
                All tools
              </Link>
            </div>
            <ul className="mt-8 divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)]">
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link href={`/tools/${tool.slug}`} className="lane group flex items-center gap-4 py-4">
                    <BrandMark slug={tool.slug} name={tool.name} />
                    <span className="min-w-0 flex-1">
                      <span className="sign-type block text-lg font-bold group-hover:underline">{tool.name}</span>
                      {tool.tagline ? (
                        <span className="block text-sm leading-snug text-[color:var(--road-muted)]">{tool.tagline}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="num sign-type block text-lg font-bold">{tool.startingPrice || 'Free'}</span>
                      <span className="num block text-xs text-[color:var(--road-muted)]">
                        {tool.pricingType}
                        {tool.rating ? ` · ${tool.rating}/5` : ''}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4">
              <h2 className="sign-type text-3xl font-bold tracking-tight sm:text-4xl">Gear, picked</h2>
              <Link href="/best-gear" className="sign-type text-sm font-bold underline underline-offset-4">
                Best gear
              </Link>
            </div>
            <ul className="mt-8 divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)]">
              {hardware.map((item) => (
                <li key={item.id} className="py-5">
                  <div className="flex items-baseline gap-3">
                    <span className="sign-type text-lg font-bold">{item.name}</span>
                    <span className="leader" aria-hidden />
                    <span className="num sign-type shrink-0 text-lg font-bold">{item.priceRange}</span>
                  </div>
                  {item.verdict ? (
                    <p className="mt-1 text-sm leading-snug text-[color:var(--road-muted)]">{item.verdict}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            {gearCount > 0 ? (
              <Link
                href="/best-gear"
                className="panel lane group mt-6 flex items-center justify-between gap-4 px-7 py-6 hover:brightness-110"
              >
                <span>
                  <span className="sign-type block text-2xl font-bold">{gearCount} more gear picks</span>
                  <span className="block text-sm text-white/80">
                    Microphones, webcams, lights, desks, chairs and docks
                  </span>
                </span>
                <ArrowRight aria-hidden className="lane-arrow size-9 shrink-0 text-[color:var(--sign-yellow)]" />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* 6. DISCLOSURE: how the site is paid, plainly */}
      <section className="bg-[color:var(--sign-yellow)] py-12 text-[color:var(--road-green-deep)]">
        <div className={`${WRAP} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
          <p className="sign-type max-w-3xl text-balance text-xl font-bold leading-snug sm:text-2xl">
            Some links earn SoloStack a commission at no extra cost to you. It never changes what we list or the order we
            list it in.
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
    </main>
  )
}
