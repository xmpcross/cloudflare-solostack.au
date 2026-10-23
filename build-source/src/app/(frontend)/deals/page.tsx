import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { BrandMark } from '@/components/marketing/BrandMark'
import dealsData from '@/data/deals.json'
import { DisclosureBand, ExplainerGrid, RoadHero, WRAP } from '@/components/marketing/RoadChrome'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/deals' },
    title: 'Deals: Free Plans and Low-Cost Tools for Solo Businesses | SoloStack',
    description:
      'Software with a free plan or a low starting price for one-person businesses, and where to find hardware prices. Only offers we can check are listed.',
  }
}

const POINTS = [
  {
    title: 'Start on the free plan',
    body: 'Most tools here have a free plan or trial. Run your real work through it for a couple of weeks before paying, so you upgrade for a feature you actually missed.',
  },
  {
    title: 'Check annual against monthly',
    body: 'Annual billing is usually cheaper per month, but it locks in the money. Pay monthly until you are sure the tool stays in your stack, then switch.',
  },
  {
    title: 'Price the plan you will need',
    body: 'A low starting price often covers one seat and a basic feature set. Check the plan that includes what you need before you compare tools on price.',
  },
  {
    title: 'We only list what we can check',
    body: 'Makers change plans and prices without notice. We do not publish coupon codes or discounts we cannot confirm, so confirm the final price on the maker’s site.',
  },
]

type Offer = { title: string; code: string | null; description: string | null; endsAt: string | null; url: string }
type Group = { store: string; blurb: string; offers: Offer[] }
const today = new Date().toISOString().slice(0, 10)
// Offers come from scripts/sync-deals.py (the FXN Affiliate Hub); anything past its end date is dropped when the page is built.
const groups: Group[] = (dealsData.groups as Group[])
  .map((g) => ({ ...g, offers: g.offers.filter((o) => !o.endsAt || o.endsAt >= today) }))
  .filter((g) => g.offers.length > 0)
const fmtDate = (d: string) => new Date(d + 'T00:00:00Z').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

const price = (s?: string) => {
  const m = /\$\s?(\d+(?:\.\d+)?)/.exec(s || '')
  return m ? Number(m[1]) : Infinity
}

export default async function DealsPage() {
  let tools: any[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    tools = (await payload.find({ collection: 'tools', depth: 1, limit: 100 })).docs
  } catch (error) {
    console.warn('Database connection error in /deals:', error)
  }
  const free = tools.filter((t) => ['free', 'freemium'].includes(t.pricingType))
  const rest = tools.filter((t) => !free.includes(t)).sort((a, b) => price(a.startingPrice) - price(b.startingPrice))

  const row = (tool: any) => (
    <li key={tool.id} className="grid gap-4 py-8 sm:grid-cols-12 sm:items-center sm:gap-8">
      <div className="flex items-start gap-5 sm:col-span-6">
        <BrandMark slug={tool.slug} name={tool.name} className="size-16 sm:size-20" />
        <div className="min-w-0">
          <h3 className="sign-type text-xl font-bold sm:text-2xl">
            <Link href={`/tools/${tool.slug}`} className="hover:underline">
              {tool.name}
            </Link>
          </h3>
          {tool.tagline ? <p className="mt-1 leading-relaxed text-[color:var(--road-muted)]">{tool.tagline}</p> : null}
        </div>
      </div>
      <div className="sm:col-span-3">
        <span className="num sign-type block text-2xl font-bold">
          {['free', 'freemium'].includes(tool.pricingType) ? 'Free plan' : tool.startingPrice || 'See pricing'}
        </span>
        <span className="num block text-sm text-[color:var(--road-muted)]">
          {['free', 'freemium'].includes(tool.pricingType) && tool.startingPrice ? `Paid from ${tool.startingPrice}` : tool.pricingType}
        </span>
      </div>
      <div className="sm:col-span-3 sm:text-right">
        <Link
          href={`/tools/${tool.slug}`}
          className="sign-type group inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-5 py-3 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110"
        >
          See the details
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </li>
  )

  return (
    <div className="road">
      <RoadHero
        title="Deals for a business of one."
        intro="Coupons and codes, plus software you can start for free or at a low monthly price. We list an offer only when the store or maker publishes it, and we never invent a discount."
        facts={[
          { label: 'Coupons and codes', value: String(groups.reduce((n, g) => n + g.offers.length, 0)) },
          { label: 'With a free plan', value: String(free.length) },
          { label: 'Tools listed', value: String(tools.length) },
        ]}
      />

      {groups.length > 0 ? (
        <section className="pt-16 sm:pt-24">
          <div className={WRAP}>
            <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Coupons and codes
            </h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.store} className="panel p-6">
                  <h3 className="sign-type text-xl font-bold">{g.store}</h3>
                  <p className="mt-1 text-sm text-[color:var(--road-muted)]">{g.blurb}</p>
                  <ul className="mt-5 grid gap-5">
                    {g.offers.map((o, i) => (
                      <li key={i} className="border-t border-[color:var(--road-rule)] pt-5">
                        <p className="font-bold leading-snug">{o.title}</p>
                        {o.description && o.description !== o.title ? <p className="mt-1 text-sm leading-relaxed">{o.description}</p> : null}
                        <p className="num mt-3 text-sm">
                          {o.code ? (
                            <>
                              Code <code className="rounded bg-[color:var(--road-rule)] px-2 py-0.5 font-bold">{o.code}</code>
                            </>
                          ) : (
                            'No code needed'
                          )}
                          {o.endsAt ? <span className="text-[color:var(--road-muted)]"> · ends {fmtDate(o.endsAt)}</span> : null}
                        </p>
                        <a
                          href={o.url}
                          target="_blank"
                          rel="sponsored nofollow noopener"
                          className="sign-type group mt-4 inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-5 py-3 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110"
                        >
                          Get this deal
                          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-[color:var(--road-muted)]">
              These are affiliate links: we may earn a commission if you buy, at no extra cost to you. Offers change often, so confirm the final price at checkout.
            </p>
          </div>
        </section>
      ) : null}

      <section className="py-16 sm:py-24">
        <div className={WRAP}>
          <h2 className="sign-type border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Free plans to start on
          </h2>
          {free.length > 0 ? (
            <ul className="divide-y divide-[color:var(--road-rule)]">{free.map(row)}</ul>
          ) : (
            <p className="mt-8">No free plans listed yet.</p>
          )}

          {rest.length > 0 ? (
            <>
              <h2 className="sign-type mt-16 border-b-2 border-[color:var(--road-green)] pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Lowest starting prices
              </h2>
              <ul className="divide-y divide-[color:var(--road-rule)]">{rest.map(row)}</ul>
            </>
          ) : null}

          <div className="mt-16 rounded-xl border-2 border-[color:var(--road-green)] p-6 sm:p-8">
            <p className="flex items-start gap-3 leading-relaxed">
              <Check aria-hidden className="mt-1 size-5 shrink-0 text-[color:var(--road-green)]" />
              Looking for hardware such as microphones, cameras and desk gear? Compare it with the stores that stock it on{' '}
              <Link href="/best-gear" className="font-bold underline">
                Best Gear
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <ExplainerGrid heading="How to get more for your money" points={POINTS} />
      <DisclosureBand />
    </div>
  )
}
