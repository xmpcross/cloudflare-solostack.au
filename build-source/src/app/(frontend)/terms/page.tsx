import type { Metadata } from 'next'
import React from 'react'

import { LegalLayout, legalMetadata, type LegalSection } from '@/components/LegalLayout'
import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = legalMetadata(
  'Terms of Service',
  'The terms for using SoloStack: what the site is, how links to merchants work, who owns the content, and the limits of our responsibility.',
  '/terms',
)

const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement to these terms',
    body: (
      <>
        <p>
          These Terms of Service (“Terms”) are an agreement between you and {BUSINESS.operator} (ABN {BUSINESS.abn}), which operates solostack.au
          (“SoloStack”, “we”, “us”, “our”).
        </p>
        <p>By using the website you accept these Terms. If you do not agree with them, please stop using the site.</p>
      </>
    ),
  },
  {
    id: 'what-the-site-is',
    title: 'What SoloStack is',
    body: (
      <>
        <p>
          SoloStack is an editorial site. It publishes guides, software and hardware profiles, workflow stacks and offers for independent creators and
          one-person businesses.
        </p>
        <p>
          Our content reflects our editorial team’s research and analysis, using information from makers and other public sources. We work to keep it
          accurate and current, but software features, specifications and prices change often. Check the maker’s own site before you decide. Nothing on
          the site is legal, tax or financial advice.
        </p>
      </>
    ),
  },
  {
    id: 'merchants-and-links',
    title: 'Merchants, prices and outbound links',
    body: (
      <>
        <p>
          The site links to software makers and retailers. Some links are affiliate links (see our <a href="/affiliate-disclosure">Affiliate Disclosure</a>
          ).
        </p>
        <ul>
          <li>SoloStack and {BUSINESS.operator} do not sell software, services or hardware.</li>
          <li>If you buy after clicking a link or using a coupon, the sale is between you and that merchant.</li>
          <li>
            The merchant’s terms govern availability, pricing, renewals, delivery, warranties and refunds. We are not responsible for a merchant’s
            performance or for order disputes.
          </li>
          <li>We cannot guarantee that a coupon or price shown on our site will be honoured when you buy.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <>
        <p>
          Unless stated otherwise, the original writing, diagrams, design and code on solostack.au belong to {BUSINESS.operator}. You may not copy,
          distribute or republish them without our written permission.
        </p>
        <p>
          Third-party names, logos and trademarks (for example Riverside.fm, Descript, Shure, Make.com and Canva) belong to their owners. We show them only
          to identify the products we discuss. This does not mean they endorse us or are connected with us unless we say so.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Warranties and liability',
    body: (
      <>
        <p>
          The site is provided “as is” and “as available”. To the extent the law allows, we give no warranties about it, including about fitness for a
          particular purpose.
        </p>
        <p>
          To the extent the law allows, {BUSINESS.operator} and its officers and agents are not liable for loss or damage arising from your use of, or
          inability to use, this site or the external services it links to.
        </p>
        <p>
          Nothing in these Terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law that cannot lawfully be
          excluded.
        </p>
      </>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These Terms are governed by the laws of Western Australia and the Commonwealth of Australia. The courts of Western Australia have jurisdiction
        over any dispute about them.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        For questions about these Terms, email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or write to {BUSINESS.operator},{' '}
        {BUSINESS.address}.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      path="/terms"
      intro="The rules for using this site, written to be read."
      summary={[
        'SoloStack publishes guides and recommendations. It does not sell anything.',
        'When you buy through a link, you are dealing with the merchant, and their terms apply.',
        'Prices and features change. Check the maker’s site before you buy.',
        'Your rights under the Australian Consumer Law are not affected.',
      ]}
      sections={sections}
    />
  )
}
