'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'

export type RelatedSlide = Pick<Post, 'id' | 'slug' | 'title' | 'heroImage' | 'meta' | 'categories' | 'publishedAt'>

const AUTO_SLIDE_MS = 4500

export const RelatedPostsSlider: React.FC<{ posts: RelatedSlide[] }> = ({ posts }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  const step = useCallback(() => {
    const track = trackRef.current
    const first = track?.firstElementChild as HTMLElement | null
    if (!track || !first) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0
    return first.offsetWidth + gap
  }, [])

  const slide = useCallback(
    (direction: 1 | -1) => {
      const track = trackRef.current
      if (!track) return
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4
      if (direction === 1 && atEnd) {
        track.scrollTo({ left: 0, behavior: 'smooth' })
      } else if (direction === -1 && track.scrollLeft <= 4) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' })
      } else {
        track.scrollBy({ left: direction * step(), behavior: 'smooth' })
      }
    },
    [step],
  )

  useEffect(() => {
    if (paused || posts.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => slide(1), AUTO_SLIDE_MS)
    return () => clearInterval(timer)
  }, [paused, posts.length, slide])

  if (posts.length === 0) return null

  return (
    <section
      aria-label="Related posts"
      className="container mt-16 pt-10 border-t border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Related posts</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="Previous posts"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-white dark:bg-card hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="Next posts"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-white dark:bg-card hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => {
          const image =
            post.heroImage && typeof post.heroImage === 'object'
              ? post.heroImage
              : post.meta?.image && typeof post.meta.image === 'object'
                ? post.meta.image
                : null
          const category =
            post.categories && typeof post.categories[0] === 'object' ? post.categories[0].title : null
          const date = post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-AU', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : null

          return (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              className="group snap-start shrink-0 basis-full sm:basis-[calc((100%-1.5rem)/2)] lg:basis-[calc((100%-4.5rem)/4)] min-w-0"
            >
              <div className="aspect-16/9 overflow-hidden rounded-[8px] border border-border bg-neutral-100 dark:bg-neutral-800">
                {image && (
                  <Media
                    resource={image}
                    size="33vw"
                    className="size-full"
                    imgClassName="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              {category && (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {category}
                </p>
              )}
              <h3 className="mt-1 text-base font-semibold leading-snug text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
              {date && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{date}</p>}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
