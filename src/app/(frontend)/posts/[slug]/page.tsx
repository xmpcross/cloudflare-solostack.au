import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { TableOfContents } from '@/components/TableOfContents'
import { AuthorBio } from '@/components/AuthorBio'
import { PostSidebar } from '@/components/PostSidebar'
import { RelatedPostsSlider, type RelatedSlide } from '@/components/RelatedPostsSlider'
import { PostProducts, type PostProduct } from '@/components/PostProducts'
import { PostShareRail } from '@/components/PostShareRail'
import { getServerSideURL } from '@/utilities/getURL'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })
    const posts = await payload.find({
      collection: 'posts',
      draft: false,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const params = posts.docs.map(({ slug }) => {
      return { slug }
    })

    return params
  } catch (error) {
    console.warn('Database unavailable during SSG build for posts/[slug]:', error)
    return []
  }
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

function extractHeadingsAndWordCount(content: any): {
  tocItems: { id: string; text: string }[]
  wordCount: number
} {
  const tocItems: { id: string; text: string }[] = []
  let wordCount = 0

  function extractText(node: any): string {
    if (!node) return ''
    if (node.type === 'text' && typeof node.text === 'string') return node.text
    if (Array.isArray(node.children)) {
      return node.children.map(extractText).join('')
    }
    return ''
  }

  function traverse(node: any) {
    if (!node) return

    if (node.type === 'heading' && node.tag === 'h2') {
      const text = extractText(node).trim()
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        tocItems.push({ id, text })
      }
    }

    if (node.type === 'text' && typeof node.text === 'string') {
      const words = node.text.trim().split(/\s+/).filter(Boolean)
      wordCount += words.length
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        traverse(child)
      }
    }
  }

  if (content?.root) {
    traverse(content.root)
  }

  return { tocItems, wordCount }
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const { tocItems, wordCount } = extractHeadingsAndWordCount(post.content)
  const readingTime = Math.max(1, Math.ceil(wordCount / 220))

  // Fetch sidebar data: popular guides & categories
  let popularPosts: any[] = []
  let categories: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const [postsRes, catsRes] = await Promise.all([
      payload.find({
        collection: 'posts',
        limit: 5,
        sort: '-publishedAt',
        overrideAccess: false,
        where: {
          slug: {
            not_equals: decodedSlug,
          },
        },
        select: {
          title: true,
          slug: true,
          publishedAt: true,
          heroImage: true,
        },
      }),
      payload.find({
        collection: 'categories',
        limit: 8,
        overrideAccess: false,
        select: {
          title: true,
          slug: true,
        },
      }),
    ])

    popularPosts = postsRes.docs
    categories = catsRes.docs
  } catch (error) {
    console.warn('Sidebar data fetch error:', error)
  }

  const relatedPosts = await getRelatedPosts(post)
  const postProducts = await getPostProducts(post.id)

  const heroImage = post.heroImage && typeof post.heroImage === 'object' ? post.heroImage : null
  const authorName =
    post.populatedAuthors?.[0]?.name || 'SoloStack Editorial Lab'
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta?.description || undefined,
    image: heroImage?.url ? `${getServerSideURL()}${heroImage.url}` : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    wordCount,
    mainEntityOfPage: `${getServerSideURL()}${url}`,
    author: { '@type': 'Person', name: authorName },
    publisher: {
      '@type': 'Organization',
      name: 'SoloStack',
      url: 'https://solostack.au',
    },
  }

  return (
    <article className="pt-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Editorial Header matching reference design */}
      <PostHero post={post} readingTime={readingTime} />

      {/* 3-Column Layout: share rail + article + sticky sidebar */}
      <div className="container mt-12 flex flex-col lg:flex-row gap-8 xl:gap-12">
        {/* Left rail: reading time + share links */}
        <div className="shrink-0 lg:w-20">
          <div className="lg:sticky lg:top-28">
            <PostShareRail title={post.title} readingTime={readingTime} slug={decodedSlug} />
          </div>
        </div>

        {/* Main Article Column */}
        <div className="w-full min-w-0 lg:flex-1">
          {/* The Short Answer / Quick Verdict Callout Box */}
          {post.meta?.description && (
            <div className="mb-8 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 p-6 sm:p-7 shadow-2xs">
              <p className="text-xs font-bold tracking-wider text-emerald-800 dark:text-emerald-400 uppercase">
                The Short Answer
              </p>
              <p className="mt-2 text-base leading-relaxed text-neutral-800 dark:text-neutral-200 font-medium">
                {post.meta.description}
              </p>
            </div>
          )}

          {/* Table of Contents */}
          {tocItems.length > 0 && <TableOfContents items={tocItems} />}

          {/* Article RichText Content */}
          <div className="article-body">
            <RichText data={post.content} enableGutter={false} />
          </div>

          {/* Approved products linked to this post, with their offer links */}
          <PostProducts products={postProducts} />

          {/* Author Bio Box */}
          <AuthorBio
            authorName={
              post.populatedAuthors && post.populatedAuthors.length > 0 && post.populatedAuthors[0].name
                ? post.populatedAuthors[0].name
                : 'SoloStack Editorial Lab'
            }
          />
        </div>

        {/* Sticky Sidebar (40% lg / 33% xl) */}
        <PostSidebar popularPosts={popularPosts} categories={categories} />
      </div>

      {/* Related posts slider, above the footer */}
      <RelatedPostsSlider posts={relatedPosts} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, path: `posts/${decodedSlug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  try {
    const { isEnabled: draft } = await draftMode()

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'posts',
      draft,
      limit: 1,
      overrideAccess: draft,
      pagination: false,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.warn('Database query error for post slug:', slug, error)
    return null
  }
})

const RELATED_LIMIT = 8

// Editor-picked related posts first, then posts sharing a category, then the latest posts. Max 8, current post excluded.
async function getRelatedPosts(post: Post): Promise<RelatedSlide[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const select = {
      title: true,
      slug: true,
      heroImage: true,
      meta: true,
      categories: true,
      publishedAt: true,
    } as const

    const picked = (post.relatedPosts || []).filter(
      (p): p is Post => typeof p === 'object' && p.id !== post.id,
    )
    const result: RelatedSlide[] = picked.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      heroImage: p.heroImage,
      meta: p.meta,
      categories: p.categories,
      publishedAt: p.publishedAt,
    }))
    const seen = new Set<number>([post.id, ...result.map((p) => p.id)])

    const categoryIds = (post.categories || []).map((c) => (typeof c === 'object' ? c.id : c))

    const fill = async (where: any) => {
      if (result.length >= RELATED_LIMIT) return
      const res = await payload.find({
        collection: 'posts',
        depth: 1,
        limit: RELATED_LIMIT * 2,
        overrideAccess: false,
        pagination: false,
        sort: '-publishedAt',
        select,
        where: { id: { not_in: [...seen] }, ...where },
      })
      for (const doc of res.docs) {
        if (result.length >= RELATED_LIMIT) break
        seen.add(doc.id)
        result.push(doc as RelatedSlide)
      }
    }

    if (categoryIds.length) await fill({ categories: { in: categoryIds } })
    await fill({})

    return result.slice(0, RELATED_LIMIT)
  } catch (error) {
    console.warn('Related posts fetch error:', error)
    return []
  }
}

// Approved products whose "Related posts" include this post. Products are admin-only, so read with overrideAccess
// and select only the public-safe fields.
async function getPostProducts(postId: number): Promise<PostProduct[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const res = await payload.find({
      collection: 'products' as any,
      depth: 1,
      limit: 12,
      overrideAccess: true,
      pagination: false,
      sort: 'name',
      where: { and: [{ relatedPosts: { contains: postId } }, { status: { not_in: ['rejected', 'discontinued'] } }] },
      select: { name: true, brand: true, summary: true, image: true, offers: true } as any,
    })
    return res.docs as unknown as PostProduct[]
  } catch (error) {
    console.warn('Post products fetch error:', error)
    return []
  }
}
