// Pure helpers for the SoloStack article writer (generate-article.mjs): topic file parsing, slugs, page-text and JSON
// extraction, article-length targets and the rules checker. No network, no database: data in, data out.

export const CATEGORIES = ['creator-media-lab', 'solopreneur-operations', 'ai-automation', 'stacks', 'websites-hosting', 'marketing-growth']

// Article types and the usual minimum length of each (the "medium" length).
export const TYPES = {
  guide: { minWords: 1100, pattern: '{Topic}: A Practical Guide for Solo Businesses' },
  'how-to': { minWords: 900, pattern: 'How to {task} (Step by Step)' },
  comparison: { minWords: 1000, pattern: '{A} vs {B}: Which Is Better for {use}?' },
  explainer: { minWords: 800, pattern: 'What Is {term}? {benefit} Explained' },
  roundup: { minWords: 1100, pattern: 'Best {tools} for {use} (2026)' },
}

export const LENGTHS = { short: 0.65, medium: 1, long: 1.5 }
export function lengthSpec(type, length = 'medium') {
  const base = TYPES[type].minWords
  const min = Math.round((base * (LENGTHS[length] ?? 1)) / 50) * 50
  return { min: Math.max(min, 500), target: Math.round((Math.max(min, 500) * 1.15) / 50) * 50 }
}

// ---- topics.txt: category | type | title | main keyword | note ------------------------------------------------------
export function parseTopics(text) {
  const topics = []
  const problems = []
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const parts = line.split('|').map((s) => s.trim())
    const [category, type, title, keyword = '', note = ''] = parts
    const at = `topics line ${i + 1}`
    if (parts.length < 3) return problems.push(`${at}: needs "category | type | title" (got ${parts.length} fields)`)
    if (!CATEGORIES.includes(category)) return problems.push(`${at}: unknown category "${category}"`)
    if (!TYPES[type]) return problems.push(`${at}: unknown type "${type}" (${Object.keys(TYPES).join(', ')})`)
    if (!title) return problems.push(`${at}: empty title`)
    topics.push({ category, type, title, keyword, note, line: i + 1, raw: line })
  })
  return { topics, problems }
}

// Comments a finished topic out, as the NXT and OhmNook writers do. Returns the new text.
export function markTopicDone(text, topic, how, date) {
  const lines = text.split('\n')
  const at = lines.findIndex((l) => l.trim() === topic.raw)
  if (at < 0) return text
  lines[at] = `# done ${date} ${how}: ${topic.raw}`
  return lines.join('\n')
}

const FILLER = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'for', 'to', 'in', 'on', 'with', 'your', 'you', 'is', 'are', 'how', 'what', 'which', 'do', 'does', 'i', 'solo', 'guide'])
// "How to Choose a Domain Name for Your Business (2026)" -> "choose-domain-name-business". No year, 3-6 words.
export function slugFromTopic(title) {
  const words = title.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\b20\d\d\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean)
  const kept = words.filter((w) => !FILLER.has(w))
  return (kept.length >= 3 ? kept : words).slice(0, 6).join('-')
}
export const isSlug = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s ?? '')
export const wordCount = (text) => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length

export function htmlToText(html, max = 9000) {
  return html
    .replace(/<(script|style|noscript|svg|template|head)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t\f\v]+/g, ' ').replace(/\n\s*/g, '\n').trim().slice(0, max)
}

export function extractJson(text) {
  if (!text) throw new Error('The model returned no text.')
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = (fenced ? fenced[1] : text).trim()
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('No JSON object found in the model reply.')
  const raw = candidate.slice(start, end + 1)
  try {
    return JSON.parse(raw)
  } catch {
    return JSON.parse(raw.replace(/,\s*([}\]])/g, '$1'))
  }
}

// ---- the rules checker ----------------------------------------------------------------------------------------------
const INCOME_CLAIM = /\b(guarantee[sd]?|guaranteed)\b[^.]{0,50}\b(income|revenue|results?|rankings?|profit|earnings?|clients?)\b|\b(get rich|make \$?\d[\d,]*k?\s*(?:a|per|\/)\s*(?:month|day|week)|passive income (?:while you sleep|on autopilot)|overnight success)\b/i
const TESTING_CLAIM = /\bwe (?:have )?(?:tested|measured|benchmarked|used|lived with|ran|timed)\b|\bin our (?:tests?|testing|lab)\b|\bour (?:testing|test results|benchmarks?)\b|\bhands-on (?:testing|tests?|experience)\b|\bI (?:have )?(?:tested|used|tried)\b/i
const PRICE_AMOUNT = /(?:[$£€]\s?\d|\b\d[\d,.]*\s?(?:usd|aud|eur|gbp|dollars?|euros?|pounds)\b)/i
const ADVICE_CLAIM = /\b(this is (?:legal|tax|financial) advice|you (?:must|have to) (?:register|lodge|file) )/i
const AI_ISMS = /\b(in today's fast-paced world|game[- ]changer|delve|look no further|in conclusion|unlock the power|seamless(?:ly)?|elevate your|revolutioni[sz]e|navigate the (?:world|landscape) of|it's worth noting)\b/i

/**
 * Checks one generated article. ctx: { type, minWords, knownPaths: Set of internal paths, existingSlugs: Set, images }.
 * Returns { errors, warnings }. Errors keep the article from being saved.
 */
export function validateArticle(a, ctx) {
  const errors = []
  const warnings = []
  const err = (m) => errors.push(m)
  const warn = (m) => warnings.push(m)
  const spec = TYPES[ctx.type]
  for (const f of ['title', 'slug', 'body']) if (!a?.[f] || typeof a[f] !== 'string') err(`missing ${f}`)
  if (!a?.meta?.title || !a?.meta?.description) err('missing meta.title or meta.description')
  if (errors.length) return { errors, warnings }

  const mt = a.meta.title
  if (mt.length < 30 || mt.length > 65) err(`meta.title is ${mt.length} characters (needs 30–65)`)
  const md = a.meta.description
  if (md.length < 110 || md.length > 170) err(`meta.description is ${md.length} characters (needs 110–170)`)
  else if (md.length < 140 || md.length > 165) warn(`meta.description is ${md.length} characters (140–160 reads best)`)
  if (!isSlug(a.slug)) err(`slug "${a.slug}" must be lowercase words joined by hyphens`)
  else {
    if (/\b20\d\d\b/.test(a.slug)) err('slug must not contain a year')
    if (ctx.existingSlugs?.has(a.slug)) err(`a post with slug "${a.slug}" already exists`)
  }
  if (a.title.length > 90) warn('the title is long (aim for under 70 characters)')

  const body = a.body
  const words = wordCount(body)
  const minWords = ctx.minWords ?? spec?.minWords ?? 800
  if (words < minWords) err(`${words} words; this article needs at least ${minWords}`)
  if (/^#\s/m.test(body)) err('the body must not contain an H1 (the title is the H1); use ## and ###')
  const h2 = (body.match(/^##\s+\S/gm) ?? []).length
  if (h2 < 3) err(`${h2} H2 headings; use at least 3 descriptive ones`)
  if (!/\n\s*\n/.test(body)) err('the body has no paragraph breaks')

  // Links: internal paths only (the tool and deal pages carry the affiliate links), and only paths that exist.
  const mdLinks = [...body.matchAll(/\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g)]
  const external = mdLinks.filter(([, , url]) => /^(https?:)?\/\//i.test(url))
  if (external.length) err(`external links in the body (${external.slice(0, 2).map((m) => m[2]).join(', ')}); link only to the internal paths you were given`)
  if (/(^|[\s(])https?:\/\/\S+/i.test(body.replace(/\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, ''))) err('a bare URL appears in the body')
  const internal = mdLinks.filter(([, , url]) => url.startsWith('/'))
  for (const [, , url] of internal) {
    const path = url.replace(/[?#].*$/, '').replace(/\/$/, '') || '/'
    if (ctx.knownPaths && !ctx.knownPaths.has(path)) err(`internal link ${url} is not an existing page`)
  }
  if (internal.length < 2) warn(`${internal.length} internal links (aim for 2–5)`)

  const all = [a.title, a.callout?.title, a.callout?.text, body, ...(a.faqs ?? []).flatMap((f) => [f.question, f.answer])].join('\n')
  if (INCOME_CLAIM.test(all)) err('an income or results guarantee; do not promise earnings or rankings')
  if (TESTING_CLAIM.test(all)) err('claims hands-on testing; only report what makers and sources state')
  if (PRICE_AMOUNT.test(all)) warn('a price or currency amount appears; prices change, so leave them out unless a source states them')
  if (ADVICE_CLAIM.test(all)) warn('reads like legal or tax instruction; add "check with a professional" and avoid commands')
  if (AI_ISMS.test(all)) warn('stock AI phrasing found (e.g. "seamless", "game-changer", "delve")')

  // Callout and FAQs.
  if (a.callout && (!['info', 'success', 'warning'].includes(a.callout.style) || !a.callout.title || !a.callout.text)) err('callout needs style (info, success or warning), title and text')
  const faqs = a.faqs ?? []
  if (faqs.length && (faqs.length < 3 || faqs.length > 6)) err(`${faqs.length} FAQs; use 3–6 or none`)
  faqs.forEach((f, i) => {
    if (!f?.question || !/\?$/.test(f.question.trim())) err(`FAQ ${i + 1}: the question must end with "?"`)
    if (!f?.answer || wordCount(f.answer) < 15) err(`FAQ ${i + 1}: the answer is too short`)
  })

  // Images.
  if (ctx.images && ctx.images !== 'none') {
    const h = a.image
    if (!h || typeof h.prompt !== 'string' || h.prompt.length < 30 || typeof h.alt !== 'string' || h.alt.length < 10 || h.alt.length > 125) err('image needs a "prompt" (30+ characters) and "alt" text (10–125 characters)')
    else if (/\b(logo|logos|brand|watermark|caption|headline|screenshot)\b/i.test(h.prompt)) err('the image prompt asks for a logo, text or a brand')
  }
  return { errors, warnings }
}
