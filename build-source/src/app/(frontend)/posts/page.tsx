import type { Metadata } from 'next/types'
import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { PostsArchiveView } from '@/components/marketing/PostsArchiveView'
import { DisclosureBand, RoadHero } from '@/components/marketing/RoadChrome'
import { getGuides } from '@/utilities/getGuides'
import { TOPIC_META } from '@/utilities/topics'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const { guides, categories } = await getGuides()

  return (
    <div className="road">
      <RoadHero
        title="Guides for people who work on their own."
        intro="Practical guides on tech stacks, AI automation, hosting, marketing and operations for one-person businesses."
        facts={[
          { label: 'Guides', value: String(guides.length) },
          { label: 'Areas', value: String(categories.length) },
        ]}
        aside={
          <div className="panel p-3 sm:p-4">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {categories.map((c) => {
                const meta = TOPIC_META[c.slug]
                return (
                  <li key={c.slug}>
                    <Link href={`/posts/category/${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-[6px] bg-[color:var(--road-rule)]">
                      {meta ? (
                        <Image
                          src={`/api/media/file/${meta.image}.webp`}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 200px, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                          unoptimized
                        />
                      ) : null}
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2.5 pb-2 pt-8 text-white">
                        <span className="sign-type block text-sm font-bold leading-tight">{c.title}</span>
                        <span className="num block text-xs text-white/80">{c.count} {c.count === 1 ? 'guide' : 'guides'}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        }
      />
      <Suspense fallback={null}>
        <PostsArchiveView guides={guides} categories={categories} activeSlug="all" total={guides.length} />
      </Suspense>
      <DisclosureBand priceNote={false} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    alternates: { canonical: '/posts' },
    title: 'Articles & Field Manuals for Solo Operators | SoloStack',
    description:
      'Practical guides on tech stacks, AI automation, hosting, marketing and operations for one-person businesses.',
  }
}
