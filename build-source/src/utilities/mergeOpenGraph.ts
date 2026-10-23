import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  locale: 'en_AU',
  description: 'Curated blueprints, software tools, hardware reviews, and AI automation guides for 1-person creators, solopreneurs, and remote founders.',
  images: [
    {
      url: `${getServerSideURL()}/media/solo-creator-4k-editing-pipeline.webp`,
    },
  ],
  siteName: 'SoloStack',
  title: 'SoloStack | Tech Stacks, AI Automation & Hardware for Solo Operators',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
