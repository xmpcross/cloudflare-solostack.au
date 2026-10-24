import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Accordion } from '@/components/Accordion'
import { PageHeader, WRAP } from '@/components/marketing/RoadChrome'
import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = {
  title: 'FAQs: Pricing, Affiliate Links and How We Choose | SoloStack',
  description: 'Answers about SoloStack: who runs it, how we choose products, how affiliate links work, and how to reach us.',
  openGraph: { images: [{ url: 'https://solostack.au/website-template-OG.webp', width: 1200, height: 630, alt: 'SoloStack' }], title: 'FAQs: Pricing, Affiliate Links and How We Choose | SoloStack', description: 'Answers about SoloStack, our recommendations and affiliate links.', type: 'website', url: 'https://solostack.au/faqs' },
  alternates: { canonical: 'https://solostack.au/faqs' },
}

// Answers are plain text. [label](/path) makes a link. The same text feeds the page and the search-engine FAQ data.
const GROUPS: { id: string; title: string; items: { q: string; a: string[] }[] }[] = [
  {
    id: 'about',
    title: 'About SoloStack',
    items: [
      {
        q: 'What is SoloStack?',
        a: [
          'SoloStack is a guide and directory for solo creators, freelancers and one-person businesses. It covers the tools, hardware and workflows that help one person do the work of a small team, without the cost and complexity of software built for large companies. [Read more about us](/about).',
        ],
      },
      {
        q: 'Who runs this website?',
        a: [`SoloStack is run by ${BUSINESS.operator} (ABN ${BUSINESS.abn}), an Australian business based in West Perth, Western Australia.`],
      },
      {
        q: 'What makes SoloStack different from a generic software directory?',
        a: [
          'We write for one person running a business, not a company with an IT team. That means we favour tools that are quick to set up, fairly priced, easy to connect to automation, and dependable when there is nobody else to fix them.',
        ],
      },
    ],
  },
  {
    id: 'recommendations',
    title: 'How we choose products',
    items: [
      {
        q: 'How do you decide what to feature?',
        a: [
          'We research each product using the maker’s documentation, specifications and pricing pages, and other credible sources. Then we ask five questions: how fast can one person get results, how well does it connect to the rest of a stack, is the pricing clear and fair, is it reliable, and, for hardware, is it built to last.',
        ],
      },
      {
        q: 'Can a brand pay for a good review or a higher ranking?',
        a: [
          'No. We do not sell reviews or ranking positions. We do earn commissions from some merchants, which you can read about in our [Affiliate Disclosure](/affiliate-disclosure), but that does not decide what we recommend. If a product is slow, overpriced or poorly supported, we say so.',
        ],
      },
      {
        q: 'How up to date are prices and features?',
        a: [
          'We update a page when we learn something has changed, but makers change plans and prices when they like. Treat what you read here as a guide and check the maker’s own site before you buy.',
        ],
      },
    ],
  },
  {
    id: 'links-and-offers',
    title: 'Links, coupons and offers',
    items: [
      {
        q: 'Do your links cost me anything extra?',
        a: [
          'No. You pay the merchant’s normal price. If you buy through one of our affiliate links, the merchant may pay us a commission, and that comes out of their margin, not your pocket.',
        ],
      },
      {
        q: 'What if a coupon code does not work?',
        a: [
          `Merchants set and change their own offers, so a code can expire or be limited to certain regions. If one fails, email ${BUSINESS.email} and we will check it.`,
        ],
      },
    ],
  },
  {
    id: 'stacks',
    title: 'Stacks and guides',
    items: [
      {
        q: 'What is a stack?',
        a: [
          'Instead of recommending tools one at a time, a stack shows how software, hardware and automation fit together to run one kind of business, such as a podcast, a consulting practice or a YouTube studio. Browse them on the [stacks page](/stacks).',
        ],
      },
      {
        q: 'Can I suggest a guide, a tool or a correction?',
        a: ['Yes, please. If you spot a mistake or have a tool or workflow you think we should cover, [get in touch](/contact).'],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    items: [
      {
        q: 'How do I contact the team?',
        a: [
          `Email ${BUSINESS.email}, or write to ${BUSINESS.operator}, ${BUSINESS.address}. We aim to reply within ${BUSINESS.replyTime}. The [contact page](/contact) has quick links for common reasons to write.`,
        ],
      },
    ],
  },
]

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g

function renderText(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(LINK)) {
    out.push(text.slice(last, m.index))
    out.push(
      <Link key={`${m.index}`} href={m[2]}>
        {m[1]}
      </Link>,
    )
    last = (m.index ?? 0) + m[0].length
  }
  out.push(text.slice(last))
  return out
}

const plain = (text: string) => text.replace(LINK, '$1')

export default function FaqsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a.map(plain).join(' ') } })),
    ),
  }

  return (
    <div className="road">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader
        kicker="Help"
        title="Frequently asked questions"
        intro="Short answers about who we are, how we choose what to recommend, and how affiliate links work."
      />

      <div className={`${WRAP} pb-24 pt-12 sm:pt-16`}>
        <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label="Topics" className="lg:sticky lg:top-28 lg:self-start">
            <p className="cap text-[color:var(--road-muted)]">Topics</p>
            <ul className="mt-3 space-y-1 border-l border-[color:var(--road-rule)] text-sm">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[color:var(--road-muted)] transition-colors hover:border-[color:var(--sign-yellow)] hover:text-[color:var(--road-ink)]"
                  >
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-14">
            {GROUPS.map((g) => (
              <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-28">
                <h2 id={`${g.id}-h`} className="sign-type border-b border-[color:var(--road-ink)] pb-3 text-2xl font-bold tracking-tight">
                  {g.title}
                </h2>
                <Accordion
                  className="mt-4"
                  items={g.items.map((i) => ({
                    question: i.q,
                    answer: i.a.map((p) => <p key={p}>{renderText(p)}</p>),
                  }))}
                />
              </section>
            ))}

            <aside className="panel p-8 sm:p-10">
              <p className="sign-type text-xl font-semibold">Still have a question?</p>
              <p className="mt-1 text-[color:var(--road-muted)]">Email us and we will reply within {BUSINESS.replyTime}.</p>
              <Link href="/contact" className="btn mt-5">
                Contact us
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
