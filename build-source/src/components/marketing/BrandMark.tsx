import Image from 'next/image'
import React from 'react'
import { BRAND_LOGOS } from '@/utilities/brandLogos'

/** Square logo tile for a brand, tool or retailer key; a letter tile when no logo has been saved for it. */
export function BrandMark({ slug, name, className = 'size-11' }: { slug: string; name: string; className?: string }) {
  const src = BRAND_LOGOS[slug]
  return (
    <span className={`grid shrink-0 place-items-center rounded-lg bg-white p-1.5 ring-1 ring-black/10 ${className}`}>
      {src ? (
        <Image src={src} alt="" width={36} height={36} className="size-full object-contain" unoptimized />
      ) : (
        <span className="sign-type text-lg font-bold text-[color:var(--road-green)]">{name.charAt(0)}</span>
      )}
    </span>
  )
}
