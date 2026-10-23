import React from 'react'

import { Accordion } from '@/components/Accordion'
import RichText from '@/components/RichText'

export type FaqItem = {
  question: string
  // A Lexical editor state holding the answer paragraphs, lists and links.
  answer: any
}

const FAQ_HEADING = /^(frequently asked questions|questions people ask|faqs?|questions and answers)(\s*\(faqs?\))?$/i

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

function textOf(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return Array.isArray(node.children) ? node.children.map(textOf).join('') : ''
}

/**
 * Lifts the FAQ section out of an article. The editors write it as an H2 ("Questions people ask") followed by an H3 per
 * question and the answer nodes under it. Returns the content split around it, or null when the article has no FAQ in
 * that shape (then the article renders exactly as before).
 */
export function splitFaq(content: any): {
  before: any
  after: any | null
  heading: string
  items: FaqItem[]
} | null {
  const root = content?.root
  const nodes: any[] = root?.children ?? []
  const start = nodes.findIndex((n) => n.type === 'heading' && n.tag === 'h2' && FAQ_HEADING.test(textOf(n).trim()))
  if (start < 0) return null

  let end = nodes.findIndex((n, i) => i > start && n.type === 'heading' && n.tag === 'h2')
  if (end < 0) end = nodes.length

  const items: FaqItem[] = []
  for (const n of nodes.slice(start + 1, end)) {
    if (n.type === 'heading' && n.tag === 'h3') {
      const question = textOf(n).trim()
      if (question) items.push({ question, answer: { root: { ...root, children: [] } } })
    } else if (items.length) {
      items[items.length - 1].answer.root.children.push(n)
    } else {
      return null // text before the first question: not a plain FAQ list, leave the article alone
    }
  }
  if (!items.length || items.some((i) => !i.answer.root.children.length)) return null

  const withChildren = (children: any[]) => ({ ...content, root: { ...root, children } })
  return {
    before: withChildren(nodes.slice(0, start)),
    after: end < nodes.length ? withChildren(nodes.slice(end)) : null,
    heading: textOf(nodes[start]).trim(),
    items,
  }
}

/** The FAQ section of a post: a heading, then the shared accordion with each answer rendered from the editor content. */
export function PostFaq({ heading, items }: { heading: string; items: FaqItem[] }) {
  const id = slugify(heading)
  return (
    <section aria-labelledby={id} className="mt-12">
      <div className="prose md:prose-md dark:prose-invert max-w-none">
        <h2 id={id} className="scroll-mt-28 !mb-2">
          {heading}
        </h2>
      </div>
      <Accordion
        className="my-5"
        items={items.map((item) => ({
          question: item.question,
          answer: (
            <RichText
              data={item.answer}
              enableGutter={false}
              className="max-w-none prose-p:my-0 prose-p:text-[0.9375rem] prose-p:leading-[1.7] prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-ul:my-2 prose-ol:my-2 [&>p+p]:mt-[0.85rem]"
            />
          ),
        }))}
      />
    </section>
  )
}
