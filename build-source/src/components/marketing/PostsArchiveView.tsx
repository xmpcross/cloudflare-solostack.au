'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search, X } from 'lucide-react'

import { WRAP } from '@/components/marketing/RoadChrome'

export type ArchiveGuide = {
  id: string | number
  title: string
  slug: string
  description?: string
  image?: string | null
  category?: { title: string; slug: string } | null
  publishedAt?: string | null
}

export type ArchiveCategory = { title: string; slug: string; count: number }

const PAGE_SIZE = 12

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

/** Filterable guide archive used by /posts and every category page. Category chips are real links to the category pages. */
export function PostsArchiveView({
  guides,
  categories,
  activeSlug,
  total,
}: {
  guides: ArchiveGuide[]
  categories: ArchiveCategory[]
  activeSlug: string
  total: number
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Old links used /posts/category/<slug>; send them to the category page.
  useEffect(() => {
    if (activeSlug !== 'all') return
    const slug = new URLSearchParams(window.location.search).get('category')
    if (slug && categories.some((c) => c.slug === slug)) window.location.replace(`/posts/category/${slug}`)
  }, [activeSlug, categories])

  useEffect(() => setVisible(PAGE_SIZE), [query, sort])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const found = guides.filter(
      (g) => !q || g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q),
    )
    const time = (g: ArchiveGuide) => (g.publishedAt ? new Date(g.publishedAt).getTime() : 0)
    return [...found].sort((a, b) =>
      sort === 'title' ? a.title.localeCompare(b.title) : sort === 'oldest' ? time(a) - time(b) : time(b) - time(a),
    )
  }, [guides, query, sort])

  const showLead = !query.trim() && sort === 'newest' && list.length > 3
  const lead = showLead ? list[0] : null
  const rest = (showLead ? list.slice(1) : list).slice(0, visible)
  const remaining = list.length - (showLead ? 1 : 0) - rest.length

  const chip = (active: boolean) =>
    `sign-type inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[color:var(--road-green)] px-4 py-1.5 text-sm font-bold ${
      active ? 'bg-[color:var(--road-green)] text-[color:var(--sign-white)]' : 'hover:bg-[color:var(--road-green)]/10'
    }`

  return (
    <section className="py-12 sm:py-16">
      <div className={WRAP}>
        <div className="flex flex-col gap-5 border-b-2 border-[color:var(--road-green)] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Guide categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:flex-wrap lg:overflow-visible">
            <Link href="/posts" aria-current={activeSlug === 'all' ? 'page' : undefined} className={chip(activeSlug === 'all')}>
              All <span className="num">{total}</span>
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/posts/category/${c.slug}`}
                aria-current={activeSlug === c.slug ? 'page' : undefined}
                className={chip(activeSlug === c.slug)}
              >
                {c.title} <span className="num opacity-75">{c.count}</span>
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <label className="relative">
              <span className="sr-only">Search guides</span>
              <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--road-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guides"
                className="h-11 w-56 rounded-[6px] border border-[color:var(--road-ink)] bg-[color:var(--sign-white)] pl-9 pr-9 text-sm placeholder:text-[color:var(--road-muted)]"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg hover:bg-black/5"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </label>
            <label>
              <span className="sr-only">Sort guides</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-11 cursor-pointer rounded-[6px] border border-[color:var(--road-ink)] bg-[color:var(--sign-white)] px-3 text-sm font-semibold"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A to Z</option>
              </select>
            </label>
          </div>
        </div>

        <p className="num mt-5 text-sm text-[color:var(--road-muted)]" role="status">
          {list.length} {list.length === 1 ? 'guide' : 'guides'}
          {query.trim() ? ` matching “${query.trim()}”` : ''}
        </p>

        {list.length === 0 ? (
          <div className="mt-8 rounded-xl border-2 border-dashed border-[color:var(--road-green)] p-12 text-center">
            <p className="sign-type text-xl font-bold">No guides match that.</p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="sign-type mt-5 rounded-lg bg-[color:var(--road-green)] px-5 py-2.5 text-sm font-bold text-[color:var(--sign-white)]"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            {lead ? (
              <article className="group mt-8 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
                <Link href={`/posts/${lead.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-[6px] bg-[color:var(--road-rule)] lg:col-span-7">
                  {lead.image ? (
                    <Image
                      src={lead.image}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 760px, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      unoptimized
                    />
                  ) : null}
                </Link>
                <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 text-sm text-[color:var(--road-muted)]">
                    {lead.category ? (
                      <Link
                        href={`/posts/category/${lead.category.slug}`}
                        className="sign-type rounded bg-[color:var(--road-green)] px-2.5 py-1 text-xs font-bold text-[color:var(--sign-white)]"
                      >
                        {lead.category.title}
                      </Link>
                    ) : null}
                    <time className="num" dateTime={lead.publishedAt ?? undefined}>
                      {formatDate(lead.publishedAt)}
                    </time>
                  </div>
                  <h2 className="sign-type mt-3 text-balance text-3xl font-bold leading-tight sm:text-4xl">
                    <Link href={`/posts/${lead.slug}`} className="hover:underline">
                      {lead.title}
                    </Link>
                  </h2>
                  {lead.description ? (
                    <p className="mt-4 leading-relaxed text-[color:var(--road-muted)]">{lead.description}</p>
                  ) : null}
                  <Link
                    href={`/posts/${lead.slug}`}
                    className="sign-type group/link mt-6 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
                  >
                    Read the guide
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </article>
            ) : null}

            <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((g) => (
                <li key={g.id}>
                  <article className="group">
                    <Link href={`/posts/${g.slug}`} className="relative block aspect-[3/2] overflow-hidden rounded-[6px] bg-[color:var(--road-rule)]">
                      {g.image ? (
                        <Image
                          src={g.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          unoptimized
                        />
                      ) : null}
                    </Link>
                    <p className="num mt-4 text-xs text-[color:var(--road-muted)]">
                      {g.category?.title}
                      {g.publishedAt ? ` · ${formatDate(g.publishedAt)}` : ''}
                    </p>
                    <h3 className="sign-type mt-1.5 text-xl font-bold leading-snug">
                      <Link href={`/posts/${g.slug}`} className="hover:underline">
                        {g.title}
                      </Link>
                    </h3>
                    {g.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[color:var(--road-muted)]">{g.description}</p>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>

            {remaining > 0 ? (
              <div className="mt-12 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((n) => n + PAGE_SIZE)}
                  className="sign-type rounded-[6px] border border-[color:var(--road-ink)] px-6 py-3 text-base font-bold hover:bg-[color:var(--road-green)] hover:text-[color:var(--sign-white)]"
                >
                  Show {Math.min(PAGE_SIZE, remaining)} more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
