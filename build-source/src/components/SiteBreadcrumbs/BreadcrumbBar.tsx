'use client'

// The visible trail ("Home / Articles / Category / Page") in its own strip under the header, with matching
// BreadcrumbList data for search engines. The trail for the current path comes from the map built in trails.ts.
import { ChevronRight, House } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import type { Crumb, TrailMap } from './trails'

const SITE = 'https://solostack.au'

function trailFor(pathname: string, trails: TrailMap): Crumb[] | null {
  const path = (pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/') as string
  if (path === '/') return null
  if (trails[path]) return trails[path]
  const page = path.match(/^\/posts\/page\/(\d+)$/)
  if (page) return [{ name: 'Articles', href: '/posts' }, { name: `Page ${page[1]}` }]
  return null
}

export function BreadcrumbBar({ trails }: { trails: TrailMap }) {
  const trail = trailFor(usePathname() ?? '/', trails)
  if (!trail) return null

  const all: Crumb[] = [{ name: 'Home', href: '/' }, ...trail]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${SITE}${c.href === '/' ? '' : c.href}` } : {}),
    })),
  }

  return (
    <div className="w-full border-b border-border bg-neutral-50/80 dark:bg-neutral-900/50">
      <div className="mx-auto w-full max-w-[1366px] px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="py-2.5 text-xs sm:text-sm">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <ol className="flex min-w-0 items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            {all.map((crumb, i) => {
              const last = i === all.length - 1
              return (
                <React.Fragment key={`${crumb.name}-${i}`}>
                  {i > 0 && (
                    <li aria-hidden="true" className="flex-none text-neutral-300 dark:text-neutral-600">
                      <ChevronRight className="size-3.5" />
                    </li>
                  )}
                  <li className={last ? 'min-w-0' : 'flex-none'}>
                    {last ? (
                      <span aria-current="page" className="block truncate font-medium text-neutral-800 dark:text-neutral-100">
                        {crumb.name}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href ?? '/'}
                        className="inline-flex items-center gap-1.5 transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                      >
                        {i === 0 && <House className="size-3.5" aria-hidden />}
                        <span className={i === 0 ? 'sr-only sm:not-sr-only' : ''}>{crumb.name}</span>
                      </Link>
                    )}
                  </li>
                </React.Fragment>
              )
            })}
          </ol>
        </nav>
      </div>
    </div>
  )
}
