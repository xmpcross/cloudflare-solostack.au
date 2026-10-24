import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'
import { DisclosureBand, ExplainerGrid, RoadHero, WRAP } from '@/components/marketing/RoadChrome'
import { formatDay, mediaUrl } from '@/utilities/gearOffers'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/tools' },
    title: 'Software Directory for Solo Operators | SoloStack',
    description:
      'Explore top-rated B2B software, automation tools, and productivity SaaS for 1-person businesses.',
  }
}

const POINTS = [
  {
    title: 'Start with the job, not the category',
    body: 'Decide which task is costing you the most hours, such as invoicing, editing, scheduling or email, and look for the tool that removes that task. A smaller stack that you use every week beats a large one you do not.',
  },
  {
    title: 'Check pricing at your real scale',
    body: 'Most tools price by seat, contact count or usage. Each listing shows a starting price, so compare what you will pay at your current size and again if the business doubles.',
  },
  {
    title: 'Prefer tools that connect',
    body: 'Look for native integrations or a solid automation connector. Moving data by hand between tools is the hidden cost that grows fastest as a solo business takes on more clients.',
  },
  {
    title: 'Keep an exit route',
    body: 'Choose products that let you export your data in a standard format, so changing tools later does not mean rebuilding your records from scratch.',
  },
]

// "$15/mo" -> 15, so the cheapest starting price can be shown from the real listings.
const monthly = (s?: string) => {
  const m = /\$\s?(\d+(?:\.\d+)?)\s*\/\s*mo/i.exec(s || '')
  return m ? Number(m[1]) : null
}

export default async function ToolsDirectoryPage() {
  let tools: any[] = []
  let guides: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({ collection: 'tools', depth: 1, limit: 100 })
    tools = result.docs
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 8,
      depth: 1,
      overrideAccess: true,
      sort: '-publishedAt',
      where: { 'categories.slug': { in: ['ai-automation', 'creator-media-lab'] } },
      select: { title: true, slug: true, publishedAt: true, heroImage: true, meta: true, categories: true },
    })
    guides = posts.docs
  } catch (error) {
    console.warn('Database connection error in /tools:', error)
  }

  const prices = tools.map((t) => monthly(t.startingPrice)).filter((n): n is number => n !== null)
  const cheapest = prices.length ? Math.min(...prices) : null
  // lead with the guide that shows software at work when there is one
  const featured = guides.find((g) => /editing|zero-code/.test(g.slug)) ?? guides[0]
  const featuredImg = mediaUrl(featured?.heroImage || featured?.meta?.image)
  const moreGuides = guides.filter((g) => g !== featured).slice(0, 4)

  return (
    <div className="road">
      <RoadHero
        title="Software for a business of one."
        intro="A solo operator pays for every tool twice: once in the subscription and again in the time it takes to learn and maintain it. The tools here are listed because they suit small teams and solo founders, not enterprise rollouts."
        facts={[
          { label: 'Tools listed', value: String(tools.length) },
          ...(cheapest !== null ? [{ label: 'Cheapest from', value: `A$${cheapest}/mo` }] : []),
        ]}
        aside={
          featured && featuredImg ? (
            <Link href={`/posts/${featured.slug}`} className="panel group block overflow-hidden p-3 sm:p-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[6px]">
                <Image
                  src={featuredImg}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  unoptimized
                />
              </div>
              <div className="flex items-end justify-between gap-6 px-2 pb-2 pt-5 sm:px-3">
                <span className="sign-type text-xl font-bold leading-snug sm:text-2xl">{featured.title}</span>
                <ArrowRight aria-hidden className="size-8 shrink-0 text-[color:var(--road-green)]" />
              </div>
            </Link>
          ) : null
        }
      />

      {/* TOOLS: logo, what it does, what is good and not, what it costs */}
      <section className="py-16 sm:py-24">
        <div className={WRAP}>
          {tools.length > 0 ? (
            <ol className="divide-y divide-[color:var(--road-rule)] border-y-2 border-[color:var(--road-green)]">
              {tools.map((tool) => (
                <li key={tool.id} className="grid gap-6 py-10 lg:grid-cols-12 lg:gap-10">
                  <div className="flex items-start gap-5 lg:col-span-5">
                    <BrandMark slug={tool.slug} name={tool.name} className="size-20 sm:size-24" />
                    <div className="min-w-0">
                      <h2 className="sign-type text-2xl font-bold sm:text-3xl">
                        <Link href={`/tools/${tool.slug}`} className="hover:underline">
                          {tool.name}
                        </Link>
                      </h2>
                      {tool.tagline ? (
                        <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{tool.tagline}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="lg:col-span-4">
                    {tool.summary ? <p className="leading-relaxed">{tool.summary}</p> : null}
                    <ul className="mt-4 grid gap-1.5 text-sm">
                      {(tool.pros || []).slice(0, 2).map((p: any, i: number) => (
                        <li key={`p${i}`} className="flex items-start gap-2">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[color:var(--road-green)]" />
                          {p.pro}
                        </li>
                      ))}
                      {(tool.cons || []).slice(0, 1).map((c: any, i: number) => (
                        <li key={`c${i}`} className="flex items-start gap-2 text-[color:var(--road-muted)]">
                          <Minus aria-hidden className="mt-0.5 size-4 shrink-0" />
                          {c.con}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-end justify-between gap-4 lg:col-span-3 lg:flex-col lg:items-end lg:justify-between">
                    <div className="lg:text-right">
                      <span className="num sign-type block text-3xl font-bold">{tool.startingPrice || 'Free'}</span>
                      <span className="num block text-sm capitalize text-[color:var(--road-muted)]">
                        {tool.pricingType}
                        {tool.rating ? ` · ${tool.rating}/5` : ''}
                      </span>
                    </div>
                    <Link
                      href={`/tools/${tool.slug}`}
                      className="btn group "
                    >
                      Read the specs
                      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border-2 border-dashed border-[color:var(--road-green)] p-12 text-center">
              No tools listed yet.
            </p>
          )}
        </div>
      </section>

      {/* GUIDES: the pieces that show these tools in use */}
      {moreGuides.length > 0 ? (
        <section className="border-y border-[color:var(--road-rule)] bg-[color:var(--sign-white)] py-16 sm:py-24">
          <div className={WRAP}>
            <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              See them in use
            </h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {moreGuides.map((post) => {
                const img = mediaUrl(post.heroImage || post.meta?.image)
                return (
                  <li key={post.id}>
                    <Link href={`/posts/${post.slug}`} className="group block">
                      <span className="relative block aspect-[3/2] overflow-hidden rounded-[6px] bg-[color:var(--road-rule)]">
                        {img ? (
                          <Image
                            src={img}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 320px, 50vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                            unoptimized
                          />
                        ) : null}
                      </span>
                      <span className="num mt-4 block text-xs text-[color:var(--road-muted)]">
                        {formatDay(post.publishedAt)}
                      </span>
                      <span className="sign-type mt-1 block text-lg font-bold leading-snug group-hover:underline">
                        {post.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <ExplainerGrid heading="How to choose software for a one-person business" points={POINTS} />
      <DisclosureBand />
    </div>
  )
}
