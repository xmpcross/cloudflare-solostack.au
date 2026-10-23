import Link from 'next/link'
import React from 'react'

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
    <div className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-[1366px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">

        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">{intro}</p>
          <p className="mt-3 text-sm text-neutral-500">Last updated {BUSINESS.policiesUpdated}</p>
        </header>

        <aside
          aria-label="The short version"
          className="mt-10 max-w-3xl rounded-2xl border border-border bg-neutral-50 p-6 dark:bg-neutral-900/60"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">The short version</p>
          <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-neutral-700 dark:text-neutral-300">
            {summary.map((s) => (
              <li key={s} className="flex gap-3">
                <span aria-hidden="true" className="mt-2.5 size-1.5 flex-none rounded-full bg-emerald-600" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500">This summary is a guide. The full text below is what applies.</p>
        </aside>

        <div className="mt-12 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="On this page" className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">On this page</p>
            <ol className="mt-3 space-y-1 border-l border-border text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-neutral-600 transition-colors hover:border-emerald-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Other policies</p>
            <ul className="mt-3 space-y-1 text-sm">
              {others.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="block py-1 text-neutral-600 hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-white">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0">
                <h2 id={`${s.id}-h`} className="flex items-baseline gap-3 text-xl font-bold tracking-tight sm:text-2xl">
                  <span className="text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">{String(i + 1).padStart(2, '0')}</span>
                  {s.title}
                </h2>
                <div className="prose prose-neutral mt-4 max-w-none dark:prose-invert prose-p:leading-7 prose-li:my-1 prose-a:font-medium prose-a:text-emerald-700 dark:prose-a:text-emerald-400">
                  {s.body}
                </div>
              </section>
            ))}

            <section aria-label="Business details" className="mt-4 rounded-2xl border border-border p-6">
              <p className="text-sm font-semibold uppercase tracking-wider">Who to contact</p>
              <dl className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[8rem_1fr]">
                <dt className="text-neutral-500">Operator</dt>
                <dd>{BUSINESS.operator} (ABN {BUSINESS.abn})</dd>
                <dt className="text-neutral-500">Email</dt>
                <dd>
                  <a className="font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400" href={`mailto:${BUSINESS.email}`}>
                    {BUSINESS.email}
                  </a>
                </dd>
                <dt className="text-neutral-500">Post</dt>
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
