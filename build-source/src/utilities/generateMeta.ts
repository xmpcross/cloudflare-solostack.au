import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/media/solo-creator-4k-editing-pipeline.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

const SITE_NAME = 'SoloStack'
const MAX_TITLE_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 160
// Cut at a word boundary so the search snippet is not clipped mid-word
const fitDescription = (d?: string | null) => {
  if (!d || d.length <= MAX_DESCRIPTION_LENGTH) return d ?? undefined
  const cut = d.slice(0, MAX_DESCRIPTION_LENGTH - 1)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\- ]+$/, '') + '…'
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  path?: string
}): Promise<Metadata> => {
  const { doc, path } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const baseTitle = doc?.meta?.title || (doc as { title?: string } | null)?.title || SITE_NAME
  const suffixed = `${baseTitle} | ${SITE_NAME}`
  // Skip the brand suffix when it would push the title past what search results display
  const title = baseTitle === SITE_NAME || suffixed.length > MAX_TITLE_LENGTH ? baseTitle : suffixed

  const canonicalPath = path ?? (Array.isArray(doc?.slug) ? doc?.slug.join('/') : doc?.slug)
  const canonical = canonicalPath ? `/${canonicalPath}`.replace(/^\/\/+/, '/') : undefined

  return {
    alternates: canonical ? { canonical } : undefined,
    description: fitDescription(doc?.meta?.description),
    openGraph: mergeOpenGraph({
      type: path?.startsWith('posts/') ? 'article' : 'website',
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonical ?? '/',
    }),
    title,
  }
}
