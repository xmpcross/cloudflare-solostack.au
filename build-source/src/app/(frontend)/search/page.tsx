import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { StaticSearch } from './StaticSearch'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export default async function Page() {
  let posts: CardPostData[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'search',
      depth: 1,
      limit: 1000,
      select: { title: true, slug: true, categories: true, meta: true },
      pagination: false,
    })
    posts = res.docs as unknown as CardPostData[]
  } catch (error) {
    console.warn('Database query error for search:', error)
  }

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-8">
        <Breadcrumbs items={[{ name: 'Search' }]} className="mb-4" />
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>
        </div>
      </div>
      <StaticSearch posts={posts} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search | SoloStack',
    robots: { index: false, follow: true },
  }
}
