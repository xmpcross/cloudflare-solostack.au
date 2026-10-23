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
const MAX_HOME_POSTS = 6

const WRAP = 'mx-auto w-full max-w-[1366px] px-4 sm:px-8'

const getImageUrl = (imageObj: any): string | null => {
  if (!imageObj) return null
  if (typeof imageObj === 'string') return imageObj
  return imageObj.url || imageObj.sizes?.medium?.url || imageObj.sizes?.thumbnail?.url || null
}

const postImage = (post: PostData) => getImageUrl(post.heroImage || post.meta?.image)

const postCategory = (post: PostData) => {
  const c = post.categories?.[0]
  return typeof c === 'object' && c ? { title: c.title as string, slug: c.slug as string } : null
}

const formatDate = (iso?: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Sum of the "A$xx/mo" starting prices of a stack's tools; null when any price does not parse, so the stored figure is used.
const monthlyTotal = (tools: any[] = []) => {
  let total = 0
  let n = 0
  for (const t of tools) {
    if (typeof t !== 'object' || !t) continue
    const m = /A\$([\d.,]+)\s*\/\s*mo/i.exec(t.startingPrice || '')
    if (!m) return null
    total += parseFloat(m[1].replace(/,/g, ''))
    n += 1
  }
  return n ? Math.round(total) : null
}

/**
 * A drawn eucalyptus sprig: a curved stem with paired leaves, in the manner of a botanical plate.
 * Authored in code (no stock art); positions are computed from the stem curve so every render is identical.
 */
function Sprig({
  className = '',
  stroke = 'var(--fg-ink)',
  leaf = 'var(--fg-leaf)',
  draw = false,
}: {
  className?: string
  stroke?: string
  leaf?: string
  draw?: boolean
}) {
  const P0 = [34, 318]
  const P1 = [30, 150]
  const P2 = [176, 22]
  const leaves = Array.from({ length: 10 }, (_, i) => {
    const t = (i + 1.2) / 11.4
    const u = 1 - t
    const x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0]
    const y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]
    const dx = 2 * u * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0])
    const dy = 2 * u * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1])
    const heading = (Math.atan2(dy, dx) * 180) / Math.PI
    const side = i % 2 === 0 ? 1 : -1
    return { x, y, rot: heading + side * 62, scale: 1.05 - t * 0.5, delay: 0.35 + t * 1.15 }
  })
  return (
    <svg viewBox="0 0 220 330" aria-hidden className={className} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        className={draw ? 'fg-stem' : undefined}
        d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`}
        stroke={stroke}
        strokeWidth="2"
      />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.rot.toFixed(1)}) scale(${l.scale.toFixed(2)})`}>
          <path
            className={draw ? 'fg-leaf' : undefined}
            style={draw ? ({ ['--d' as any]: `${l.delay.toFixed(2)}s` } as React.CSSProperties) : undefined}
            d="M0 0 C10 -15 38 -15 52 0 C38 15 10 15 0 0Z"
            fill={leaf}
            fillOpacity="0.9"
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path d="M3 0 L46 0" stroke={stroke} strokeWidth="1" opacity="0.55" />
        </g>
      ))}
    </svg>
  )
}

const GLYPHS: Record<string, string[]> = {
  mic: ['M9 3h6v8a3 3 0 0 1-6 0V3z', 'M5 11a7 7 0 0 0 14 0', 'M12 18v3', 'M9 21h6'],
  light: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2'],
  camera: ['M12 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z', 'M12 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z', 'M8 21h8M12 15v6'],
  monitor: ['M4.5 4h15A1.5 1.5 0 0 1 21 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5v-9A1.5 1.5 0 0 1 4.5 4z', 'M8 20h8M12 16v4'],
  mouse: ['M12 3a5 5 0 0 0-5 5v8a5 5 0 0 0 10 0V8a5 5 0 0 0-5-5z', 'M12 3v7'],
  stand: ['M5 8h14a1 1 0 0 1 1 1v2H4V9a1 1 0 0 1 1-1z', 'M8 11v9M16 11v9M5 20h14'],
  desk: ['M4 7h16v12H4z', 'M9 7V5h6v2'],
}

/** One drawn specimen mark per gear kind, so gear reads as a set rather than a mix of logos and initials. */
function GearGlyph({ name }: { name: string }) {
  const n = name.toLowerCase()
  const kind = /mic/.test(n)
    ? 'mic'
    : /light/.test(n)
      ? 'light'
      : /cam/.test(n)
        ? 'camera'
        : /monitor|display/.test(n)
          ? 'monitor'
          : /mouse/.test(n)
            ? 'mouse'
            : /stand/.test(n)
              ? 'stand'
              : 'desk'
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[color:var(--fg-salt)] text-[color:var(--fg-ink)] ring-1 ring-[color:var(--fg-rule)]">
      <svg viewBox="0 0 24 24" aria-hidden className="size-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[kind].map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    </span>
  )
}

export function HomePageClient({ categories, posts, stacks, tools, hardware, gearCount = 0 }: HomePageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const categoryStats = useMemo(
    () =>
      categories.map((cat) => {
        const inCat = posts.filter((p) =>
          p.categories?.some((c) => (typeof c === 'object' ? c.slug === cat.slug : c === cat.slug)),
        )
        return { ...cat, count: inCat.length }
      }),
    [categories, posts],
  )

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return posts.filter((post) => {
      const inCategory =
        selectedCategory === 'all' ||
        post.categories?.some((cat) => (typeof cat === 'object' ? cat.slug === selectedCategory : cat === selectedCategory))
      const inSearch = !q || post.title.toLowerCase().includes(q) || post.meta?.description?.toLowerCase().includes(q)
      return inCategory && inSearch
    })
  }, [posts, selectedCategory, searchQuery])

  const shown = matches.slice(0, MAX_HOME_POSTS)
  const lead = shown[0]
  const rest = shown.slice(1)
  const stack = stacks[0]
  const stackTools = (stack?.tools || []).filter((t: any) => typeof t === 'object')
  const stackTotal = monthlyTotal(stackTools)
  const stackCost = stackTotal ? `≈A$${stackTotal}/mo` : stack?.monthlySoftwareCost

  // Move focus to the guides so keyboard and screen-reader users land where the list changed.
  const jumpToGuides = () => {
    const el = document.getElementById('guides')
    if (!el) return
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
    el.focus({ preventScroll: true })
  }

  const services = [
    { title: 'Plain-answer guides', body: 'Each opens with the answer, then gives the detail and says who it is not for.', note: `${posts.length} guides`, href: '/posts' },
    { title: 'Stack blueprints', body: 'Whole setups, tool by tool and in buying order. Most start on free plans.', note: `${stacks.length} stacks`, href: '/stacks' },
    { title: 'A software directory', body: 'Free plan, starting price in Australian dollars, who it suits and where it falls short.', note: `${tools.length} tools priced`, href: '/tools' },
    { title: 'Gear picks and comparisons', body: 'Hardware for a desk that works, with side-by-side comparisons when two tools do the same job.', note: `${gearCount} gear picks`, href: '/best-gear' },
  ]

  return (
    <main className="fg min-h-screen">
      {/* COVER: the one stack in the guide, drawn as a specimen plate on Bass Strait sea-green */}
      <section className="fg-field-sea relative overflow-hidden">
        <Sprig
          draw
          stroke="var(--fg-sea-deep)"
          leaf="var(--fg-sea-deep)"
          className="pointer-events-none absolute -bottom-32 -left-16 hidden h-[22rem] w-auto opacity-70 lg:block"
        />
        <div className={`${WRAP} relative grid gap-12 pb-20 pt-12 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28 lg:pt-20`}>
          <div className="lg:col-span-6">
            <h1 className="fg-t-display">
              A field guide to the one‑person business.
            </h1>
            <p className="fg-muted fg-t-lede mt-7 max-w-[32rem]">
              Guides, gear picks, software reviews and a worked-out stack for people running a business on their own in
              Australia.
            </p>

            <form
              role="search"
              className="mt-9 max-w-[32rem]"
              onSubmit={(e) => {
                e.preventDefault()
                jumpToGuides()
              }}
            >
              <label htmlFor="home-search" className="sr-only">
                Search guides
              </label>
              <div className="fg-field-salt flex items-center rounded-full p-1.5 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-[color:var(--fg-coral)]">
                <Search aria-hidden className="fg-muted ml-4 size-5 shrink-0" />
                <input
                  id="home-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${posts.length} guides`}
                  className="w-full bg-transparent px-3 py-3 text-base placeholder:text-[color:var(--fg-muted)] focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="fg-muted mr-1 grid size-11 shrink-0 place-items-center rounded-full hover:bg-black/5"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
                <button type="submit" className="fg-btn !min-h-11 !px-6 !py-2.5 text-sm">
                  Search
                </button>
              </div>
            </form>

            {stack ? (
              <div className="mt-8">
                <Link href={`/stacks/${stack.slug}`} className="fg-btn group text-base">
                  Open the stack
                  <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ) : null}
          </div>

          {stack ? (
            <figure className="relative lg:col-span-6 lg:pl-6">
              <div className="fg-plate p-6 sm:p-9">
                <span className="fg-print pointer-events-none absolute -right-3 -top-7 w-[5.5rem] rotate-3 sm:-right-6 sm:-top-9 sm:w-[9.5rem]">
                  <Image
                    src="/art/field-print.webp"
                    alt=""
                    width={640}
                    height={640}
                    sizes="152px"
                    className="block h-auto w-full"
                    unoptimized
                  />
                </span>
                <h2 className="max-w-[15ch] pr-16 fg-t-subhead sm:pr-24">{stack.title}</h2>
                <p className="num fg-muted mt-3 text-base">
                  {stackCost ? (
                    <>
                      <strong className="fg-t-title text-[color:var(--fg-coral-text)]">{stackCost}</strong> for{' '}
                    </>
                  ) : null}
                  {stackTools.length} tools, bought in order
                </p>
                <ol className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[color:var(--fg-rule)] pt-7">
                  {stackTools.slice(0, 4).map((tool: any, i: number) => (
                    <li key={tool.id} className="fg-develop" style={{ ['--i' as any]: i }}>
                      <BrandMark slug={tool.slug} name={tool.name} className="size-[4.5rem]" />
                      <p className="fg-cap fg-muted mt-3">Fig. {i + 1}</p>
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="fg-t-title -my-2.5 mt-0 block py-2.5 hover:underline"
                      >
                        {tool.name}
                      </Link>
                      {tool.tagline ? <p className="fg-muted mt-1 line-clamp-2 fg-t-small">{tool.tagline}</p> : null}
                      <p className="num mt-1.5 text-base font-bold text-[color:var(--fg-coral-text)]">
                        {tool.startingPrice || 'Free'}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
              <figcaption className="fg-cap mt-4 text-[color:var(--fg-salt)] sm:pl-1">
                Plate 1. {stack.title}, {stackTools.length} tools, priced in Australian dollars.
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* FIELD NOTES: the guides, with photographs doing half the talking */}
      <section id="guides" tabIndex={-1} className="fg-field-salt scroll-mt-4 py-16 outline-none sm:py-24">
        <div className={WRAP}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="fg-t-headline">Field notes</h2>
            <div
              className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
              role="group"
              aria-label="Filter guides by category"
            >
              {[{ id: 'all', title: 'All', slug: 'all', count: posts.length }, ...categoryStats].map((cat) => {
                const on = selectedCategory === cat.slug
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`fg-chip min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-bold ring-2 ring-inset ring-[color:var(--fg-ink)] transition-colors ${
                      on ? 'bg-[color:var(--fg-ink)] text-[color:var(--fg-salt)]' : 'hover:bg-[color:var(--fg-salt-2)]'
                    }`}
                  >
                    {cat.title} <span className="num opacity-70">{cat.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {searchQuery ? (
            <p className="fg-muted mt-4 text-sm" role="status">
              {matches.length} {matches.length === 1 ? 'guide matches' : 'guides match'} “{searchQuery}”
            </p>
          ) : null}

          {shown.length === 0 ? (
            <div className="mt-12 rounded-md border-2 border-dashed border-[color:var(--fg-ink)] p-12 text-center">
              <p className="fg-t-title-lg">No guides match that.</p>
              <p className="fg-muted mt-2 text-sm">Try fewer words, or pick another category.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="fg-btn mt-6"
              >
                Show all guides
              </button>
            </div>
          ) : (
            <div key={selectedCategory} className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-14">
              {lead ? (
                <article className="fg-settle group lg:col-span-7" style={{ ['--i' as any]: 0 }}>
                  <Link href={`/posts/${lead.slug}`} className="block">
                    <div className="fg-plate fg-plate-photo">
                      <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--fg-salt-2)]">
                        {postImage(lead) ? (
                          <Image
                            src={postImage(lead) as string}
                            alt={lead.title}
                            fill
                            sizes="(min-width: 1024px) 760px, 100vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            unoptimized
                          />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <BookOpen className="fg-muted size-10" />
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-5 fg-t-subhead group-hover:underline">
                      {lead.title}
                    </h3>
                    {lead.meta?.description ? <p className="fg-muted mt-3 max-w-2xl">{lead.meta.description}</p> : null}
                    <p className="fg-cap fg-muted mt-4">
                      {postCategory(lead)?.title}
                      {lead.publishedAt ? ` · ${formatDate(lead.publishedAt)}` : ''}
                    </p>
                  </Link>
                </article>
              ) : null}

              <ul className="divide-y divide-[color:var(--fg-rule)] border-y border-[color:var(--fg-rule)] lg:col-span-5 lg:self-start">
                {rest.map((post, i) => (
                  <li key={post.id} className="fg-settle" style={{ ['--i' as any]: i + 1 }}>
                    <Link href={`/posts/${post.slug}`} className="fg-row group flex items-center gap-4 py-4">
                      <span className="relative block size-20 shrink-0 overflow-hidden rounded-sm bg-[color:var(--fg-salt-2)] sm:size-24">
                        {postImage(post) ? (
                          <Image src={postImage(post) as string} alt="" fill sizes="96px" className="object-cover" unoptimized />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="fg-t-title line-clamp-2 mb-[10px] group-hover:underline">
                          {post.title}
                        </span>
                        <span className="fg-cap fg-muted mt-1 block">
                          {postCategory(post)?.title}
                          {post.publishedAt ? ` · ${formatDate(post.publishedAt)}` : ''}
                        </span>
                      </span>
                      <ArrowRight aria-hidden className="fg-arrow size-5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12">
            <Link href="/posts" className="fg-btn fg-btn-line group">
              All {posts.length} guides
              <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* SOFTWARE: the specimens, priced. A quieter, denser passage on indigo */}
      <section className="fg-field-ink py-16 sm:py-24">
        <div className={`${WRAP} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="fg-t-headline">Software, priced</h2>
              <p className="fg-muted fg-t-lede mt-5 max-w-sm">
                Starting prices in Australian dollars, whether there is a free plan, and who each tool suits.
              </p>
              <Link href="/tools" className="fg-btn mt-8">
                All tools
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            </div>
          </div>
          <ol className="divide-y divide-white/15 border-y border-white/15 lg:col-span-8">
            {tools.map((tool, i) => (
              <li key={tool.id}>
                <Link href={`/tools/${tool.slug}`} className="fg-row group flex items-center gap-4 py-5 sm:gap-6">
                  <span className="fg-cap hidden w-12 shrink-0 text-white/70 sm:block">Fig. {i + 1}</span>
                  <BrandMark slug={tool.slug} name={tool.name} className="size-14 sm:size-16" />
                  <span className="min-w-0 flex-1">
                    <span className="fg-t-title-lg block group-hover:underline">
                      {tool.name}
                    </span>
                    {tool.tagline ? <span className="fg-muted mt-1 block fg-t-small">{tool.tagline}</span> : null}
                  </span>
                  <span className="max-w-[9rem] shrink-0 text-right [overflow-wrap:anywhere] sm:max-w-[13rem]">
                    <span className="fg-t-title-lg num block">{tool.startingPrice || 'Free'}</span>
                    <span className="num fg-muted block text-xs">
                      {tool.pricingType}
                      {tool.rating ? ` · ${tool.rating}/5` : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* GEAR: a two-column catalogue of drawn specimens, each with a verdict */}
      <section className="fg-field-salt2 py-16 sm:py-24">
        <div className={WRAP}>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
            <h2 className="fg-t-headline lg:col-span-5">Gear, picked</h2>
            <p className="fg-muted fg-t-lede max-w-xl lg:col-span-7">
              Microphones, webcams, lights, desks, chairs and docks for a desk that works, with prices from Australian and
              international retailers.
            </p>
          </div>
          <ol className="mt-12 grid gap-x-14 border-t-2 border-[color:var(--fg-ink)] lg:grid-cols-2">
            {hardware.map((item, i) => (
              <li key={item.id} className="flex items-start gap-4 border-b border-[color:var(--fg-rule)] py-6">
                <GearGlyph name={item.name} />
                <div className="min-w-0 flex-1">
                  <p className="fg-cap fg-muted">
                    Fig. {i + 1}
                    {item.manufacturer ? ` · ${item.manufacturer}` : ''}
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="fg-t-title">{item.name}</span>
                    <span className="fg-leader" aria-hidden />
                    <span className="fg-t-title num shrink-0 text-[color:var(--fg-coral-text)]">{item.priceRange}</span>
                  </div>
                  {item.verdict ? <p className="fg-muted mt-1.5 fg-t-small">{item.verdict}</p> : null}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/best-gear" className="fg-btn">
              {gearCount > 0 ? `All ${gearCount} gear picks` : 'Best gear'}
              <ArrowRight aria-hidden className="size-5" />
            </Link>
            <Link href="/comparisons" className="fg-link">
              Comparisons
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT THE BUSINESS AND THE SERVICE: the colophon, on a coral field */}
      <section className="fg-field-coral relative overflow-hidden py-20 sm:py-28">
        <Sprig
          stroke="var(--fg-coral-shade)"
          leaf="var(--fg-coral-shade)"
          className="pointer-events-none absolute -right-12 top-6 hidden h-[30rem] w-auto rotate-12 opacity-70 xl:block"
        />
        <div className={`${WRAP} relative`}>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <h2 className="fg-t-headline">Fewer tools, bought in the right order.</h2>
              <p className="fg-muted fg-t-lede mt-7 max-w-xl">
                SoloStack is an Australian guide for people who run a business on their own. We research software and gear
                for one person, price it in Australian dollars, and say what to buy first and what can wait.
              </p>
              <dl className="mt-9 grid max-w-xl grid-cols-1 gap-x-8 gap-y-5 fg-hair border-t pt-7 sm:grid-cols-2">
                <div>
                  <dt className="fg-cap opacity-80">Operated by</dt>
                  <dd className="fg-t-title mt-1">FXN Holdings</dd>
                </div>
                <div>
                  <dt className="fg-cap opacity-80">Based in</dt>
                  <dd className="fg-t-title mt-1">West Perth, Western Australia</dd>
                </div>
                <div>
                  <dt className="fg-cap opacity-80">How it is funded</dt>
                  <dd className="mt-1 leading-snug">
                    Reader-supported: some links earn us a commission. It never changes what we list or the order.
                  </dd>
                </div>
                <div>
                  <dt className="fg-cap opacity-80">Prices</dt>
                  <dd className="mt-1 leading-snug">
                    Australian dollars. Conversions are estimates, so confirm the price at checkout.
                  </dd>
                </div>
              </dl>
              <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2">
                <Link href="/about" className="fg-btn">
                  About SoloStack
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
                <Link href="/contact" className="fg-link">
                  Contact us
                </Link>
                <Link href="/faqs" className="fg-link">
                  How we choose
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <figure>
                <div className="fg-plate fg-plate-photo">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--fg-salt-2)]">
                    <Image
                      src="/art/studio-desk.webp"
                      alt="A tidy desk by a window with a laptop, a teal lamp and a boom-arm microphone against a coral wall"
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <figcaption className="fg-cap mt-3 opacity-90">A desk set up for one. Image generated with AI.</figcaption>
              </figure>

              <h3 className="mt-12 fg-t-title-lg">What you can use</h3>
              <ul className="mt-4 divide-y fg-divide fg-hair border-y">
                {services.map((s) => (
                  <li key={s.title}>
                    <Link href={s.href} className="fg-row group flex items-start gap-4 py-4">
                      <span className="min-w-0 flex-1">
                        <span className="fg-t-title block group-hover:underline">{s.title}</span>
                        <span className="mt-1 block fg-t-small opacity-90">{s.body}</span>
                      </span>
                      <span className="num fg-cap shrink-0 pt-1 opacity-90">{s.note}</span>
                      <ArrowRight aria-hidden className="fg-arrow mt-1 size-5 shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLOSURE: how the site is paid, plainly */}
      <section className="fg-field-salt py-14">
        <div className={`${WRAP} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
          <div className="max-w-3xl">
            <p className="fg-t-title-lg text-balance">
              Some links earn SoloStack a commission at no extra cost to you. It never changes what we list or the order we
              list it in.
            </p>
            <p className="fg-muted mt-4 border-t border-[color:var(--fg-rule)] pt-4 fg-t-small">
              <strong>Price note:</strong> Prices are subject to change and may be out of date. Some prices are converted from
              other currencies, such as US dollars, to Australian dollars, so they may not be 100% accurate. Always confirm
              the final price with the seller before you buy.
            </p>
          </div>
          <Link href="/affiliate-disclosure" className="fg-btn fg-btn-line group shrink-0">
            Affiliate disclosure
            <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  )
}
