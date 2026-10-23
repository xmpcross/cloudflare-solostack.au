import React from 'react'

import { cn } from '@/utilities/ui'

export type AccordionItem = { question: string; answer: React.ReactNode }

/**
 * A plain accordion on native <details>, so it needs no JavaScript: hairline dividers, bold questions, a plus that turns
 * into a minus when open. Used for the FAQ section of every post and for the FAQ page.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  return (
    <div className={cn('border-t border-border', className)}>
      {items.map((item) => (
        <details key={item.question} className="group border-b border-border">
          <summary
            className={cn(
              'flex cursor-pointer list-none items-start justify-between gap-4 py-4',
              'text-base font-semibold leading-snug text-foreground transition-colors hover:text-muted-foreground',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
              '[&::-webkit-details-marker]:hidden [&::marker]:content-none',
            )}
          >
            <span>{item.question}</span>
            <span aria-hidden="true" className="relative mt-0.5 h-[18px] w-[18px] flex-none">
              <span className="absolute left-1/2 top-1/2 h-0.5 w-[13px] -translate-x-1/2 -translate-y-1/2 bg-foreground" />
              <span className="absolute left-1/2 top-1/2 h-0.5 w-[13px] -translate-x-1/2 -translate-y-1/2 rotate-90 bg-foreground transition duration-200 group-open:rotate-0 group-open:opacity-0 motion-reduce:transition-none" />
            </span>
          </summary>
          <div className="pb-[1.15rem] text-[0.9375rem] leading-[1.7] text-neutral-700 dark:text-neutral-300 [&_a]:font-medium [&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2 dark:[&_a]:text-emerald-400 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>p+p]:mt-[0.85rem]">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
