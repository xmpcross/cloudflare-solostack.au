import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import React from 'react'

import { PageHeader, WRAP } from '@/components/marketing/RoadChrome'
import { BUSINESS } from '@/utilities/business'

import { CopyEmail } from './CopyEmail'

export const metadata: Metadata = {
  title: 'Contact SoloStack: Questions and Corrections | SoloStack',
  description: `Email the SoloStack team. We reply within ${BUSINESS.replyTime}. Business details and postal address included.`,
  openGraph: { images: [{ url: 'https://solostack.au/website-template-OG.webp', width: 1200, height: 630, alt: 'SoloStack' }], title: 'Contact SoloStack: Questions and Corrections | SoloStack', description: 'Email the SoloStack team.', type: 'website', url: 'https://solostack.au/contact' },
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
    <div className="road">
      <PageHeader
        kicker="Contact"
        title="Write to us. A real person reads it."
        intro={`Email is the quickest way to reach the SoloStack team. We reply within ${BUSINESS.replyTime}.`}
      />

      <div className={`${WRAP} pb-24 pt-12 sm:pt-16`}>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <div className="panel p-8 sm:p-10">
              <p className="cap text-[color:var(--road-muted)]">Email</p>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="sign-type mt-2 block break-all text-2xl font-bold tracking-tight underline decoration-[color:var(--sign-yellow)] decoration-2 underline-offset-4 sm:text-3xl"
              >
                {BUSINESS.email}
              </a>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`mailto:${BUSINESS.email}`} className="btn">
                  Write an email
                </a>
                <CopyEmail email={BUSINESS.email} />
              </div>
            </div>

            <h2 className="sign-type mt-14 text-2xl font-bold tracking-tight">What is it about?</h2>
            <p className="mt-1 text-sm text-[color:var(--road-muted)]">Pick one and your email app opens with the subject filled in.</p>
            <ul className="mt-4 divide-y divide-[color:var(--road-rule)] border-y border-[color:var(--road-rule)]">
              {TOPICS.map((t) => (
                <li key={t.title}>
                  <a href={mail(t.subject)} className="lane group flex items-center justify-between gap-4 py-5">
                    <span>
                      <span className="sign-type block text-lg font-semibold">{t.title}</span>
                      <span className="mt-0.5 block text-sm text-[color:var(--road-muted)]">{t.hint}</span>
                    </span>
                    <ArrowUpRight className="lane-arrow size-5 flex-none" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="panel p-3">
              <img
                src="/api/media/file/solo-consultant-tech-stack.webp"
                alt="A laptop, notebook and cup of coffee on a bright wooden desk by a window"
                width={1024}
                height={576}
                loading="eager"
                className="aspect-[16/10] w-full rounded-[2px] object-cover"
              />
            </div>

            <dl className="mt-8 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="cap text-[color:var(--road-muted)]">Operated by</dt>
              <dd>{BUSINESS.operator}</dd>
              <dt className="cap text-[color:var(--road-muted)]">ABN</dt>
              <dd>{BUSINESS.abn}</dd>
              <dt className="cap text-[color:var(--road-muted)]">Post</dt>
              <dd>{BUSINESS.address}</dd>
              <dt className="cap text-[color:var(--road-muted)]">Reply time</dt>
              <dd>Within {BUSINESS.replyTime}</dd>
            </dl>
            <p className="mt-6 text-sm text-[color:var(--road-muted)]">
              Looking for quick answers first? Try the <a className="font-semibold text-[color:var(--road-ink)] underline underline-offset-4" href="/faqs">FAQs</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
