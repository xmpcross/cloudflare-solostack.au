import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'

export const WRAP = 'mx-auto w-full max-w-[1366px] px-4 sm:px-8'

/** Sea-green cover field that opens a directory page: title, intro and facts on the left, a plate on the right. */
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
    <section className="field-sea relative overflow-hidden">
      <div className={`${WRAP} grid gap-10 pb-16 pt-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:pb-24 lg:pt-16`}>
        <div className={aside ? 'lg:col-span-6' : 'lg:col-span-8'}>
          <h1 className="sign-type text-balance text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="muted mt-6 max-w-[36rem] text-lg leading-relaxed">{intro}</p>
          {facts?.length ? (
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-current/30 pt-6">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="cap muted">{f.label}</dt>
                  <dd className="num sign-type mt-1 text-3xl font-bold">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        {aside ? <div className="lg:col-span-6">{aside}</div> : null}
      </div>
    </section>
  )
}

export const PRICE_NOTE =
  'Prices are subject to change and may be out of date. Some prices are converted from other currencies, such as US dollars, to Australian dollars, so they may not be 100% accurate. Always confirm the final price with the seller before you buy.'

export function DisclosureBand({ text, priceNote = true }: { text?: string; priceNote?: boolean }) {
  return (
    <section className="field-coral py-12">
      <div className={`${WRAP} flex flex-col gap-5 md:flex-row md:items-center md:justify-between`}>
        <div className="max-w-3xl">
          <p className="sign-type text-balance text-xl font-bold leading-snug sm:text-2xl">
            {text ?? 'Some links on this page are affiliate links. SoloStack may earn a commission at no extra cost to you.'}
          </p>
          {priceNote ? (
            <p className="mt-4 border-t border-[color:var(--road-ink)]/30 pt-4 text-sm leading-relaxed">
              <strong>Price note:</strong> {PRICE_NOTE}
            </p>
          ) : null}
        </div>
        <Link href="/affiliate-disclosure" className="btn group shrink-0">
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
    <section className="field-salt2 py-16 sm:py-24">
      <div className={WRAP}>
        <h2 className="sign-type max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h2>
        <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
          {points.map((p) => (
            <div key={p.title} className="border-t border-[color:var(--road-rule)] pt-5">
              <h3 className="sign-type text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-[color:var(--road-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Sea-green opening field for text pages (legal, FAQs, contact): a tracked caption, the title, an intro and a meta line. */
export function PageHeader({
  kicker,
  title,
  intro,
  meta,
  children,
}: {
  kicker: string
  title: string
  intro?: string
  meta?: string
  children?: React.ReactNode
}) {
  return (
    <section className="field-sea">
      <div className={`${WRAP} pb-14 pt-12 lg:pb-20 lg:pt-16`}>
        <p className="cap muted">{kicker}</p>
        <h1 className="sign-type mt-3 max-w-4xl text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
        {intro ? <p className="muted mt-6 max-w-[40rem] text-lg leading-relaxed">{intro}</p> : null}
        {meta ? <p className="cap muted mt-6">{meta}</p> : null}
        {children}
      </div>
    </section>
  )
}
