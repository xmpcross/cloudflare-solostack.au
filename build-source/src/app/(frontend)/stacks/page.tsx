import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { StackCard } from '@/components/marketing/StackCard'
import { Layers } from 'lucide-react'
import { DirectoryGuide } from '@/components/marketing/DirectoryGuide'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/stacks' },
    title: 'Solopreneur Stack Directory & Operational Blueprints | SoloStack',
    description:
      'Curated software and hardware toolchains for 1-person businesses, creators, and remote agency operators.',
  }
}

export default async function StacksPage() {
  let stacks: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'stacks',
      depth: 2,
      limit: 100,
    })
    stacks = result.docs
  } catch (error) {
    console.warn('Database connection error in /stacks:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Layers className="h-4 w-4" />
          <span>Tested Workflows</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Solopreneur Stack Directory
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Battle-tested software recipes and hardware configurations powering high-revenue 1-person businesses.
        </p>
      </div>

      {/* Grid */}
      {stacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stacks.map((stack) => (
            <StackCard
              key={stack.id}
              title={stack.title}
              slug={stack.slug}
              businessModel={stack.businessModel}
              description={stack.description}
              tools={stack.tools?.map((t: any) => ({ name: t.name, startingPrice: t.startingPrice }))}
              hardware={stack.hardware?.map((h: any) => ({ name: h.name, priceRange: h.priceRange }))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No stack blueprints found yet.</p>
        </div>
      )}

      <DirectoryGuide
        heading="What is a stack blueprint?"
        intro="A stack blueprint is a complete, ordered set of software and hardware for one outcome, such as running a video channel or a consulting practice. Instead of reviewing tools one at a time, each blueprint shows how the pieces fit together."
        points={[
          {
            title: 'Built around an outcome',
            body: 'Every blueprint starts from the result a solo operator wants, then works back to the minimum set of tools and equipment needed to reach it.',
          },
          {
            title: 'Software and hardware together',
            body: 'Workflows are limited as much by the microphone, camera or desk as by the apps. Blueprints list both, with price ranges so you can budget the whole setup.',
          },
          {
            title: 'Adapt, do not copy',
            body: 'Treat a blueprint as a starting point. Swap in tools you already own, and add the pieces you are missing one at a time rather than buying everything at once.',
          },
        ]}
      />
    </div>
  )
}
