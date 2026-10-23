import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ArchiveCategory, ArchiveGuide } from '@/components/marketing/PostsArchiveView'
import { mediaUrl } from '@/utilities/gearOffers'

/** Every published guide, newest first, shaped for the archive pages, plus the categories that have guides. */
export async function getGuides(): Promise<{ guides: ArchiveGuide[]; categories: ArchiveCategory[] }> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      draft: false,
      depth: 1,
      limit: 200,
      overrideAccess: true,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
      select: { title: true, slug: true, categories: true, meta: true, heroImage: true, publishedAt: true },
    })

    const guides: ArchiveGuide[] = result.docs.map((p: any) => {
      const c = (p.categories || []).find((x: any) => typeof x === 'object' && x)
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.meta?.description?.replace(/\s+/g, ' '),
        image: mediaUrl(p.heroImage || p.meta?.image),
        category: c ? { title: c.title, slug: c.slug } : null,
        publishedAt: p.publishedAt,
      }
    })

    const map = new Map<string, ArchiveCategory>()
    for (const g of guides) {
      if (!g.category) continue
      const e = map.get(g.category.slug) || { ...g.category, count: 0 }
      e.count++
      map.set(g.category.slug, e)
    }
    const categories = [...map.values()].sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    return { guides, categories }
  } catch (error) {
    console.warn('Database query error for guides:', error)
    return { guides: [], categories: [] }
  }
}
