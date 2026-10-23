import { ArrowRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

import { BrandMark } from '@/components/marketing/BrandMark'
import { pickOffer, trackedLink, type PostProduct } from '@/components/PostProducts'
import { bestOffer, formatAud, logoKeyOf, mediaUrl } from '@/utilities/gearOffers'

/**
 * A product or tool shown inside the article, right after the paragraph that discusses it: photo or logo, name, one line
 * on what it is, the lowest Australian price when we have one, and the link.
 */
export function InlineProduct({ product }: { product: PostProduct }) {
  const internal = Boolean(product.href)
  const offer = internal ? null : pickOffer(product.offers)
  const tracked = offer ? trackedLink(offer) : null
  const href = internal ? (product.href as string) : tracked || offer?.url
  if (!href) return null

  const price = internal ? null : bestOffer(product.offers)
  const photo = mediaUrl(product.image)
  const logoSlug = product.slug || logoKeyOf(product.brand || product.name)

  return (
    <aside
      aria-label={`Related: ${product.name}`}
      className="road not-prose my-9 grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 rounded-xl border-2 border-[color:var(--road-green)] bg-[color:var(--sign-white)] p-4 sm:grid-cols-[auto_1fr_auto] sm:p-5"
    >
      {photo ? (
        <span className="relative block size-20 shrink-0 overflow-hidden rounded-lg bg-[color:var(--road-rule)] ring-1 ring-black/10 sm:size-24">
          <Image src={photo} alt="" fill sizes="96px" className="object-cover" unoptimized />
        </span>
      ) : (
        <BrandMark slug={logoSlug} name={product.brand || product.name} className="size-20 sm:size-24" />
      )}

      <div className="min-w-0">
        {product.brand && !internal ? (
          <p className="text-xs font-semibold text-[color:var(--road-muted)]">{product.brand}</p>
        ) : null}
        <p className="sign-type text-lg font-bold leading-snug sm:text-xl">{product.name}</p>
        {product.summary ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[color:var(--road-muted)]">{product.summary}</p>
        ) : null}
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
        {price ? (
          <p className="text-right">
            <span className="num sign-type block text-xl font-bold leading-none">{formatAud(price.price)}</span>
            <span className="mt-1 block text-xs text-[color:var(--road-muted)]">at {price.merchant}</span>
          </p>
        ) : null}
        <a
          href={href}
          {...(internal
            ? {}
            : { target: '_blank', rel: tracked ? 'sponsored nofollow noopener noreferrer' : 'nofollow noopener noreferrer' })}
          className="sign-type group inline-flex items-center gap-2 rounded-xl bg-[color:var(--road-green)] px-4 py-2.5 text-sm font-bold text-[color:var(--sign-white)] hover:brightness-110"
        >
          {internal ? 'See the profile' : `View at ${offer.merchant}`}
          {internal ? (
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          ) : (
            <ExternalLink aria-hidden className="size-3.5" />
          )}
        </a>
        {!internal ? <span className="text-[11px] text-[color:var(--road-muted)]">Affiliate link</span> : null}
      </div>
    </aside>
  )
}
