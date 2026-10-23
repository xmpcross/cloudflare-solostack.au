// The business details shown on the About, Contact, FAQ and legal pages. Change them here, once.
export const BUSINESS = {
  site: 'solostack.au',
  siteUrl: 'https://solostack.au',
  operator: 'FXN Holdings',
  abn: '53 274 423 748',
  address: 'PO Box 500, WEST PERTH, WA 6872, Australia',
  email: 'contact@solostack.au',
  replyTime: '1 to 2 business days',
  policiesUpdated: '23 October 2026',
} as const

export const LEGAL_PAGES = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
  { href: '/affiliate-disclosure', label: 'Affiliate Disclosure' },
] as const
