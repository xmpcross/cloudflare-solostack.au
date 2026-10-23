// Puts each related product or tool inside the article, next to the paragraph that talks about it, instead of in one
// block at the end. A product is matched to a section (the text under one H2) by the same signals that pick products for
// the post (see relatedProducts): its name appearing in the section, then the section's topic words. It goes after the
// paragraph that mentions it most, at most one per section, and never in the FAQ. Products that fit no section are
// returned unplaced, so the page can still list them below the article.

import { FAMILIES, count, textOf, type Candidate } from '@/utilities/relatedProducts'

export const PRODUCT_MARKER = 'solostack-product'

type Placeable = { id: number }

const FAQ_HEADING = /^(frequently asked questions|questions people ask|faqs?|questions and answers)(\s*\(faqs?\))?$/i

// Lowest topic-only section score that counts as "this section is about the product" (two topic words plus a heading hit,
// or four topic words). A product named in the section always qualifies.
const MIN_SCORE = 8
// Hosts and domain registrars share one set of topic words, so they only go inline where they are named.
const NAMED_ONLY = new Set(['host', 'domain'])
const BLOCKS = new Set(['paragraph', 'list', 'quote'])

type Section = { start: number; end: number; heading: string }

function sectionsOf(nodes: any[]): Section[] {
  const out: Section[] = []
  let current: Section | null = { start: 0, end: 0, heading: '' }
  nodes.forEach((n, i) => {
    if (n.type === 'heading' && n.tag === 'h2') {
      if (current) out.push({ ...current, end: i })
      current = { start: i, end: nodes.length, heading: textOf(n).trim() }
    }
  })
  if (current) out.push({ ...current, end: nodes.length })
  return out.filter((s) => s.end > s.start && !FAQ_HEADING.test(s.heading))
}

function scoreText(c: Candidate, text: string, heading: string): number {
  const topic = FAMILIES[c.kind][1]
  const named = c.strong ? count(c.strong, text) : 0
  let score = named ? 10 : 0
  if (NAMED_ONLY.has(c.kind) && !named) return 0
  const t = count(topic, text)
  score += Math.min(t, 4) * 2
  if (heading && count(topic, heading.toLowerCase())) score += 4
  return score
}

/**
 * Returns the article with a marker node inserted for each placed product (`{ type: PRODUCT_MARKER, productId }`), and the
 * ids that were placed. Does not change the original content.
 */
export function placeProducts(
  content: any,
  products: Placeable[],
  candidates: Map<number, Candidate>,
): { content: any; placedIds: Set<number> } {
  const nodes: any[] = content?.root?.children ?? []
  const placedIds = new Set<number>()
  if (!nodes.length || !products.length) return { content, placedIds }

  const sections = sectionsOf(nodes)
  const sectionText = sections.map((s) =>
    nodes
      .slice(s.start, s.end)
      .map(textOf)
      .join(' ')
      .toLowerCase(),
  )

  const pairs: { pid: number; si: number; score: number }[] = []
  for (const p of products) {
    const c = candidates.get(p.id)
    if (!c) continue
    sections.forEach((s, si) => {
      const score = scoreText(c, sectionText[si], s.heading)
      if (score >= MIN_SCORE) pairs.push({ pid: p.id, si, score })
    })
  }
  pairs.sort((a, b) => b.score - a.score)

  const usedSections = new Set<number>()
  const chosen: { pid: number; si: number }[] = []
  for (const { pid, si } of pairs) {
    if (placedIds.has(pid) || usedSections.has(si)) continue
    placedIds.add(pid)
    usedSections.add(si)
    chosen.push({ pid, si })
  }

  // For each chosen pair, find the node to insert after: the paragraph that mentions the product most.
  const insertAfter = new Map<number, number>() // node index -> product id
  for (const { pid, si } of chosen) {
    const c = candidates.get(pid)!
    const s = sections[si]
    const topic = FAMILIES[c.kind][1]
    let best = -1
    let bestScore = -1
    for (let i = s.start; i < s.end; i++) {
      const n = nodes[i]
      if (!BLOCKS.has(n.type)) continue
      const text = textOf(n).toLowerCase()
      const sc = (c.strong ? count(c.strong, text) * 5 : 0) + count(topic, text)
      if (sc > bestScore) {
        bestScore = sc
        best = i
      }
    }
    if (best < 0) {
      placedIds.delete(pid)
      continue
    }
    // A paragraph that ends with a colon introduces the list under it: keep them together.
    if (nodes[best].type === 'paragraph' && /:\s*$/.test(textOf(nodes[best])) && nodes[best + 1]?.type === 'list') best += 1
    // One card per position
    while (insertAfter.has(best)) best += 1
    insertAfter.set(best, pid)
  }

  if (!insertAfter.size) return { content, placedIds: new Set() }

  const children: any[] = []
  nodes.forEach((n, i) => {
    children.push(n)
    const pid = insertAfter.get(i)
    if (pid != null) children.push({ type: PRODUCT_MARKER, productId: pid, version: 1 })
  })
  return { content: { ...content, root: { ...content.root, children } }, placedIds }
}

/** Splits an article around its product markers: text segments to render, and the product to show between them. */
export function splitAtProducts(content: any): ({ kind: 'text'; data: any } | { kind: 'product'; productId: number })[] {
  const nodes: any[] = content?.root?.children ?? []
  const out: ({ kind: 'text'; data: any } | { kind: 'product'; productId: number })[] = []
  let buf: any[] = []
  const flush = () => {
    if (buf.length) out.push({ kind: 'text', data: { ...content, root: { ...content.root, children: buf } } })
    buf = []
  }
  for (const n of nodes) {
    if (n.type === PRODUCT_MARKER) {
      flush()
      out.push({ kind: 'product', productId: n.productId })
    } else buf.push(n)
  }
  flush()
  return out
}
