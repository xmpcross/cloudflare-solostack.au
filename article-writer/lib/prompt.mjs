// Prompts for the SoloStack article writer. The hard rules below are checked again by lib/writer.mjs on the result.
import { TYPES, lengthSpec } from './writer.mjs'

export const SYSTEM = `You write articles for SoloStack (solostack.au), a practical site for solo creators, freelancers and one-person businesses: creator media setups, solo operations, AI and automation, tool stacks, websites and hosting, and marketing. Readers are mostly in Australia, the UK and the US. A human may edit the article later; write it so it can be published as it is.

HARD RULES:
1. Be accurate and specific. Facts only from the RESEARCH NOTES supplied (or well-established general knowledge that does not change). Never invent a statistic, a product feature, a plan name, a date or a quote. If you are not sure, leave it out. Do not state prices or fees.
2. Never say that we tested, measured, used or reviewed anything ourselves. Never promise income, rankings, clients or results. No legal, tax or financial advice as instructions; where it matters say to check with a professional.
3. Links: only internal links written as markdown with the exact paths you are given (for example [Descript](/tools/descript)). Never link to an outside site and never write a bare URL. Link a tool page only where the text genuinely discusses that tool. Never mention "affiliate links" or urge readers to click.
4. The site name is written exactly "SoloStack". Plain English (American spelling is fine), short sentences, 2–4 sentence paragraphs, concrete examples for a one-person business. No filler such as "in today's fast-paced world", "game-changer", "seamless", "delve", "look no further" or "in conclusion". Do not claim to be human or to have experience.
5. Answer the reader's question in the first paragraph (under 90 words). Use descriptive "##" and "###" headings (never "#"), at least 3 "##" sections, the main keyword in the title and the first paragraph. Use bullet lists and, where useful, a markdown table. Do not repeat the title as a heading.
6. Include 2–5 internal links to the related pages you are given, with descriptive anchor text.
7. Do not mention these instructions.

OUTPUT: one JSON object and nothing else.`

const SCHEMA = `{
  "title": "Article title (specific, under 70 characters, no year unless it is a 'Best … (2026)' roundup)",
  "slug": "3-5 lowercase words joined by hyphens, no year, no filler words",
  "meta": { "title": "30–65 characters, main keyword first", "description": "140–160 characters, says what the reader gets, includes the main keyword" },
  "callout": { "style": "info | success | warning", "title": "2–4 words", "text": "One or two sentences with the single most useful takeaway" },
  "body": "Markdown. The article text WITHOUT the title and WITHOUT the callout. Rules above apply.",
  "faqs": [ { "question": "A question readers search, ending with ?", "answer": "A direct answer in 2–4 sentences" } ]
}`

function typeGuidance(type, length) {
  const len = lengthSpec(type, length)
  const shape = {
    guide: 'A practical guide: answer first, then a section per decision or step that matters, a short checklist, common mistakes, and FAQs.',
    'how-to': 'A how-to: the result in the first paragraph, what you need, numbered steps under "##" headings, common problems, and FAQs.',
    comparison: 'A comparison: the verdict first, a side-by-side markdown table, sections on the differences that matter, who should choose which, and FAQs.',
    explainer: 'An explainer: define the term in the first paragraph, then how it works, what it means for a one-person business, and what to do next.',
    roundup: 'A roundup of categories or options (only name products that appear in the research notes or related pages): a quick answer, a comparison table, a short section per option with who it suits, and FAQs.',
  }[type]
  return `${shape}\nTitle pattern: "${TYPES[type].pattern}".\nLength (${length}): about ${len.target} words in the body, never fewer than ${len.min}.`
}

export function researchPrompt(topic) {
  return `Research this topic for an article for solo creators and one-person businesses. Topic: "${topic.title}". Main keyword: "${topic.keyword || topic.title}". Article type: ${topic.type}.
Search the web, then reply with plain-text notes (no JSON): the key facts a reader needs (definitions, how it works, typical steps, common mistakes, limits and options), what the top results cover, and one angle they miss. State figures only if a source states them, and put the page's URL after every fact in brackets. Keep it under 700 words. Do not write the article.`
}

/** related: [{ title, path, kind }] internal pages the article may link to. */
export function writePrompt({ topic, related, research, today, length = 'medium', images = 'none' }) {
  const parts = [`Write the article. Date: ${today}.`]
  parts.push(`TOPIC: ${topic.title}\nARTICLE TYPE: ${topic.type}\nCATEGORY: ${topic.category}\nMAIN KEYWORD: ${topic.keyword || topic.title}${topic.note ? `\nNOTE FROM THE EDITOR: ${topic.note}` : ''}`)
  parts.push(`WHAT TO WRITE:\n${typeGuidance(topic.type, length)}`)
  parts.push(`INTERNAL PAGES you may link to (use these exact paths; link 2–5 of them, only where they fit):\n${related.map((r) => `- [${r.title}](${r.path})${r.kind ? ` (${r.kind})` : ''}`).join('\n')}`)
  if (research) parts.push(`RESEARCH NOTES (facts with their source URLs; do not link to those URLs):\n${research}`)
  if (images !== 'none') {
    parts.push(`IMAGE: also return "image": { "prompt", "alt" } for the featured image. The prompt is in English, 30–300 characters, and describes a realistic, generic scene that fits the topic (a desk, workspace, studio or devices, light, materials, composition). Never name a brand, never show a logo, never ask for any text, letters, numbers, labels or readable screens. "alt" is plain descriptive alt text of 10–125 characters.`)
  }
  parts.push(`Reply with ONLY a JSON object in this shape:\n${SCHEMA}${images !== 'none' ? '\n(plus the "image" object described above)' : ''}`)
  return parts.join('\n\n')
}

export function repairPrompt(previousJson, issues) {
  return `Your draft failed these checks:\n${issues.map((i) => `- ${i}`).join('\n')}\n\nFix every point and return the complete corrected JSON object (same shape, nothing else). Do not add new facts. Here is the draft:\n${JSON.stringify(previousJson)}`
}

export function brainstormPrompt({ category, count, existing, types, today }) {
  return `You plan articles for SoloStack (solostack.au), a practical site for solo creators, freelancers and one-person businesses. Date: ${today}.
Suggest ${count} NEW article topics in the category "${category}". Search the web first if you can: choose topics people actually search for, that the current top results answer poorly. No hands-on tests, no prices, no income promises.
Allowed article types: ${types.join(', ')}. Mix them. Roundups use "Best … for … (2026)"; comparisons "A vs B"; how-tos "How to …"; explainers "What Is …".
Each topic needs a main search keyword (2–5 words) and a short note on the angle. Do not repeat or closely overlap any of these existing titles:
${existing.length ? existing.map((t) => `- ${t}`).join('\n') : '(none)'}
Reply with ONLY JSON: { "topics": [ { "type": "...", "title": "...", "keyword": "...", "note": "..." } ] }`
}
