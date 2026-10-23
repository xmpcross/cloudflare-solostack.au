// Helpers for showing real retailer offers (products_offers) on gear pages.

export type BestOffer = {
  price: number
  merchant: string
  merchantKey: string
  url?: string
  retailers: number
  checkedAt?: string
}

export const logoKeyOf = (name?: string | null) =>
  (name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** The lowest AUD price among a product's offers, with how many retailers list it. Offers without an AUD price are ignored. */
export function bestOffer(offers: any[] | null | undefined): BestOffer | null {
  const priced = (offers ?? []).filter((o) => o && o.currency === 'AUD' && typeof o.price === 'number' && o.price > 0)
  if (!priced.length) return null
  const best = priced.reduce((a, b) => (b.price < a.price ? b : a))
  const checked = priced.map((o) => o.checkedAt).filter(Boolean).sort().pop()
  return {
    price: best.price,
    merchant: best.merchant,
    merchantKey: logoKeyOf(best.merchant),
    url: best.url || undefined,
    retailers: new Set(priced.map((o) => o.merchant)).size,
    checkedAt: checked,
  }
}

export const formatAud = (n: number) =>
  `$${n.toLocaleString('en-AU', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`

export const formatDay = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const mediaUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return img
  return img.url || img.sizes?.medium?.url || null
}
