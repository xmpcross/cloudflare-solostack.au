import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'
import { DisclosureBand, WRAP } from '@/components/marketing/RoadChrome'
import { BUILT_FOR, EXCHANGE_NOTE, PRICES_CHECKED, STACK_GUIDE } from '@/utilities/stackContent'

export const revalidate = 600

const SITE = 'https://solostack.au'
// Add the brand suffix only while the title stays within what search results display.
const fitTitle = (t: string) => (`${t} | SoloStack`.length <= 60 ? `${t} | SoloStack` : t)

type Args = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({ collection: 'stacks', limit: 1000, select: { slug: true } })
    return result.docs.map((doc) => ({ slug: doc.slug }))
  } catch (error) {
    console.warn('Database error in generateStaticParams /stacks/[slug]:', error)
    return []
  }
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug } = await paramsPromise
  const stack: any = await getStackBySlug(slug)
  if (!stack) return { title: 'Stack Not Found | SoloStack' }
  const cost = stack.monthlySoftwareCost ? ` Software about ${String(stack.monthlySoftwareCost).replace('≈', '')} a month.` : ''
  return {
    alternates: { canonical: `/stacks/${slug}` },
    title: fitTitle(`${stack.title}: Tools and Cost`),
    description: `${stack.description || `Tech stack blueprint for ${stack.title}.`}${cost}`.slice(0, 200),
  }
}

async function getStackBySlug(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({ collection: 'stacks', where: { slug: { equals: slug } }, depth: 2, limit: 1 })
    return result.docs[0] || null
  } catch (error) {
    console.warn('Database error in getStackBySlug:', error)
    return null
  }
}

const imageUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return img
  return img.url || img.sizes?.medium?.url || null
}

export default async function StackDetailPage({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise
  const stack: any = await getStackBySlug(slug)
  if (!stack) return notFound()

  const tools: any[] = (stack.tools || []).filter((t: any) => typeof t === 'object')
  const hardware: any[] = (stack.hardware || []).filter((h: any) => typeof h === 'object')
  const wf = stack.detailedWorkflow && typeof stack.detailedWorkflow === 'object' ? stack.detailedWorkflow : null
  let guide: any = null
  let others: any[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    if (STACK_GUIDE[slug]) {
      guide = (await payload.find({ collection: 'posts', draft: false, overrideAccess: true, depth: 0, limit: 1, where: { slug: { equals: STACK_GUIDE[slug] } }, select: { title: true, slug: true } })).docs[0]
    }
    others = (await payload.find({ collection: 'stacks', depth: 0, limit: 20, select: { title: true, slug: true, monthlySoftwareCost: true } })).docs.filter((s: any) => s.slug !== slug)
  } catch (error) {
    console.warn('Database error in /stacks/[slug] extras:', error)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: stack.title,
    description: stack.description || `Tech stack blueprint for ${stack.title}`,
    url: `${SITE}/stacks/${slug}`,
    itemListElement: [
      ...tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, url: `${SITE}/tools/${t.slug}` })),
      ...hardware.map((h, i) => ({ '@type': 'ListItem', position: tools.length + i + 1, name: h.name })),
    ],
  }

  const btn =
    'sign-type group inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-5 py-3 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110'

  return (
    <div className="road">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-[color:var(--road-tint)] text-[color:var(--road-ink)]">
        <div className={`${WRAP} pb-12 pt-10 lg:pb-16`}>
          <Link href="/stacks" className="inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline">
            <ArrowLeft aria-hidden className="size-4" /> All stack blueprints
          </Link>
          <p className="num mt-8 text-xs font-bold uppercase tracking-wide text-[color:var(--road-green)]">
            Built for · {BUILT_FOR[slug] || stack.businessModel}
          </p>
          <h1 className="sign-type mt-2 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{stack.title}</h1>
          {stack.description ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[color:var(--road-muted)]">{stack.description}</p> : null}
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {stack.monthlySoftwareCost ? (
              <div>
                <dt className="text-sm text-[color:var(--road-muted)]">Software a month</dt>
                <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{stack.monthlySoftwareCost}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-sm text-[color:var(--road-muted)]">Tools</dt>
              <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{tools.length}</dd>
            </div>
            {hardware.length ? (
              <div>
                <dt className="text-sm text-[color:var(--road-muted)]">Gear</dt>
                <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{hardware.length}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[color:var(--road-muted)]">
            {EXCHANGE_NOTE} Prices checked {PRICES_CHECKED}.
          </p>
        </div>
        <div
          aria-hidden
          className="h-2 w-full"
          style={{ background: 'repeating-linear-gradient(90deg, var(--sign-yellow) 0 56px, var(--road-green) 56px 96px)' }}
        />
      </section>

      {wf ? (
        <section className="py-16 sm:py-24">
          <div className={`${WRAP} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <div className="lg:col-span-4">
              <h2 className="sign-type text-balance text-3xl font-bold tracking-tight sm:text-4xl">How this stack works</h2>
              {wf.who ? (
                <p className="mt-5 leading-relaxed">
                  <strong>Who it is for.</strong> {wf.who}
                </p>
              ) : null}
            </div>
            <div className="grid gap-10 lg:col-span-8">
              {Array.isArray(wf.steps) && wf.steps.length ? (
                <div>
                  <h3 className="sign-type text-xl font-bold">How the pieces fit</h3>
                  <ol className="mt-4 grid gap-4">
                    {wf.steps.map((step: string, i: number) => (
                      <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 leading-relaxed">
                        <span className="num sign-type text-2xl font-bold text-[color:var(--road-green)]">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <div className="grid gap-8 md:grid-cols-2">
                {wf.buyFirst ? (
                  <div className="border-t-2 border-[color:var(--road-green)] pt-4">
                    <h3 className="sign-type text-lg font-bold">What to buy first</h3>
                    <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{wf.buyFirst}</p>
                  </div>
                ) : null}
                {wf.swaps ? (
                  <div className="border-t-2 border-[color:var(--road-green)] pt-4">
                    <h3 className="sign-type text-lg font-bold">Cheaper swaps</h3>
                    <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{wf.swaps}</p>
                  </div>
                ) : null}
              </div>
              {wf.australia ? (
                <div className="rounded-xl border-2 border-[color:var(--road-green)] p-6">
                  <h3 className="sign-type text-lg font-bold">Australian notes</h3>
                  <p className="mt-2 leading-relaxed">{wf.australia}</p>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-[color:var(--road-rule)] bg-[color:var(--sign-white)] py-16 sm:py-24">
        <div className={WRAP}>
          <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">Software, in order</h2>
          <ol className="divide-y divide-[color:var(--road-rule)]">
            {tools.map((tool, i) => (
              <li key={tool.id} className="grid gap-5 py-8 lg:grid-cols-12 lg:gap-8">
                <div className="flex items-start gap-5 lg:col-span-5">
                  <BrandMark slug={tool.slug} name={tool.name} className="size-16" />
                  <div className="min-w-0">
                    <span className="num text-xs text-[color:var(--road-muted)]">Step {i + 1}</span>
                    <h3 className="sign-type text-2xl font-bold">
                      <Link href={`/tools/${tool.slug}`} className="hover:underline">{tool.name}</Link>
                    </h3>
                    {tool.tagline ? <p className="mt-1 text-[color:var(--road-muted)]">{tool.tagline}</p> : null}
                  </div>
                </div>
                <div className="lg:col-span-4">
                  {tool.summary ? <p className="leading-relaxed">{tool.summary}</p> : null}
                  {tool.pros?.length ? (
                    <ul className="mt-3 grid gap-1.5 text-sm">
                      {tool.pros.slice(0, 2).map((p: any, j: number) => (
                        <li key={j} className="flex items-start gap-2">
                          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[color:var(--road-green)]" />
                          {p.pro}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="flex items-end justify-between gap-4 lg:col-span-3 lg:flex-col lg:items-end">
                  <div className="lg:text-right">
                    <span className="num sign-type block text-2xl font-bold">{tool.startingPrice || 'Free'}</span>
                    <span className="num block text-sm capitalize text-[color:var(--road-muted)]">{tool.pricingType}</span>
                  </div>
                  <a href={tool.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" className={btn}>
                    See pricing
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {hardware.length ? (
        <section className="py-16 sm:py-24">
          <div className={WRAP}>
            <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">Gear to buy</h2>
            <ul className="divide-y divide-[color:var(--road-rule)]">
              {hardware.map((item) => {
                const thumb = imageUrl(item.image)
                return (
                  <li key={item.id} className="grid gap-5 py-8 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:gap-8">
                    <span className="relative block size-24 overflow-hidden rounded-lg bg-[color:var(--road-rule)] ring-1 ring-black/10">
                      {thumb ? (
                        <Image src={thumb} alt={item.name} fill sizes="96px" className="object-cover" unoptimized />
                      ) : (
                        <span aria-hidden className="sign-type grid size-full place-items-center text-3xl font-bold text-[color:var(--road-green)]">
                          {(item.manufacturer || item.name || '?').slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <h3 className="sign-type text-xl font-bold">{item.name}</h3>
                      {item.verdict ? <p className="mt-1 max-w-2xl leading-relaxed text-[color:var(--road-muted)]">{item.verdict}</p> : null}
                    </div>
                    <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                      <span className="num sign-type text-2xl font-bold">{item.priceRange}</span>
                      <a href={item.retailUrl} target="_blank" rel="sponsored nofollow noopener" className={btn}>
                        View retail price
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="border-t border-[color:var(--road-rule)] py-16 sm:py-24">
        <div className={`${WRAP} grid gap-10 lg:grid-cols-12`}>
          {guide ? (
            <div className="lg:col-span-5">
              <h2 className="sign-type text-2xl font-bold">Read the guide</h2>
              <Link href={`/posts/${guide.slug}`} className="sign-type mt-4 inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4">
                {guide.title} <ArrowRight aria-hidden className="size-5" />
              </Link>
            </div>
          ) : null}
          {others.length ? (
            <div className={guide ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <h2 className="sign-type text-2xl font-bold">Other stack blueprints</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {others.map((s) => (
                  <li key={s.id}>
                    <Link href={`/stacks/${s.slug}`} className="flex items-baseline justify-between gap-4 border-b border-[color:var(--road-rule)] py-2 hover:underline">
                      <span className="font-bold">{s.title}</span>
                      <span className="num text-sm text-[color:var(--road-muted)]">{s.monthlySoftwareCost}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <DisclosureBand />
    </div>
  )
}
