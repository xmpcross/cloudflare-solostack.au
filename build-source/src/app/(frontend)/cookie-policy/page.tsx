import type { Metadata } from 'next'
import React from 'react'

import { LegalLayout, legalMetadata, type LegalSection } from '@/components/LegalLayout'
import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = legalMetadata(
  'Cookie Policy',
  'How SoloStack uses cookies and similar technologies for site function, analytics and affiliate link attribution, and how to control them.',
  '/cookie-policy',
)

const sections: LegalSection[] = [
  {
    id: 'what-are-cookies',
    title: 'What cookies are',
    body: (
      <p>
        Cookies are small files a website stores on your device. They help a site work, remember your choices, measure how it is used and keep outbound
        links secure. Similar technologies, such as local storage and tracking parameters in a link, do the same kinds of jobs.
      </p>
    ),
  },
  {
    id: 'how-we-use-them',
    title: 'How SoloStack uses them',
    body: (
      <ul>
        <li>
          <strong>Strictly necessary.</strong> Needed to show pages, remember your light or dark theme and keep the site secure.
        </li>
        <li>
          <strong>Performance and analytics.</strong> Help us see which pages are read, so we can improve them.
        </li>
        <li>
          <strong>Affiliate attribution.</strong> When you click a partner link or use a coupon, a short-lived cookie or a referral parameter (such as{' '}
          <code>clickref</code> or <code>sid</code>) is passed to the merchant so a qualifying purchase can be credited to SoloStack.
        </li>
      </ul>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party cookies',
    body: (
      <>
        <p>Some cookies come from our service providers and affiliate networks, not from solostack.au:</p>
        <ul>
          <li>
            <strong>Affiliate networks</strong> such as CJ Affiliate, Awin, Impact, Sovrn Commerce and Takeads. Their tracking cookies usually last
            30 to 90 days, depending on the merchant.
          </li>
          <li>
            <strong>Google Analytics</strong>, for anonymised performance and engagement reporting.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your choices',
    body: (
      <>
        <p>
          You control cookies through your browser. Most browsers let you block, delete or review them. If you block essential cookies, parts of the
          site may not work as expected.
        </p>
        <p>
          Blocking affiliate cookies does not change the price you pay. It only means a purchase may not be credited to us.
        </p>
      </>
    ),
  },
  {
    id: 'changes-and-contact',
    title: 'Changes and contact',
    body: (
      <p>
        We may update this policy as the site or the law changes, and we will change the date above when we do. Questions? Email{' '}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or write to {BUSINESS.operator}, {BUSINESS.address}.
      </p>
    ),
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      path="/cookie-policy"
      intro="The small files this site and its partners use, and how to switch them off."
      summary={[
        'We use cookies to make the site work, to see which pages are read, and to credit affiliate referrals.',
        'Affiliate cookies are set by our partner networks when you click a link, usually for 30 to 90 days.',
        'You can block or delete cookies in your browser at any time.',
      ]}
      sections={sections}
    />
  )
}
