'use client'

import React from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'

// Default auto-inserted top navigation links. Deals is not listed: /deals redirects to the homepage.
const DEFAULT_TOP_NAV_LINKS = [
  { label: 'Stacks', url: '/stacks' },
  { label: 'Tools', url: '/tools' },
  { label: 'Best Gear', url: '/best-gear' },
  { label: 'Comparisons', url: '/comparisons' },
  { label: 'Guides', url: '/posts' },
]

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const pathname = usePathname()
  const rawCmsNavItems = data?.navItems || []
  const cmsNavItems = rawCmsNavItems.filter((item) => {
    const url = item?.link?.url || ''
    const label = item?.link?.label?.toLowerCase() || ''
    return url !== '/contact' && !url.includes('contact') && label !== 'contact' && label !== 'contact us'
  })

  // Create a combined list of nav items ensuring default items are present if CMS list doesn't cover them
  const cmsUrls = new Set(cmsNavItems.map((item) => item?.link?.url).filter(Boolean))
  const autoInsertedLinks = DEFAULT_TOP_NAV_LINKS.filter((item) => !cmsUrls.has(item.url))

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex lg:gap-2">
      {/* Auto-Inserted Core Top Nav Links */}
      {autoInsertedLinks.map((item) => {
        const isActive = pathname === item.url || (item.url !== '/' && pathname?.startsWith(item.url))
        return (
          <Link
            key={item.url}
            href={item.url}
            aria-current={isActive ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center px-3 text-[0.9375rem] transition-colors ${
              isActive
                ? 'font-bold text-foreground underline decoration-emerald-500 decoration-[3px] underline-offset-[10px]'
                : 'font-semibold text-foreground/85 hover:text-indigo-700 hover:underline hover:decoration-emerald-500 hover:decoration-2 hover:underline-offset-[10px]'
            }`}
          >
            {item.label}
          </Link>
        )
      })}

      {/* CMS Custom Links */}
      {cmsNavItems.map(({ link }, i) => {
        return (
          <div key={i} className="px-1.5 text-[0.9375rem] font-semibold text-foreground/85 transition-colors hover:text-indigo-700">
            <CMSLink {...link} appearance="link" className="font-semibold text-foreground/85 hover:text-indigo-700" />
          </div>
        )
      })}

      {/* Search Button Link */}
      <Link
        href="/search"
        className="ml-1 grid size-11 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
        title="Search SoloStack"
      >
        <span className="sr-only">Search</span>
        <Search aria-hidden className="size-[1.15rem]" />
      </Link>
    </nav>
  )
}
