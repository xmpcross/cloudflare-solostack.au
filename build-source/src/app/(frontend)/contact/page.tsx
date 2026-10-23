import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import React from 'react'

import { BUSINESS } from '@/utilities/business'

import { CopyEmail } from './CopyEmail'

export const metadata: Metadata = {
  title: 'Contact | SoloStack',
  description: `Email the SoloStack team. We reply within ${BUSINESS.replyTime}. Business details and postal address included.`,
  openGraph: { title: 'Contact | SoloStack', description: 'Email the SoloStack team.', type: 'website', url: 'https://solostack.au/contact' },
  alternates: { canonical: 'https://solostack.au/contact' },
}

const mail = (subject: string) => `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}`

const TOPICS = [
  { title: 'A question about a guide or tool', hint: 'Something unclear, or you want a second opinion.', subject: 'Question about SoloStack' },
  { title: 'A mistake or a broken link', hint: 'A wrong fact, an outdated price or a link that fails.', subject: 'Correction for SoloStack' },
  { title: 'A brand or partnership enquiry', hint: 'Tell us what you make and who it is for.', subject: 'Brand or partnership enquiry' },
  { title: 'A privacy request', hint: 'See, correct or delete information we hold about you.', subject: 'Privacy request' },
] as const

export default function ContactPage() {
  return (
    <div className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto w-full max-w-[1366px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Contact</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Write to us. A real person reads it.</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Email is the quickest way to reach the SoloStack team. We reply within {BUSINESS.replyTime}.
            </p>

            <div className="mt-8 rounded-2xl border border-border p-6 sm:p-8">
              <p className="text-sm font-medium text-neutral-500">Email</p>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="mt-1 block break-all text-2xl font-bold tracking-tight underline decoration-emerald-600 decoration-2 underline-offset-4 sm:text-3xl"
              >
                {BUSINESS.email}
              </a>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="inline-flex items-center rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  Write an email
                </a>
                <CopyEmail email={BUSINESS.email} />
              </div>
            </div>

            <h2 className="mt-12 text-xl font-bold tracking-tight">What is it about?</h2>
            <p className="mt-1 text-sm text-neutral-500">Pick one and your email app opens with the subject filled in.</p>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {TOPICS.map((t) => (
                <li key={t.title}>
                  <a href={mail(t.subject)} className="group flex items-center justify-between gap-4 py-4">
                    <span>
                      <span className="block font-semibold">{t.title}</span>
                      <span className="mt-0.5 block text-sm text-neutral-600 dark:text-neutral-400">{t.hint}</span>
                    </span>
                    <ArrowUpRight
                      className="size-5 flex-none text-neutral-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src="/api/media/file/solo-consultant-tech-stack.webp"
                alt="A laptop, notebook and cup of coffee on a bright wooden desk by a window"
                width={1024}
                height={576}
                loading="eager"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="text-neutral-500">Operated by</dt>
              <dd>{BUSINESS.operator}</dd>
              <dt className="text-neutral-500">ABN</dt>
              <dd>{BUSINESS.abn}</dd>
              <dt className="text-neutral-500">Post</dt>
              <dd>{BUSINESS.address}</dd>
              <dt className="text-neutral-500">Reply time</dt>
              <dd>Within {BUSINESS.replyTime}</dd>
            </dl>
            <p className="mt-6 text-sm text-neutral-500">
              Looking for quick answers first? Try the <a className="font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400" href="/faqs">FAQs</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
