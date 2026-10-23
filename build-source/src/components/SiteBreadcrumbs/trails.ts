// One place that knows the breadcrumb trail of every page. The site layout builds this map once per render and the bar
// under the header picks the trail that matches the page's path. A page that is not here (the home page, the 404 page)
// shows no bar.
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

export type Crumb = { name: string; href?: string }
export type TrailMap = Record<string, Crumb[]>

const STATIC: TrailMap = {
  '/posts': [{ name: 'Articles' }],
  '/tools': [{ name: 'Software Directory' }],
  '/stacks': [{ name: 'Stacks' }],
  '/comparisons': [{ name: 'Comparisons' }],
  '/best-gear': [{ name: 'Best Gear' }],
  '/search': [{ name: 'Search' }],
  '/about': [{ name: 'About' }],
  '/contact': [{ name: 'Contact' }],
  '/faqs': [{ name: 'FAQs' }],
  '/privacy-policy': [{ name: 'Privacy Policy' }],
  '/terms': [{ name: 'Terms of Service' }],
  '/cookie-policy': [{ name: 'Cookie Policy' }],
  '/affiliate-disclosure': [{ name: 'Affiliate Disclosure' }],
}

export const getTrails = cache(async (): Promise<TrailMap> => {
  const trails: TrailMap = { ...STATIC }
  try {
    const payload = await getPayload({ config: configPromise })
    // Titles and slugs only. Posts and pages have drafts, so they are limited to published ones; the other collections have no
    // draft state. Each collection is read on its own so one failure does not drop the rest.
    const find = async (collection: any, select: any, published = false) => {
      try {
        return (await payload.find({
          collection,
          depth: 1,
          limit: 1000,
          pagination: false,
          overrideAccess: true,
          select,
          ...(published ? { where: { _status: { equals: 'published' } } } : {}),
        })).docs as any[]
      } catch (error) {
        console.warn(`Breadcrumb trails: could not read ${collection}.`, error)
        return []
      }
    }

    const [posts, tools, stacks, comparisons, pages] = await Promise.all([
      find('posts', { title: true, slug: true, categories: true }, true),
      find('tools', { name: true, slug: true }),
      find('stacks', { title: true, slug: true }),
      find('comparisons', { title: true, slug: true }),
      find('pages', { title: true, slug: true }, true),
    ])

    for (const p of posts) {
      const cat = Array.isArray(p.categories) && typeof p.categories[0] === 'object' ? p.categories[0] : null
      trails[`/posts/${p.slug}`] = [
        { name: 'Articles', href: '/posts' },
        ...(cat?.title && cat?.slug ? [{ name: cat.title, href: `/posts/category/${cat.slug}` }] : []),
        { name: p.title },
      ]
    }
    for (const t of tools) trails[`/tools/${t.slug}`] = [{ name: 'Software Directory', href: '/tools' }, { name: t.name }]
    for (const s of stacks) trails[`/stacks/${s.slug}`] = [{ name: 'Stacks', href: '/stacks' }, { name: s.title }]
    for (const c of comparisons) trails[`/comparisons/${c.slug}`] = [{ name: 'Comparisons', href: '/comparisons' }, { name: c.title }]
    for (const pg of pages) {
      if (pg.slug && pg.slug !== 'home' && !trails[`/${pg.slug}`]) trails[`/${pg.slug}`] = [{ name: pg.title }]
    }
  } catch (error) {
    console.warn('Breadcrumb trails: database unavailable, using the fixed pages only.', error)
  }
  return trails
})
