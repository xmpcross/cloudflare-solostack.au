import React from 'react'
import { ExternalLink } from 'lucide-react'

import { Media } from '@/components/Media'

export type PostProduct = {
  id: number
  name: string
  brand?: string | null
  summary?: string | null
  bestFor?: string | null
  image?: any
  offers?: any[] | null
  // Tools link to their own SoloStack page (which carries the affiliate link) instead of a merchant.
  href?: string | null
  slug?: string | null
}

// Offers keep the plain merchant URL in `url`. The network's tracked link is saved in `networkNotes` as
// "...: https://..." until the offers have a dedicated field, so pull it out here (and only here).
export const trackedLink = (offer: any): string | null => {
  if (!offer || !offer.network || offer.network === 'none') return null
  const match = typeof offer.networkNotes === 'string' ? offer.networkNotes.match(/https?:\/\/\S+$/) : null
  return match ? match[0] : null
}

export const pickOffer = (offers?: any[] | null) => {
  if (!offers || offers.length === 0) return null
  return offers.find((o) => o.primary) || offers[0]
}

export const PostProducts: React.FC<{ products: PostProduct[]; heading?: string }> = ({ products, heading = 'Related products and tools' }) => {
  const items = products
    .map((product) => {
      if (product.href) return { product, offer: null, href: product.href, affiliate: false, internal: true }
      const offer = pickOffer(product.offers)
      if (!offer?.url) return null
      const tracked = trackedLink(offer)
      return { product, offer, href: tracked || offer.url, affiliate: Boolean(tracked), internal: false }
    })
    .filter(Boolean) as { product: PostProduct; offer: any; href: string; affiliate: boolean; internal: boolean }[]

  if (items.length === 0) return null

  return (
    <section aria-labelledby="post-products-h" className="my-10">
      <h2 id="post-products-h" className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
        {heading}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map(({ product, offer, href, affiliate, internal }) => (
          <article key={product.id} className="flex gap-4 rounded-[8px] border border-border bg-card p-4">
            {product.image && typeof product.image === 'object' && (
              <div className="size-20 shrink-0 overflow-hidden rounded-[8px] border border-border bg-neutral-100 dark:bg-neutral-800">
                <Media
                  resource={product.image}
                  size="thumbnail"
                  className="size-full"
                  imgClassName="size-full object-cover object-center"
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              {product.brand && (
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
              )}
              <h3 className="font-semibold leading-snug">{product.name}</h3>
              {product.summary && <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">{product.summary}</p>}
              {internal ? (
                <a
                  href={href}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  Read the {product.name} profile
                </a>
              ) : (
                <a
                  href={href}
                  target="_blank"
                  rel={affiliate ? 'sponsored nofollow noopener noreferrer' : 'nofollow noopener noreferrer'}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                >
                  View at {offer.merchant}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Some links are affiliate links and may earn SoloStack a commission at no extra cost to you. Prices and
        availability change, so check the retailer before you buy.
      </p>
    </section>
  )
}
