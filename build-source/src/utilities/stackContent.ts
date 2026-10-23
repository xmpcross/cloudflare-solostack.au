// Editorial copy for /stacks and /stacks/[slug] (content plan "SoloStack /stacks Analysis and Content Plan", 23 Oct 2026).
// Stack records (tools, gear, cost, walkthrough) live in the database; seeded by scripts/seed-stacks.mjs.

export const PRICES_CHECKED = '23 Oct 2026'
export const USD_PER_AUD = 0.701
export const AUD_PER_USD_RATE = 1.43

export const EXCHANGE_NOTE = `All prices are in Australian dollars. Software billed in US dollars is converted at US$1 = A$${AUD_PER_USD_RATE} (${USD_PER_AUD} US dollars per A$1, ${PRICES_CHECKED}), so what you pay moves with the exchange rate. Each stack total is the cheapest paid plan needed, billed monthly, before GST and card fees. Converted prices are estimates and may not be 100% accurate.`

/** Label shown for who a stack is built for (the database enum is coarser than the plan's audiences). */
export const BUILT_FOR: Record<string, string> = {
  'lead-capture-follow-up-automation': 'Any service business',
  '1-person-youtube-studio': 'Creator',
  'paid-newsletter': 'Newsletter',
  'lean-saas-founder': 'SaaS',
  'solo-consultant-client': 'Consultant',
  'solo-podcast': 'Creator',
  'freelance-web-design-studio': 'Agency',
  'online-course-creator': 'Creator',
}

/** Existing guide that goes with a stack, so the stack and the article link to each other. */
export const STACK_GUIDE: Record<string, string> = {
  'lead-capture-follow-up-automation': 'lead-capture-automation',
  '1-person-youtube-studio': '1-person-video-podcast-setup',
  'paid-newsletter': 'newsletter-business-stack',
  'solo-consultant-client': 'solo-consultant-tech-stack',
  'solo-podcast': 'solo-podcaster-stack',
  'online-course-creator': 'course-creator-stack',
}

/** "≈A$47" -> 47 */
export const costNumber = (s?: string | null): number | null => {
  const m = /(\d+(?:\.\d+)?)/.exec(s || '')
  return m ? Number(m[1]) : null
}

export const BUILD_ORDER = [
  { title: 'Name the outcome', body: 'Decide the one result the business needs, such as booked calls, published episodes or paying subscribers. Pick the blueprint that matches it.' },
  { title: 'Start on free plans', body: 'Most tools here have a free plan or a trial. Run real work through them for a few weeks and pay only for the limit you actually hit.' },
  { title: 'Buy gear in order', body: 'Microphone first, then light, then camera, then desk. Viewers and clients forgive a soft picture before they forgive bad sound.' },
  { title: 'Review every quarter', body: 'Each quarter, cancel what you did not use and check prices. Plans, limits and exchange rates change without notice.' },
]

export const FAQ: { q: string; a: string }[] = [
  { q: 'What does a stack cost?',
    a: 'Software for the eight blueprints runs from about A$47 to A$160 a month. Each total is the cheapest paid plan needed, billed monthly, before GST and card fees. Gear is a one-off cost, shown beside each item with an Australian retailer price.' },
  { q: 'Are the prices in Australian dollars?',
    a: `Yes. Every price on this site is shown in Australian dollars. Vendors that bill in US dollars are converted at US$1 = A$${AUD_PER_USD_RATE} (checked ${PRICES_CHECKED}), so your card statement will differ with the exchange rate, card fees and GST.` },
  { q: 'Do I pay GST on overseas software?',
    a: 'Often yes. Many overseas vendors now charge Australian GST on software sold to customers here. If you are registered for GST, which is required once turnover reaches A$75,000 a year, you can usually claim it back for business use. Check your invoices and ask your accountant.' },
  { q: 'Do I need every tool on day one?',
    a: 'No. Start with the free plans and the first item in each list, then add the rest as the work needs it. A blueprint is a destination, not a shopping list.' },
  { q: 'Why are US and UK tools included?',
    a: 'Most software for solo businesses is made overseas, and there is often no Australian equivalent. We include the best fit whatever its country, and for gear we show Australian retailer prices.' },
  { q: 'Which stack should I start with?',
    a: 'Pick the one that matches how you earn. Sell services: Lead Capture or Solo Consultant. Make videos or audio: YouTube Studio or Solo Podcast. Write for subscribers: Paid Newsletter. Build software: Lean SaaS Founder. Build websites for clients: Freelance Web Design. Teach: Online Course Creator.' },
  { q: 'How often are prices checked?',
    a: `Prices on this page were checked on ${PRICES_CHECKED}. We update a page when we learn something has changed, but vendors change plans without notice, so confirm the price on the vendor's site before you buy.` },
  { q: 'Are these affiliate links?',
    a: 'Some outbound links are affiliate links, and we may earn a commission if you buy, at no extra cost to you. It does not change what we recommend. See the Affiliate Disclosure for the detail.' },
]
