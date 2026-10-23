// Picks the products and tools to show under a post, without anyone linking them by hand. It scores every approved
// product and every tool against the post's title, headings and text, keeps the best few, and says nothing when
// nothing fits. Products linked by hand ("Related posts" on the product) are always shown first.

export type Candidate = {
  type: 'product' | 'tool'
  id: number
  kind: string
  strong: RegExp | null // the product or tool is named in the article
  categoryId: number | null
}

// kind -> [regex on the product or tool name, regex on article text that signals the topic]
export const FAMILIES: Record<string, [RegExp, RegExp]> = {
  microphone: [/microphone|\bmic\b/, /\bmicrophones?\b|\bmics?\b|\bxlr\b|audio chain|dynamic mic/g],
  webcam: [/webcam|facecam|streamcam/, /\bwebcams?\b|video calls?|on camera|face ?cam/g],
  camera: [/gopro|osmo|powershot|action camera/, /\bcameras?\b|mirrorless|\bvlog|footage|filming|\b4k video/g],
  light: [/video light|led/, /\blighting\b|key light|\bsoftbox|video lights?/g],
  headphones: [/headphones/, /\bheadphones\b|monitoring your audio/g],
  interface: [/audio interface/, /audio interface|\bpreamp/g],
  desk: [/standing desk|desk mat/, /standing desk|sit-stand|\bdesks?\b|desk setup|workstation/g],
  chair: [/chair/, /ergonomic|\bchairs?\b|posture|workstation/g],
  monitor: [/monitor|viewfinity|zenscreen/, /\bmonitors?\b|second screen|dual-monitor|workstation/g],
  peripheral: [/mouse|keyboard|laptop stand|monitor arm/, /ergonomic|\bkeyboards?\b|\bmouse\b|laptop stand|workstation/g],
  dock: [/dock|hub/, /\bdocks?\b|docking|usb-c hub|workstation/g],
  wifi: [/wi-fi|mesh/, /\bwi-?fi\b|\brouter\b|mesh network/g],
  host: [/bluehost|dreamhost|a2 hosting|wp engine|shopify/, /\bweb hosting\b|\bhosting\b|\bwordpress\b|website builder|online store|ecommerce/g],
  domain: [/namecheap|ventraip|crazy domains|godaddy|porkbun/, /\bdomains?\b|registrar|\bdns\b/g],
  'tool-record': [/riverside/, /record(ing)? (a )?(podcast|interview|remote)|remote guest|local recording|podcast recording|video podcast/g],
  'tool-edit': [/descript/, /transcript|filler words?|edit(ing)? (your )?(podcast|video|audio)|video editing|podcast editing|text-based/g],
  'tool-auto': [/make\.com/, /\bautomat\w+|\bzapier\b|\bwebhooks?\b|\bworkflows?\b|no-code|zero-code/g],
  'tool-design': [/canva/, /\bthumbnails?\b|\bgraphics?\b|\btemplates?\b|social posts?|presentations?|carousel|brand kit|landing pages?|lead magnets?/g],
  'tool-biz': [/bonsai/, /\bproposals?\b|\bcontracts?\b|\binvoic\w+|client onboarding|freelanc\w+|\bretainer\b|\bscope\b/g],
}

const TOOL_KIND: Record<string, string> = {
  'riverside-fm': 'tool-record',
  descript: 'tool-edit',
  'make-com': 'tool-auto',
  'canva-pro': 'tool-design',
  bonsai: 'tool-biz',
}
const TOOL_NAMED: Record<string, RegExp> = {
  'tool-record': /\briverside\b/g,
  'tool-edit': /\bdescript\b/g,
  'tool-auto': /\bmake\.com\b/g,
  'tool-design': /\bcanva\b/g,
  'tool-biz': /\bbonsai\b/g,
}

// Tokens with a digit that are not a model name.
const NOT_MODEL = new Set(['4k', '1080p', '4th', '32"', '15.6"', 'm18', 'e7', 's8', 'be14000', 'be68', 'v10', 'vl49'])
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const kindOf = (name: string): string | null => {
  const n = name.toLowerCase()
  for (const [kind, [nameRe]] of Object.entries(FAMILIES)) if (nameRe.test(n)) return kind
  return null
}

/** Builds the matcher for an approved product, or null when its kind is unknown (then only a manual link shows it). */
export function productCandidate(p: { id: number; name: string; category?: any }): Candidate | null {
  const kind = kindOf(p.name)
  if (!kind) return null
  return buildProductCandidate(p, kind)
}

function buildProductCandidate(p: { id: number; name: string; category?: any }, kind: string): Candidate {
  const lower = p.name.toLowerCase()
  let strong: RegExp | null = null
  if (kind === 'host' || kind === 'domain') strong = new RegExp(`\\b${escape(lower)}\\b`, 'g')
  else if (/yeti/.test(lower)) strong = /\bblue yeti\b|\byeti\b/g
  else if (/podmic/.test(lower)) strong = /\bpodmic\b/g
  else if (/facecam/.test(lower)) strong = /\bfacecam\b/g
  else if (/streamcam/.test(lower)) strong = /\bstreamcam\b/g
  else {
    // a model name: a token with a digit, such as "sm7b", "c920" or "at2040"
    const tokens = (lower.replace(/\(.*?\)/g, '').match(/[a-z0-9+-]*\d[a-z0-9+-]*/g) ?? []).filter((t) => t.length >= 3 && !NOT_MODEL.has(t))
    if (tokens.length) strong = new RegExp(`\\b(${tokens.map(escape).join('|')})\\b`, 'g')
  }
  const cat = p.category
  return { type: 'product', id: p.id, kind, strong, categoryId: typeof cat === 'object' && cat ? cat.id : (cat ?? null) }
}

export function toolCandidate(t: { id: number; slug: string }): Candidate | null {
  const kind = TOOL_KIND[t.slug]
  return kind ? { type: 'tool', id: t.id, kind, strong: TOOL_NAMED[kind], categoryId: null } : null
}

export function textOf(node: any): string {
  if (!node) return ''
  if (typeof node.text === 'string') return node.text
  return Array.isArray(node.children) ? node.children.map(textOf).join(' ') : ''
}

export const count = (re: RegExp, text: string) => (text.match(new RegExp(re.source, 'g')) ?? []).length

/**
 * Returns the best candidates for a post, best first (at most `limit`, two per kind for products and one per kind for
 * tools). postCategoryIds are the ids of the categories the post is in (products use the same categories).
 */
export function pickRelated(
  post: { title: string; content: any },
  candidates: Candidate[],
  postCategoryIds: number[],
  limit = 4,
): Candidate[] {
  const nodes: any[] = post.content?.root?.children ?? []
  const title = (post.title ?? '').toLowerCase()
  const heads = nodes.filter((n) => n.type === 'heading').map(textOf).join(' ').toLowerCase()
  const body = nodes.filter((n) => n.type !== 'heading').map(textOf).join(' ').toLowerCase()

  const scored = candidates.map((c) => {
    const topic = FAMILIES[c.kind][1]
    let score = 0
    if (c.strong) {
      if (count(c.strong, `${title} ${heads}`)) score += 10
      else if (count(c.strong, body)) score += 8
    }
    const t = count(topic, title)
    const h = count(topic, heads)
    const b = count(topic, body)
    const topicScore = Math.min(t, 1) * 4 + Math.min(h, 2) * 3 + (b >= 2 ? Math.min(b, 6) : 0)
    score += topicScore
    if (topicScore && c.categoryId != null && postCategoryIds.includes(c.categoryId)) score += 2
    return { c, score, topicScore }
  })

  const take = (min: number) => {
    const out: Candidate[] = []
    const perKind: Record<string, number> = {}
    for (const { c, score, topicScore } of [...scored].sort((a, b) => b.score - a.score)) {
      if (score < min || (min < 7 && !topicScore)) break
      const cap = c.type === 'product' ? 2 : 1
      if ((perKind[c.kind] ?? 0) >= cap) continue
      out.push(c)
      perKind[c.kind] = (perKind[c.kind] ?? 0) + 1
      if (out.length === limit) break
    }
    return out
  }
  // A strict pass first; if it finds fewer than two, a looser pass on topic alone so every article shows something fitting.
  const strict = take(7)
  return strict.length >= 2 ? strict : take(5)
}
