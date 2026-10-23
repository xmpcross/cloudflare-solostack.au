#!/usr/bin/env node
// SoloStack article writer. Takes topics from topics.txt (or one --topic), researches and writes an article with ChatGPT
// (OpenAI API), checks it against the SoloStack rules (lib/writer.mjs), writes a review copy to scripts/drafts/ and, with
// --write, saves it into the SoloStack Payload database as a post and PUBLISHES it (--draft keeps it a draft). The static
// site is NOT rebuilt here: daily.sh starts the database, runs this, rebuilds the static export and deploys it to
// Cloudflare Pages (the Payload app itself is retired; its database is only started for these runs).
//
//   (default)   COSTS MONEY (AI calls). Writes review files in scripts/drafts/. No database writes.
//   --plan      free. Shows what would be written. No AI calls. --mock: no AI and no network, builds a dummy article.
//   --write     saves each passing article as a post and publishes it (--draft: save as a draft only).
//
// Choices (flags, or answer questions with --interactive / -i, or run with no flags in a terminal):
//   --category=ai-automation,stacks   --type=how-to,guide   --count=1   --topic="Title" --category=... --type=...
//   --length=short|medium|long        about 65% / 100% / 150% of the type's usual length
//   --images=none|featured            featured = one generated featured image (fal.ai FLUX, FAL_KEY, costs money; only with --write)
//   --brainstorm [--ideas=5]          the AI proposes new topics per category (avoiding existing posts); saves drafts/brainstorm-*.txt;
//                                     --add appends them to topics.txt; --generate writes articles for them right away
//   --order=random|file               random (default) mixes categories so consecutive articles differ
//   --keep-topics                     do not comment finished topics out in topics.txt (they are marked "# done <date>" by default)
//   --list                            show categories, types and topic counts
//   --force                           rewrite a topic whose review file exists;  --no-repair, --no-research, --research
//   --author-id=<user id>             post author (default: the author of the newest post)
//
// Run it through run.sh (it starts nothing itself: the database must be running; daily.sh and db.sh handle that).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import { CATEGORIES, LENGTHS, TYPES, htmlToText, isSlug, lengthSpec, markTopicDone, parseTopics, slugFromTopic, validateArticle, wordCount } from './lib/writer.mjs'
import { callAI, callJson, checkConfigured, modelName, provider } from './lib/ai.mjs'
import { SYSTEM, brainstormPrompt, repairPrompt, researchPrompt, writePrompt } from './lib/prompt.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const APP = '/kspellman/sites/payload-backup/solostack.au/app'
const DRAFTS = path.join(HERE, 'drafts')

// ---- arguments ----------------------------------------------------------------------------------------------------
const argv = process.argv.slice(2)
const flag = (n) => argv.includes(`--${n}`)
const opt = (n, d = null) => argv.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=') ?? d
if (flag('help') || flag('h')) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 28).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'))
  process.exit(0)
}
const TOPICS_FILE = path.resolve(opt('topics', path.join(HERE, 'topics.txt')))

if (flag('interactive') || flag('i') || (!argv.length && process.stdin.isTTY)) {
  const rl = (await import('node:readline/promises')).createInterface({ input: process.stdin, output: process.stdout })
  const ask = async (q, d = '') => ((await rl.question(`${q}${d ? ` [${d}]` : ''}: `)).trim() || d)
  console.log('SoloStack article writer. Press Enter to accept the [default].\n')
  const mode = await ask('1) Write articles from topics.txt   2) Brainstorm new topics   3) Brainstorm and write them', '1')
  const cats = await ask(`Categories (${CATEGORIES.join(', ')}, a comma list, or all)`, 'all')
  const length = await ask('Length (short, medium, long)', 'medium')
  const images = await ask('Generated featured image (none, featured)', 'none')
  if (mode === '2' || mode === '3') argv.push('--brainstorm', `--ideas=${await ask('Ideas per category', '5')}`)
  if (mode === '3') argv.push('--generate')
  if (mode !== '2') argv.push(`--count=${await ask('How many articles to write', '1')}`)
  argv.push(`--length=${length}`, `--images=${images}`)
  if (cats.toLowerCase() !== 'all') argv.push(`--category=${cats}`)
  if ((await ask('Plan only, no AI calls and no cost? (y/n)', 'n')).toLowerCase().startsWith('y')) argv.push('--plan')
  else if (mode === '2') { if ((await ask('Add the new topics to topics.txt? (y/n)', 'n')).toLowerCase().startsWith('y')) argv.push('--add') }
  else if ((await ask('Save to the database and PUBLISH? (y = publish, d = save drafts, n = review files only)', 'n')).toLowerCase().match(/^[yd]/)) { argv.push('--write'); }
  rl.close()
  console.log(`\nRunning: run.sh ${argv.join(' ')}\n`)
}

const PLAN = flag('plan')
const MOCK = flag('mock')
const WRITE = flag('write')
const FORCE = flag('force')
const NO_REPAIR = flag('no-repair')
const PUBLISH = !flag('draft')
const COUNT = Math.max(1, Number(opt('count', '1')) || 1)
const LENGTH = opt('length', 'medium').toLowerCase()
if (!(LENGTH in LENGTHS)) { console.error(`--length must be ${Object.keys(LENGTHS).join(', ')}.`); process.exit(2) }
const IMAGES = (opt('images', 'none') ?? 'none').toLowerCase()
if (!['none', 'featured'].includes(IMAGES)) { console.error('--images must be none or featured.'); process.exit(2) }
const BRAINSTORM = flag('brainstorm')
const IDEAS = Math.min(20, Math.max(1, Number(opt('ideas', '5')) || 5))
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' })
if (WRITE && (PLAN || MOCK)) { console.error('--write cannot be combined with --plan or --mock.'); process.exit(2) }
if (IMAGES !== 'none' && WRITE && !process.env.FAL_KEY) { console.error('--images needs FAL_KEY in the app .env. Use --images=none or add the key.'); process.exit(2) }

const list = (name) => (opt(name) ? opt(name).split(',').map((x) => x.trim().toLowerCase()).filter(Boolean) : null)
const wantCategories = list('category')
const wantTypes = list('type')
for (const c of wantCategories ?? []) if (!CATEGORIES.includes(c)) { console.error(`Unknown category "${c}". Categories: ${CATEGORIES.join(', ')}`); process.exit(2) }
for (const t of wantTypes ?? []) if (!TYPES[t]) { console.error(`Unknown type "${t}". Types: ${Object.keys(TYPES).join(', ')}`); process.exit(2) }

// ---- topics -------------------------------------------------------------------------------------------------------
let topics
if (opt('topic')) {
  if (!wantCategories?.[0] || !wantTypes?.[0]) { console.error('--topic needs --category=<slug> and --type=<type>.'); process.exit(2) }
  topics = [{ category: wantCategories[0], type: wantTypes[0], title: opt('topic'), keyword: opt('keyword', ''), note: opt('note', ''), line: 0 }]
} else {
  const parsed = parseTopics(fs.readFileSync(TOPICS_FILE, 'utf8'))
  for (const p of parsed.problems) console.warn(`! ${p}`)
  topics = parsed.topics.filter((t) => (!wantCategories || wantCategories.includes(t.category)) && (!wantTypes || wantTypes.includes(t.type)))
}
// Mixed order by default: round robin over the categories, random within each, random category first.
if (!opt('topic') && opt('order', 'random') !== 'file') {
  const by = new Map()
  for (const t of [...topics].sort(() => Math.random() - 0.5)) (by.get(t.category) ?? by.set(t.category, []).get(t.category)).push(t)
  const queues = [...by.values()].sort(() => Math.random() - 0.5)
  topics = []
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) topics.push(q.shift())
}
if (flag('list')) {
  const counts = {}
  for (const t of topics) counts[t.category] = (counts[t.category] ?? 0) + 1
  console.log(`Categories: ${CATEGORIES.join(', ')}\nTypes:      ${Object.keys(TYPES).join(', ')}\n\nTopics selected (${topics.length}):`)
  for (const [k, n] of Object.entries(counts).sort()) console.log(`  ${k.padEnd(26)} ${n}`)
  process.exit(0)
}
if (!PLAN && !MOCK) {
  const bad = checkConfigured()
  if (bad) { console.error(`${bad}. Use --plan (free) or --mock to test without an AI call.`); process.exit(2) }
}

// ---- database -----------------------------------------------------------------------------------------------------
process.chdir(APP)
const appRequire = createRequire(path.join(APP, 'package.json'))
const { getPayload } = await import(appRequire.resolve('payload'))
const { convertMarkdownToLexical, editorConfigFactory } = await import(appRequire.resolve('@payloadcms/richtext-lexical'))
const { default: config } = await import(path.join(APP, 'src/payload.config.ts'))
const payload = await getPayload({ config })
const idOf = (x) => (x && typeof x === 'object' ? x.id : x)
const find = (collection, extra = {}) => payload.find({ collection, limit: 5000, depth: 0, pagination: false, ...extra }).then((r) => r.docs)

const categories = await find('categories')
const catBySlug = new Map(categories.map((c) => [c.slug, c]))
const posts = await find('posts', { draft: true })
const publishedPosts = posts.filter((p) => p._status === 'published')
const existingSlugs = new Set(posts.map((p) => p.slug))
const tools = await find('tools')
const stacks = await find('stacks')
const authorId = Number(opt('author-id')) || idOf(posts.sort((a, b) => b.id - a.id).map((p) => p.authors?.[0]).find(Boolean))
const knownPaths = new Set(['/', '/posts', '/stacks', '/comparisons', '/deals', '/best-gear', '/faqs', ...publishedPosts.map((p) => `/posts/${p.slug}`), ...tools.map((t) => `/tools/${t.slug}`), ...stacks.map((s) => `/stacks/${s.slug}`)])
function relatedFor(category) {
  const cat = catBySlug.get(category)
  const inCat = publishedPosts.filter((p) => (p.categories ?? []).some((c) => idOf(c) === cat?.id))
  const other = publishedPosts.filter((p) => !inCat.includes(p))
  return [
    ...tools.map((t) => ({ title: t.name, path: `/tools/${t.slug}`, kind: 'tool page' })),
    { title: 'Current deals and coupons', path: '/deals', kind: 'deals page' },
    { title: 'Best gear for solo creators', path: '/best-gear', kind: 'gear page' },
    ...stacks.map((s) => ({ title: s.title, path: `/stacks/${s.slug}`, kind: 'tool stack' })),
    ...inCat.slice(0, 10).map((p) => ({ title: p.title, path: `/posts/${p.slug}`, kind: 'guide' })),
    ...other.slice(0, 4).map((p) => ({ title: p.title, path: `/posts/${p.slug}`, kind: 'guide' })),
  ]
}

// ---- helpers: Lexical, images, marking ----------------------------------------------------------------------------------
async function markdownToLexical(markdown) {
  const field = payload.collections.posts.config.flattenedFields.find((f) => f.name === 'content')
  return convertMarkdownToLexical({ editorConfig: editorConfigFactory.fromField({ field }), markdown })
}
const t = (text, format = 0) => ({ type: 'text', detail: 0, format, mode: 'normal', style: '', text, version: 1 })
const p = (children) => ({ type: 'paragraph', format: '', indent: 0, textFormat: 0, version: 1, direction: 'ltr', children })
// The "banner" block the existing posts open with (see app/scripts/generate-category-articles.ts).
const bannerBlock = (style, title, text) => ({
  type: 'block', format: '', version: 2,
  fields: { blockName: title, blockType: 'banner', style, content: { root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children: [p([t(`${title}: `, 1), t(text)])] } } },
})
function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return { mimetype: 'image/jpeg', ext: 'jpg' }
  if (buf[0] === 0x89 && buf[1] === 0x50) return { mimetype: 'image/png', ext: 'png' }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF') return { mimetype: 'image/webp', ext: 'webp' }
  throw new Error('Unrecognised image format')
}
const SAFE_SCENE = 'A tidy desk for a one-person business with a laptop and a notebook, soft natural daylight from a window, neutral tones, uncluttered'
const NO_TEXT = 'No text, letters, words, numbers, labels, watermarks, logos or readable screens anywhere in the image.'
async function makeImage({ prompt, alt, name }) {
  const bad = typeof prompt !== 'string' || prompt.length < 30 || /\b(logo|logos|brand|trademark|watermark|caption|headline|screenshot)\b/i.test(prompt)
  const res = await fetch('https://fal.run/fal-ai/flux/schnell', {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: `${bad ? SAFE_SCENE : prompt}. Realistic editorial photograph, natural light. ${NO_TEXT}`, image_size: 'landscape_16_9', num_images: 1, enable_safety_checker: true }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok) throw new Error(`fal.ai ${res.status}: ${(await res.text()).slice(0, 200)}`)
  const url = (await res.json())?.images?.[0]?.url
  if (!url) throw new Error('fal.ai returned no image')
  const img = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!img.ok) throw new Error(`could not download the image (${img.status})`)
  let buffer = Buffer.from(await img.arrayBuffer())
  let { mimetype, ext } = sniff(buffer)
  try {
    const sharp = (await import(appRequire.resolve('sharp'))).default
    buffer = await sharp(buffer).webp({ quality: 85 }).toBuffer()
    mimetype = 'image/webp'; ext = 'webp'
  } catch {}
  const media = await payload.create({ collection: 'media', data: { alt }, file: { data: buffer, mimetype, name: `${name}.${ext}`, size: buffer.length } })
  return media.id
}
function markDone(topic, how) {
  if (PLAN || MOCK || !topic.raw || flag('keep-topics')) return
  try {
    const text = fs.readFileSync(TOPICS_FILE, 'utf8')
    const next = markTopicDone(text, topic, how, today)
    if (next !== text) { fs.writeFileSync(TOPICS_FILE, next); console.log(`  marked as done in ${path.basename(TOPICS_FILE)}`) }
  } catch (err) {
    console.log(`  could not update ${path.basename(TOPICS_FILE)}: ${err.message}`)
  }
}
const hostOkImage = (a) => { if (a.image && (typeof a.image.prompt !== 'string' || a.image.prompt.length < 30)) a.image.prompt = SAFE_SCENE }

// ---- brainstorm ---------------------------------------------------------------------------------------------------
fs.mkdirSync(DRAFTS, { recursive: true })
if (BRAINSTORM) {
  const cats = wantCategories ?? CATEGORIES
  const known = parseTopics(fs.readFileSync(TOPICS_FILE, 'utf8')).topics
  const found = []
  const types = wantTypes ?? Object.keys(TYPES)
  console.log(`${PLAN ? 'BRAINSTORM PLAN (free)' : MOCK ? 'BRAINSTORM MOCK' : 'BRAINSTORMING (AI calls, costs money)'}: ${IDEAS} ideas for each of ${cats.length} categor${cats.length === 1 ? 'y' : 'ies'}\n`)
  for (const category of cats) {
    const cat = catBySlug.get(category)
    const existing = [...posts.filter((x) => (x.categories ?? []).some((c) => idOf(c) === cat?.id)).map((x) => x.title), ...known.filter((k) => k.category === category).map((k) => k.title), ...found.filter((f) => f.category === category).map((f) => f.title)]
    console.log(`[${category}] ${existing.length} existing titles`)
    if (PLAN) continue
    let ideas
    if (MOCK) ideas = [{ type: types[0], title: `Mock Topic ${found.length + 1} for ${category}`, keyword: 'mock keyword', note: 'mock' }]
    else ideas = (await callJson({ system: 'You are an SEO editor. Reply with JSON only.', user: brainstormPrompt({ category, count: IDEAS, existing, types, today }), web: true, role: 'research', maxTokens: 3000, temperature: 0.7 })).json.topics ?? []
    for (const x of ideas) {
      const title = String(x.title ?? '').trim()
      const slug = slugFromTopic(title)
      const bad = !title || title.split(/\s+/).length < 3 ? 'title too short' : !types.includes(x.type) ? `type "${x.type}" not allowed` : /[|\n]/.test(title + (x.keyword ?? '') + (x.note ?? '')) ? 'contains "|"' : existingSlugs.has(slug) || found.some((f) => slugFromTopic(f.title) === slug) || known.some((k) => slugFromTopic(k.title) === slug) ? 'duplicate of an existing post or topic' : ''
      if (bad) { console.log(`  - dropped "${title}": ${bad}`); continue }
      found.push({ category, type: x.type, title, keyword: String(x.keyword ?? '').trim(), note: String(x.note ?? '').trim(), line: 0, raw: [category, x.type, title, String(x.keyword ?? '').trim(), String(x.note ?? '').trim()].join(' | ') })
      console.log(`  + ${x.type.padEnd(11)} ${title}`)
    }
  }
  if (PLAN) { console.log('\nNothing generated (--plan). Remove --plan to brainstorm.'); process.exit(0) }
  const outFile = path.join(DRAFTS, `brainstorm-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.txt`)
  fs.writeFileSync(outFile, `# Brainstormed ${today}${MOCK ? ' (MOCK)' : ''}: category | type | title | keyword | note\n${found.map((f) => f.raw).join('\n')}\n`)
  console.log(`\n${found.length} new topics saved to ${path.relative(HERE, outFile)}`)
  if (flag('add') && !MOCK && found.length) { fs.appendFileSync(TOPICS_FILE, `\n# ---- brainstormed ${today} ----\n${found.map((f) => f.raw).join('\n')}\n`); console.log(`Added to ${path.basename(TOPICS_FILE)}.`) }
  else if (!flag('add')) console.log('Not added to topics.txt (use --add, or copy the lines you like).')
  if (!flag('generate')) process.exit(0)
  topics = found
}

// ---- a dummy article for --mock -------------------------------------------------------------------------------------
function mockArticle(topic, related) {
  let body = `This is a mock draft of "${topic.title}" for testing the SoloStack writer. Start with [${related[0].title}](${related[0].path}) and see [${related[1].title}](${related[1].path}).\n\n## The short version\n\n- A test list item\n- Another test list item\n\n`
  for (let n = 1; wordCount(body) < lengthSpec(topic.type, LENGTH).min + 50; n++) body += `## Decision ${n}\n\nSection ${n} explains one decision for a one-person business and gives a plain answer you can apply today. It keeps to what a reader needs and nothing more. Another sentence keeps the section a sensible size for the test.\n\n`
  return {
    title: topic.title, slug: slugFromTopic(topic.title),
    meta: { title: `${topic.title.slice(0, 40)} for Solo Business Owners`.slice(0, 64), description: `A mock draft for ${topic.title.toLowerCase()} used to test the SoloStack article writer pipeline end to end without calling an AI model or any website.`.slice(0, 160) },
    callout: { style: 'info', title: 'Mock draft', text: 'This is a test article.' },
    body,
    faqs: [1, 2, 3].map((i) => ({ question: `Mock question ${i}?`, answer: 'A mock answer written with enough words to pass the minimum length check for answers in the writer tests.' })),
    image: { prompt: 'A tidy desk for a one-person business with a laptop and a notebook, soft daylight', alt: 'A tidy desk with a laptop and a notebook' },
  }
}

// ---- one topic ----------------------------------------------------------------------------------------------------
const results = []
const todo = []
for (const topic of topics) {
  const slug0 = slugFromTopic(topic.title)
  if (existingSlugs.has(slug0)) { console.log(`- skip (already a post): ${topic.title}`); continue }
  if (fs.existsSync(path.join(DRAFTS, `${slug0}.json`)) && !FORCE && !MOCK) { console.log(`- skip (review file exists, use --force): ${topic.title}`); continue }
  todo.push({ topic, slug0 })
}
if (!todo.length) { console.log('Nothing to do: every matching topic is already written. Add topics to topics.txt or use --force.'); process.exit(0) }
console.log(`${PLAN ? 'PLAN (free, no AI calls)' : MOCK ? 'MOCK (no AI, no network)' : WRITE ? `WRITING and ${PUBLISH ? 'PUBLISHING' : 'saving DRAFT'} posts` : 'WRITING review files (no database writes)'}: ${Math.min(COUNT, todo.length)} article(s) (from ${todo.length} candidate topics), provider ${MOCK || PLAN ? '-' : `${provider()} / ${modelName()}`}\n`)

const okStatus = new Set(['planned', 'mock-ok', 'written-to-files', 'saved-draft', 'published'])
for (const { topic, slug0 } of todo) {
  if (results.filter((r) => okStatus.has(r.status)).length >= COUNT) break
  console.log(`[${topic.category}/${topic.type}] ${topic.title}`)
  const cat = catBySlug.get(topic.category)
  if (!cat) { results.push({ topic, status: 'skipped', note: `category "${topic.category}" is not in the database` }); console.log('  skipped: category not in the database\n'); continue }
  const related = relatedFor(topic.category)
  if (PLAN) { console.log(`  would write about ${lengthSpec(topic.type, LENGTH).target} words (${LENGTH}), ${related.length} internal pages offered${IMAGES !== 'none' ? ', 1 featured image' : ''}\n`); results.push({ topic, status: 'planned' }); continue }
  try {
    let research = ''
    if (!MOCK && !flag('no-research')) {
      const r = await callAI({ system: 'You are a careful research assistant for a publication about solo businesses. Plain notes only.', user: researchPrompt(topic), web: true, role: 'research', maxTokens: 2500, temperature: 0.2 })
      research = r.text
      console.log(`  research: ${research.length} characters, ${r.citations.length} sources`)
    }
    const ctx = { type: topic.type, minWords: lengthSpec(topic.type, LENGTH).min, knownPaths, existingSlugs, images: IMAGES === 'none' || !WRITE ? 'none' : IMAGES }
    const maxTokens = Math.min(24000, Math.max(12000, lengthSpec(topic.type, LENGTH).target * 3 + 5000))
    let article
    const usage = []
    if (MOCK) article = mockArticle(topic, related)
    else {
      const w = await callJson({ system: SYSTEM, user: writePrompt({ topic, related, research, today, length: LENGTH, images: ctx.images }), maxTokens, temperature: 0.4 })
      article = w.json
      usage.push(w.usage)
    }
    if (!isSlug(article.slug)) article.slug = slug0
    hostOkImage(article)
    let check = validateArticle(article, ctx)
    for (let round = 1; round <= 2 && check.errors.length && !NO_REPAIR && !MOCK; round++) {
      console.log(`  ${check.errors.length} problem(s); asking the model to fix them (round ${round})`)
      const fix = await callJson({ system: SYSTEM, user: repairPrompt(article, check.errors), maxTokens, temperature: 0.2 })
      article = fix.json
      usage.push(fix.usage)
      if (!isSlug(article.slug)) article.slug = slug0
      hostOkImage(article)
      check = validateArticle(article, ctx)
    }
    check.warnings.forEach((w) => console.log(`  warning: ${w}`))
    check.errors.forEach((e) => console.log(`  ERROR: ${e}`))
    console.log(`  ${LENGTH}: ${wordCount(article.body ?? '')} words (target ${lengthSpec(topic.type, LENGTH).target}), ${article.faqs?.length ?? 0} FAQs`)

    const file = path.join(DRAFTS, `${article.slug}.json`)
    const record = { length: LENGTH, images: WRITE ? IMAGES : 'none', generatedAt: new Date().toISOString(), mock: MOCK, provider: MOCK ? 'mock' : provider(), model: MOCK ? 'mock' : modelName(), topic, passed: !check.errors.length, errors: check.errors, warnings: check.warnings, usage, article }
    fs.writeFileSync(file, JSON.stringify(record, null, 2))
    fs.writeFileSync(file.replace(/\.json$/, '.md'), `---\ntitle: ${JSON.stringify(article.title)}\nslug: ${article.slug}\ncategory: ${topic.category}\ntype: ${topic.type}\nchecks: ${record.passed ? 'passed' : 'FAILED'}\nmeta_title: ${JSON.stringify(article.meta?.title)}\nmeta_description: ${JSON.stringify(article.meta?.description)}\n---\n\n> ${article.callout?.title}: ${article.callout?.text}\n\n${article.body}\n\n## FAQs\n\n${(article.faqs ?? []).map((f) => `**${f.question}**\n${f.answer}`).join('\n\n')}\n${check.errors.length ? `\n## ERRORS\n\n${check.errors.map((e) => `- ${e}`).join('\n')}\n` : ''}${check.warnings.length ? `\n## Warnings\n\n${check.warnings.map((e) => `- ${e}`).join('\n')}\n` : ''}`)
    console.log(`  review copy: drafts/${article.slug}.md`)
    if (check.errors.length) { results.push({ topic, status: 'failed-checks', note: check.errors[0] }); console.log('  not saved: fix the problems above and rerun with --force\n'); continue }

    // Lexical content: the callout banner first, then the converted markdown.
    const converted = await markdownToLexical(article.body)
    if (article.callout) converted.root.children.unshift(bannerBlock(article.callout.style, article.callout.title, article.callout.text))
    if (!WRITE) { console.log(`  DRY RUN: nothing written to the database (content converts to ${converted.root.children.length} blocks). Add --write to save it.\n`); results.push({ topic, status: MOCK ? 'mock-ok' : 'written-to-files' }); markDone(topic, 'review-file'); continue }

    let heroId = null
    if (IMAGES !== 'none' && article.image) {
      console.log('  generating 1 image with fal.ai (this costs money)')
      heroId = await makeImage({ ...article.image, name: article.slug })
    }
    const sameCat = publishedPosts.filter((x) => (x.categories ?? []).some((c) => idOf(c) === cat.id)).slice(0, 3).map((x) => x.id)
    const created = await payload.create({
      collection: 'posts',
      context: { disableRevalidate: true },
      data: {
        title: article.title,
        slug: article.slug,
        categories: [cat.id],
        ...(heroId ? { heroImage: heroId } : {}),
        content: converted,
        relatedPosts: sameCat,
        authors: authorId ? [authorId] : [],
        meta: { title: article.meta.title, description: article.meta.description, ...(heroId ? { image: heroId } : {}) },
        ...(PUBLISH ? { _status: 'published', publishedAt: new Date().toISOString() } : { _status: 'draft' }),
      },
      draft: !PUBLISH,
    })
    existingSlugs.add(article.slug)
    console.log(`  ${PUBLISH ? 'PUBLISHED' : 'saved DRAFT'} post id ${created.id}: /posts/${created.slug} (the static site shows it after the next rebuild and deploy)`)
    record.saved = { id: created.id, slug: created.slug, published: PUBLISH }
    fs.writeFileSync(file, JSON.stringify(record, null, 2))
    results.push({ topic, status: PUBLISH ? 'published' : 'saved-draft', note: `/posts/${created.slug} (id ${created.id})` })
    markDone(topic, PUBLISH ? 'published' : 'saved-draft')
  } catch (err) {
    results.push({ topic, status: 'error', note: err.message })
    console.log(`  failed: ${err.message}\n`)
  }
}

console.log('\nSummary')
for (const r of results) console.log(`  ${r.status.padEnd(16)} ${r.topic.title}${r.note ? `  (${r.note})` : ''}`)
const made = results.filter((r) => r.status === 'published' || r.status === 'saved-draft').length
console.log(`\nPOSTS_SAVED=${made}`)
process.exit(results.some((r) => okStatus.has(r.status)) || !results.length ? 0 : 1)
