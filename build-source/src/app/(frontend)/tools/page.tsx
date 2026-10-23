import type { Metadata } from 'next'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { AffiliateCTA } from '@/components/marketing/AffiliateCTA'
import { Wrench } from 'lucide-react'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { DirectoryGuide } from '@/components/marketing/DirectoryGuide'

export const revalidate = 600

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: '/tools' },
    title: 'Software & SaaS Tool Directory for Solo Operators | SoloStack',
    description:
      'Explore top-rated B2B software, automation tools, and productivity SaaS for 1-person businesses.',
  }
}

export default async function ToolsDirectoryPage() {
  let tools: any[] = []

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'tools',
      depth: 1,
      limit: 100,
    })
    tools = result.docs
  } catch (error) {
    console.warn('Database connection error in /tools:', error)
  }

  return (
    <div className="pt-20 pb-24 container max-w-5xl mx-auto px-4">
      <Breadcrumbs items={[{ name: 'Software Directory' }]} className="mb-6" />
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-sm font-semibold border border-amber-500/20">
          <Wrench className="h-4 w-4" />
          <span>Curated SaaS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          B2B Software & Tool Directory
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tested productivity tools, CRM systems, automation engines, and content creation platforms.
        </p>
      </div>

      {tools.length > 0 ? (
        <div className="space-y-6">
          {tools.map((tool) => (
            <AffiliateCTA
              key={tool.id}
              name={tool.name}
              tagline={tool.tagline}
              pricingType={tool.pricingType}
              startingPrice={tool.startingPrice}
              rating={tool.rating}
              affiliateUrl={tool.affiliateUrl || '#'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No tools listed yet.</p>
        </div>
      )}

      <DirectoryGuide
        heading="How to choose software for a one-person business"
        intro="A solo operator pays for every tool twice: once in the subscription and again in the time it takes to learn and maintain it. The tools in this directory are listed because they suit small teams and solo founders, not enterprise rollouts."
        points={[
          {
            title: 'Start with the job, not the category',
            body: 'Decide which task is costing you the most hours, such as invoicing, editing, scheduling or email, and look for the tool that removes that task. A smaller stack that you use every week beats a large one you do not.',
          },
          {
            title: 'Check pricing at your real scale',
            body: 'Most tools price by seat, contact count or usage. Each listing shows a starting price, so compare what you will pay at your current size and again if the business doubles.',
          },
          {
            title: 'Prefer tools that connect',
            body: 'Look for native integrations or a solid automation connector. Moving data by hand between tools is the hidden cost that grows fastest as a solo business takes on more clients.',
          },
          {
            title: 'Keep an exit route',
            body: 'Choose products that let you export your data in a standard format, so changing tools later does not mean rebuilding your records from scratch.',
          },
        ]}
      />
    </div>
  )
}
