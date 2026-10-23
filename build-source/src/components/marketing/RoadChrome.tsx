import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'

export const WRAP = 'mx-auto w-full max-w-[1366px] px-4 sm:px-8'

/** Green gantry band that opens a directory page: title, intro and facts on the left, a feature on the right. */
export function RoadHero({
  title,
  intro,
  facts,
  aside,
}: {
  title: string
  intro: string
  facts?: { label: string; value: string }[]
  aside?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--road-tint)] text-[color:var(--road-ink)]">
      <div className={`${WRAP} grid gap-10 pb-16 pt-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-24 lg:pt-16`}>
        <div className={aside ? 'lg:col-span-6' : 'lg:col-span-8'}>
          <h1 className="sign-type text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-[color:var(--road-muted)]">{intro}</p>
          {facts?.length ? (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="text-sm text-[color:var(--road-muted)]">{f.label}</dt>
                  <dd className="num sign-type text-3xl font-bold text-[color:var(--road-green)]">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {aside ? <div className="lg:col-span-6">{aside}</div> : null}
      </div>
      <div
        aria-hidden
        className="h-2 w-full"
        style={{ background: 'repeating-linear-gradient(90deg, var(--sign-yellow) 0 56px, var(--road-green) 56px 96px)' }}
      />
    </section>
  )
}

export const PRICE_NOTE =
  'Prices are subject to change and may be out of date. Some prices are converted from other currencies, such as US dollars, to Australian dollars, so they may not be 100% accurate. Always confirm the final price with the seller before you buy.'

export function DisclosureBand({ text, priceNote = true }: { text?: string; priceNote?: boolean }) {
  return (
    <section className="bg-[color:var(--sign-yellow)] py-12 text-[color:var(--road-green-deep)]">
      <div className={`${WRAP} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
        <div className="max-w-3xl">
          <p className="sign-type text-balance text-xl font-bold leading-snug sm:text-2xl">
            {text ?? 'Some links on this page are affiliate links. SoloStack may earn a commission at no extra cost to you.'}
          </p>
          {priceNote ? (
            <p className="mt-4 border-t border-[color:var(--road-green-deep)]/30 pt-4 text-sm leading-relaxed">
              <strong>Price note:</strong> {PRICE_NOTE}
            </p>
          ) : null}
        </div>
        <Link
          href="/affiliate-disclosure"
          className="sign-type group inline-flex shrink-0 items-center gap-3 rounded-xl bg-[color:var(--road-green-deep)] px-6 py-3.5 text-base font-bold text-[color:var(--sign-white)] hover:brightness-125"
        >
          Affiliate disclosure
          <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  )
}

/** Numbered-less rule + title + body, used for the "how to choose" explainers. */
export function ExplainerGrid({ heading, points }: { heading: string; points: { title: string; body: string }[] }) {
  return (
    <section className="py-16 sm:py-24">
      <div className={WRAP}>
        <h2 className="sign-type max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
          {points.map((p) => (
            <div key={p.title} className="border-t-2 border-[color:var(--road-green)] pt-5">
              <h3 className="sign-type text-xl font-bold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
