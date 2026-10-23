import type { Metadata } from 'next'
import React from 'react'

import { LegalLayout, legalMetadata, type LegalSection } from '@/components/LegalLayout'
import { BUSINESS } from '@/utilities/business'

export const metadata: Metadata = legalMetadata(
  'Privacy Policy',
  'What personal information SoloStack collects, why, how affiliate tracking works, and how to ask for access, correction or deletion.',
  '/privacy-policy',
)

const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          SoloStack (solostack.au) is operated by {BUSINESS.operator} (ABN {BUSINESS.abn}). In this policy, “we”, “us” and “our” mean{' '}
          {BUSINESS.operator}.
        </p>
        <p>
          We handle personal information in line with the Privacy Act 1988 (Cth) and the Australian Privacy Principles. We also respect the privacy
          rights of readers in other countries.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What we collect',
    body: (
      <>
        <p>Depending on how you use the site, we may collect:</p>
        <ul>
          <li>
            <strong>Messages you send us.</strong> Your name, email address and the contents of your message when you email us.
          </li>
          <li>
            <strong>Technical and usage data.</strong> Your IP address, browser type and version, device and operating system, pages viewed, time on
            page, referral source and search terms.
          </li>
          <li>
            <strong>Affiliate click identifiers.</strong> Anonymous identifiers created when you click an outbound link to a partner merchant. They are
            used to confirm referred purchases.
          </li>
        </ul>
        <p>We do not collect or store bank account or card details. Purchases happen on the merchant’s own website.</p>
      </>
    ),
  },
  {
    id: 'cookies-and-affiliate-tracking',
    title: 'Cookies and affiliate tracking',
    body: (
      <>
        <p>
          SoloStack takes part in affiliate programs. When you click an outbound link or use a coupon on our site, our affiliate networks (including
          CJ Affiliate, Awin, Impact, Sovrn Commerce and Takeads) or the merchant may set a cookie or similar identifier on your device.
        </p>
        <p>
          It records that you came from solostack.au, so that if you buy, the merchant can credit us a referral commission. These identifiers are
          technical codes rather than your name or email address, and they expire under the merchant’s tracking window, typically 30 to 90 days.
        </p>
        <p>
          You can block or delete cookies in your browser settings. Some features on our site or on partner sites may not work as well if you do. See
          our <a href="/cookie-policy">Cookie Policy</a> for detail.
        </p>
      </>
    ),
  },
  {
    id: 'advertising',
    title: 'Advertising and third-party vendors',
    body: (
      <>
        <p>
          SoloStack shows advertising served by Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user’s prior
          visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads to you based on your
          visit to this site and other sites on the internet.
        </p>
        <p>
          You can opt out of personalised advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener nofollow">Google Ads Settings</a>, or opt out of
          some third-party vendors’ use of cookies for personalised advertising at <a href="https://www.aboutads.info" target="_blank" rel="noopener nofollow">aboutads.info</a>. You
          can read how Google uses data from sites that use its services at{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener nofollow">policies.google.com/technologies/partner-sites</a>.
        </p>
        <p>
          Where the law requires it, for example for visitors in the European Economic Area, the United Kingdom and Switzerland, a consent message from
          Google asks for your choice before personalised ads or non-essential cookies are used.
        </p>
        <p>
          We also use Ahrefs Web Analytics to measure traffic in aggregate, and link tools from ConvertLink and Sovrn Commerce (VigLink) that may turn
          an outbound link into an affiliate link. See our <a href="/cookie-policy">Cookie Policy</a> for the cookies involved.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use information',
    body: (
      <>
        <p>We use information only for legitimate business purposes:</p>
        <ul>
          <li>To reply to questions, technical issues and partnership requests sent to us.</li>
          <li>To understand site traffic, fix technical problems and improve the reading experience on desktop and mobile.</li>
          <li>To check and report affiliate conversions to our partner networks.</li>
          <li>To meet legal, tax and accounting obligations under Australian law.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'security-and-retention',
    title: 'Security and retention',
    body: (
      <p>
        We use reasonable safeguards to protect personal information from unauthorised access, change, disclosure or misuse, including HTTPS encryption
        and managed hosting. We keep information only as long as we need it for the purpose it was collected, or as the law requires.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          You can ask to see the personal information we hold about you, ask us to correct it, or ask us to delete it. Email{' '}
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> and we will reply within {BUSINESS.replyTime}.
        </p>
        <p>
          If you are not satisfied with our response, you can complain to the Office of the Australian Information Commissioner at{' '}
          <a href="https://www.oaic.gov.au" rel="noopener noreferrer" target="_blank">
            oaic.gov.au
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'contact-and-complaints',
    title: 'Questions and complaints',
    body: (
      <p>
        If you have a question or complaint about this policy or how we handle personal information, write to {BUSINESS.operator}, {BUSINESS.address}, or
        email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>
    ),
  },
]

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      path="/privacy-policy"
      intro="What we collect when you use SoloStack, why we collect it, and how you can ask us to change it."
      summary={[
        'We collect very little: emails you send us, basic technical data about visits, and anonymous click identifiers on affiliate links.',
        'We never see or store your payment details. You buy from the merchant, not from us.',
        'You can ask to see, correct or delete your information at any time.',
      ]}
      sections={sections}
    />
  )
}
