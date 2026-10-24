import Link from 'next/link'
import React from 'react'

import { PageHeader, WRAP } from '@/components/marketing/RoadChrome'
import { BUSINESS, LEGAL_PAGES } from '@/utilities/business'

export type LegalSection = { id: string; title: string; body: React.ReactNode }

/**
 * One layout for every policy page: a short summary first, a sticky "On this page" list beside the text, numbered
 * sections, and the business details at the end. The words themselves live in each page file.
 */
export function LegalLayout({
  title,
  path,
  intro,
  summary,
  sections,
}: {
  title: string
  path: string
  intro: string
  summary: string[]
  sections: LegalSection[]
}) {
  const others = LEGAL_PAGES.filter((p) => p.href !== path)
  return (
    <div className="road">
      <PageHeader kicker="Legal" title={title} intro={intro} meta={`Last updated ${BUSINESS.policiesUpdated}`} />

      <div className={`${WRAP} pb-24 pt-12 sm:pt-16`}>
        <aside aria-label="The short version" className="panel max-w-3xl p-8 sm:p-10">
          <p className="cap">The short version</p>
          <ul className="mt-4 space-y-2 text-[0.95rem] leading-relaxed">
            {summary.map((s) => (
              <li key={s} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1.5 flex-none rounded-full bg-[color:var(--sign-yellow)]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[color:var(--road-muted)]">This summary is a guide. The full text below is what applies.</p>
        </aside>

        <div className="mt-14 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <p className="cap text-[color:var(--road-muted)]">On this page</p>
            <ol className="mt-3 space-y-1 border-l border-[color:var(--road-rule)] text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[color:var(--road-muted)] transition-colors hover:border-[color:var(--sign-yellow)] hover:text-[color:var(--road-ink)]"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="cap mt-8 text-[color:var(--road-muted)]">Other policies</p>
            <ul className="mt-3 space-y-1 text-sm">
              {others.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="block py-1 text-[color:var(--road-muted)] underline-offset-4 hover:text-[color:var(--road-ink)] hover:underline">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-t border-[color:var(--road-rule)] py-8 first:border-t-0 first:pt-0">
                <h2 id={`${s.id}-h`} className="sign-type flex items-baseline gap-3 text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="num cap text-[color:var(--road-muted)]">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className="prose prose-neutral mt-4 max-w-none prose-p:leading-7 prose-li:my-1 prose-a:font-semibold prose-a:text-[color:var(--road-ink)] prose-a:underline-offset-4">
                  {s.body}
                </div>
              </section>
            ))}

            <section aria-label="Business details" className="panel mt-4 p-8">
              <p className="cap">Who to contact</p>
              <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
                <dt className="cap text-[color:var(--road-muted)]">Operator</dt>
                <dd>{BUSINESS.operator} (ABN {BUSINESS.abn})</dd>
                <dt className="cap text-[color:var(--road-muted)]">Email</dt>
                <dd>
                  <a className="font-semibold underline underline-offset-4" href={`mailto:${BUSINESS.email}`}>
                    {BUSINESS.email}
                  </a>
                </dd>
                <dt className="cap text-[color:var(--road-muted)]">Post</dt>
                <dd>{BUSINESS.address}</dd>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The metadata every policy page shares. */
export const legalMetadata = (title: string, description: string, path: string) => ({
  title: `${title} | SoloStack`,
  description,
  openGraph: { title: `${title} | SoloStack`, description, type: 'website' as const, url: `https://solostack.au${path}`, images: [{ url: 'https://solostack.au/website-template-OG.webp', width: 1200, height: 630, alt: 'SoloStack' }] },
  alternates: { canonical: `https://solostack.au${path}` },
})
