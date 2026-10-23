import type { Metadata } from 'next/types'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { ArrowRight } from 'lucide-react'

import { PostsArchiveView } from '@/components/marketing/PostsArchiveView'
import { DisclosureBand, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
import { getGuides } from '@/utilities/getGuides'
import { TOPIC_META } from '@/utilities/topics'
import categoryIntros from '@/data/category-intros.json'

export const revalidate = 600

type Args = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const { categories } = await getGuides()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const { categories } = await getGuides()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return {}
  const text = TOPIC_META[slug]?.text ?? ''
  const description = `${text} ${cat.count} ${cat.count === 1 ? 'guide' : 'guides'} on ${cat.title.toLowerCase()} for one-person businesses.`.trim()
  return {
    alternates: { canonical: `/posts/category/${slug}` },
    title: `${cat.title} Guides for Solo Operators | SoloStack`,
    description,
    openGraph: { title: `${cat.title} | SoloStack`, description, url: `https://solostack.au/posts/category/${slug}`, type: 'website', images: [{ url: 'https://solostack.au/website-template-OG.webp', width: 1200, height: 630, alt: 'SoloStack' }] },
  }
}

export default async function CategoryPage({ params }: Args) {
  const { slug } = await params
  const { guides, categories } = await getGuides()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()

  const inCategory = guides.filter((g) => g.category?.slug === slug)
  const meta = TOPIC_META[slug]
  const newest = inCategory[0]
  const intro = (categoryIntros as Record<string, { heading: string; paragraphs: string[]; start: string[]; related: { href: string; label: string }[] }>)[slug]
  const startGuides = intro ? intro.start.map((sl) => guides.find((g) => g.slug === sl)).filter(Boolean) : []

  return (
    <div className="road">
      <RoadHero
        title={cat.title}
        intro={`${meta?.text ?? ''} Guides for one-person businesses, newest first.`.trim()}
        facts={[{ label: inCategory.length === 1 ? 'Guide' : 'Guides', value: String(inCategory.length) }]}
        aside={
          meta ? (
            <div className="panel overflow-hidden p-3 sm:p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-lg">
                <Image
                  src={`/api/media/file/${meta.image}.webp`}
                  alt={meta.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              {newest ? (
                <Link href={`/posts/${newest.slug}`} className="lane group flex items-end justify-between gap-6 px-2 pb-2 pt-5 sm:px-3">
                  <span>
                    <span className="block text-sm text-[color:var(--road-muted)]">Newest guide</span>
                    <span className="sign-type block text-xl font-bold leading-snug group-hover:underline sm:text-2xl">{newest.title}</span>
                  </span>
                  <ArrowRight aria-hidden className="lane-arrow size-8 shrink-0 text-[color:var(--road-green)]" />
                </Link>
              ) : null}
            </div>
          ) : undefined
        }
      />
      {intro && (
        <section className={`${WRAP} grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-7">
            <h2 className="sign-type text-balance text-3xl leading-tight sm:text-4xl">{intro.heading}</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed">
              {intro.paragraphs.map((t, i) => <p key={i}>{t}</p>)}
            </div>
          </div>
          <div className="space-y-8 lg:col-span-5">
            {startGuides.length > 0 && (
              <div>
                <h3 className="sign-type text-xl">Where to start</h3>
                <ol className="mt-4 list-decimal space-y-2 pl-6 text-base">
                  {startGuides.map((g: any) => (
                    <li key={g.slug}><Link href={`/posts/${g.slug}`} className="underline underline-offset-4 hover:opacity-80">{g.title}</Link></li>
                  ))}
                </ol>
              </div>
            )}
            <div>
              <h3 className="sign-type text-xl">Related tools and stacks</h3>
              <ul className="mt-4 list-disc space-y-2 pl-6 text-base">
                {intro.related.map((r) => (
                  <li key={r.href}><Link href={r.href} className="underline underline-offset-4 hover:opacity-80">{r.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
      <PostsArchiveView guides={inCategory} categories={categories} activeSlug={slug} total={guides.length} />
      <DisclosureBand priceNote={false} />
    </div>
  )
}
