import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getPagesSitemap = unstable_cache(
  async () => {
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    let results: any = { docs: [] }
    try {
      const payload = await getPayload({ config })
      results = await payload.find({
        collection: 'pages',
        overrideAccess: false,
        draft: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        where: {
          _status: {
            equals: 'published',
          },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      console.warn('Database error in pages-sitemap:', error)
    }

    // Stable dates: static pages use the date their content last changed, listings use their newest record.
    const dateFallback = '2026-10-23T00:00:00.000Z'
    const newest = (docs: any[]) =>
      docs.map((d) => d?.updatedAt).filter(Boolean).sort().pop() || dateFallback

    const directoryEntries: { loc: string; lastmod: string }[] = []
    const latest: Record<string, string> = {}
    try {
      const payload = await getPayload({ config })
      for (const collection of ['tools', 'stacks', 'comparisons', 'posts'] as const) {
        const res = await payload.find({
          collection,
          depth: 0,
          limit: 1000,
          pagination: false,
          select: { slug: true, updatedAt: true },
        })
        latest[collection] = newest(res.docs as any[])
        if (collection === 'posts') continue
        for (const doc of res.docs as any[]) {
          if (!doc?.slug) continue
          directoryEntries.push({
            loc: `${SITE_URL}/${collection}/${doc.slug}`,
            lastmod: doc.updatedAt || dateFallback,
          })
        }
      }
      const cats = await payload.find({
        collection: 'categories',
        depth: 0,
        limit: 100,
        pagination: false,
        select: { slug: true },
      })
      for (const c of cats.docs as any[]) {
        if (!c?.slug) continue
        directoryEntries.push({
          loc: `${SITE_URL}/posts/category/${c.slug}`,
          lastmod: latest.posts || dateFallback,
        })
      }
    } catch (error) {
      console.warn('Database error in pages-sitemap directories:', error)
    }

    const defaultSitemap = [
      { loc: `${SITE_URL}/posts`, lastmod: latest.posts || dateFallback },
      { loc: `${SITE_URL}/tools`, lastmod: latest.tools || dateFallback },
      { loc: `${SITE_URL}/stacks`, lastmod: latest.stacks || dateFallback },
      { loc: `${SITE_URL}/comparisons`, lastmod: latest.comparisons || dateFallback },
      { loc: `${SITE_URL}/best-gear`, lastmod: dateFallback },
      { loc: `${SITE_URL}/deals`, lastmod: dateFallback },
      { loc: `${SITE_URL}/about`, lastmod: dateFallback },
      { loc: `${SITE_URL}/cookie-policy`, lastmod: dateFallback },
    ]

    const sitemap = results.docs
      ? results.docs
          .filter((page: any) => Boolean(page?.slug))
          .map((page: any) => {
            return {
              loc: page?.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    // /search is excluded on purpose: it is noindex
    return [...defaultSitemap, ...directoryEntries, ...sitemap.filter((e: any) => !e.loc.endsWith('/search'))]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
