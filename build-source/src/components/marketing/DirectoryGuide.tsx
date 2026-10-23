import Link from 'next/link'
import React from 'react'

type Props = {
  heading: string
  intro: string
  points: { title: string; body: string }[]
}

export function DirectoryGuide({ heading, intro, points }: Props) {
  return (
    <section className="mt-20 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{heading}</h2>
      <p className="text-muted-foreground leading-relaxed">{intro}</p>
      <div className="space-y-5">
        {points.map((point) => (
          <div key={point.title}>
            <h3 className="text-lg font-semibold">{point.title}</h3>
            <p className="mt-1 text-muted-foreground leading-relaxed">{point.body}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Some links on this page are affiliate links, which means SoloStack may earn a commission
        at no extra cost to you. Read our{' '}
        <Link href="/affiliate-disclosure" className="underline">
          affiliate disclosure
        </Link>{' '}
        for how this works.
      </p>
    </section>
  )
}
