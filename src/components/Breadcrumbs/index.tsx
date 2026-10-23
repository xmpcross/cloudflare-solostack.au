// Breadcrumb trail for every page below the home page (owner request, 23 Oct 2026): a visible "Home / Section / Page"
// line plus matching BreadcrumbList structured data, so readers and search engines see the same trail.
import Link from 'next/link'
import React from 'react'

import { getServerSideURL } from '@/utilities/getURL'

export type Crumb = { name: string; href?: string }

export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ name: 'Home', href: '/' }, ...items]
  const base = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: `${base}${crumb.href === '/' ? '' : crumb.href}` } : {}),
    })),
  }
  return (
    <nav aria-label="Breadcrumb" className={`text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 ${className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1
          return (
            <React.Fragment key={`${crumb.name}-${index}`}>
              {index > 0 && (
                <li aria-hidden="true" className="text-neutral-400">
                  /
                </li>
              )}
              <li>
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {crumb.name}
                  </Link>
                ) : (
                  <span aria-current={last ? 'page' : undefined} className={last ? 'text-neutral-700 dark:text-neutral-200' : ''}>
                    {crumb.name}
                  </span>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
