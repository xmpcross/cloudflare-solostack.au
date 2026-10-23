import type { Metadata } from 'next'
import React from 'react'

import { LegalLayout, legalMetadata, type LegalSection } from '@/components/LegalLayout'
import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = legalMetadata(
  'Affiliate Disclosure',
  'How SoloStack earns money from affiliate links, which networks we work with, and why that does not buy a recommendation.',
  '/affiliate-disclosure',
)

const sections: LegalSection[] = [
  {
    id: 'statement',
    title: 'Our disclosure',
    body: (
      <>
        <p>
          SoloStack (solostack.au) is operated by {BUSINESS.operator} (ABN {BUSINESS.abn}). It is a reader-supported site. Some links on it are affiliate
          links, and we may earn a commission when you buy through them.
        </p>
        <p>
          We make this disclosure in line with the US Federal Trade Commission’s endorsement guidelines (16 CFR Part 255) and the fair trading guidance of
          the Australian Competition and Consumer Commission (ACCC).
        </p>
      </>
    ),
  },
  {
    id: 'how-it-works',
    title: 'How it works',
    body: (
      <>
        <p>
          You will see outbound links, product cards and offers for software, online services and hardware. If you click one and then buy or subscribe,
          the merchant may pay {BUSINESS.operator} a referral commission.
        </p>
        <p>
          <strong>It never costs you extra.</strong> The price you pay is the merchant’s price. Where a merchant gives us a coupon or special offer, we may
          show it, but offers are set by the merchant and can change or end without notice.
        </p>
      </>
    ),
  },
  {
    id: 'networks',
    title: 'Networks and programs',
    body: (
      <>
        <p>We earn commissions through affiliate networks and merchant programs, including:</p>
        <ul>
          <li>CJ Affiliate</li>
          <li>Awin</li>
          <li>Impact</li>
          <li>Sovrn Commerce</li>
          <li>Takeads</li>
          <li>Direct software and retailer partner programs</li>
        </ul>
        <p>Not every product we mention has an affiliate link. Some links are plain links to the maker’s own site.</p>
      </>
    ),
  },
  {
    id: 'independence',
    title: 'Editorial independence',
    body: (
      <>
        <p>Commissions do not decide what we write about or how we rate it. Our aim is to point solo creators and one-person businesses to tools that suit them.</p>
        <p>
          We base what we write on what makers and credible sources say about features, reliability, pricing and fit for a one-person business, and we say
          who a product is not for. A merchant or network cannot pay for a positive review or a guaranteed place in our stacks.
        </p>
      </>
    ),
  },
  {
    id: 'questions',
    title: 'Questions and partnerships',
    body: (
      <p>
        If you have a question about our affiliate relationships, or you represent a brand and would like us to consider your product, email{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Being a partner does not guarantee a mention or a favourable one.
      </p>
    ),
  },
]

export default function AffiliateDisclosurePage() {
  return (
    <LegalLayout
      title="Affiliate Disclosure"
      path="/affiliate-disclosure"
      intro="How this site is paid for, in plain words."
      summary={[
        'Some links are affiliate links. If you buy through one, we may earn a commission.',
        'It costs you nothing extra and does not change the price you pay.',
        'Commissions do not buy a recommendation or a better rating.',
      ]}
      sections={sections}
    />
  )
}
