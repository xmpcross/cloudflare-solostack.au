// AI provider calls for the SoloStack article writer (generate-article.mjs): OpenRouter (the default) or the
// OpenAI (ChatGPT) API or the Anthropic API, each with optional web search for research. Plain fetch, no SDK. Every call COSTS MONEY, so
// the writer only reaches this file when it is run for real (not with --plan or --mock); (ask before paid runs).
//
// Environment (names only; values live in the app .env):
//   AI_PROVIDER             openai (default when OPENAI_API_KEY is set) | openrouter | anthropic
//   OPENAI_API_KEY, OPENAI_MODEL                  (OPENAI_MODEL defaults to gpt-4.1; OPENAI_RESEARCH_MODEL optional, used for web research)
//   OPENROUTER_API_KEY, OPENROUTER_MODEL          (OPENROUTER_RESEARCH_MODEL optional; OPENROUTER_SEARCH_RESULTS, default 6)
//   ANTHROPIC_API_KEY, ANTHROPIC_MODEL            (ANTHROPIC_MODEL defaults to claude-sonnet-5-5)
import { extractJson } from './writer.mjs'

export const provider = () => (process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'openrouter')).toLowerCase()

export function modelName(role = 'write') {
  if (provider() === 'openai') return (role === 'research' && process.env.OPENAI_RESEARCH_MODEL) || process.env.OPENAI_MODEL || 'gpt-4.1'
  if (provider() === 'anthropic') return process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5'
  if (role === 'research' && process.env.OPENROUTER_RESEARCH_MODEL) return process.env.OPENROUTER_RESEARCH_MODEL
  return process.env.OPENROUTER_MODEL || ''
}

export function checkConfigured() {
  if (provider() === 'openai') {
    if (!process.env.OPENAI_API_KEY) return 'OPENAI_API_KEY is not set in .env.local (add it, or set AI_PROVIDER=openrouter)'
  } else if (provider() === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) return 'ANTHROPIC_API_KEY is not set in .env.local'
  } else if (provider() === 'openrouter') {
    if (!process.env.OPENROUTER_API_KEY) return 'OPENROUTER_API_KEY is not set in .env.local'
    if (!process.env.OPENROUTER_MODEL) return 'OPENROUTER_MODEL is not set in .env.local'
  } else return `AI_PROVIDER must be openai, openrouter or anthropic (got "${provider()}")`
  return null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function post(url, headers, body, { attempts = 3, timeoutMs = 300_000 } = {}) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      })
      const text = await res.text()
      if (res.ok) return JSON.parse(text)
      last = new Error(`${new URL(url).host} answered ${res.status}: ${text.slice(0, 300)}`)
      // Retry only rate limits and server errors.
      if (res.status !== 429 && res.status < 500) throw last
    } catch (err) {
      last = err
      if (err.name !== 'TimeoutError' && !/ 429| 5\d\d/.test(err.message)) throw err
    }
    if (i < attempts) await sleep(4000 * i)
  }
  throw last
}

/**
 * One model call. Returns { text, citations: [{url,title}], usage }.
 *   system, user  the prompts
 *   web           let the model search the web first (research)
 *   role          'write' | 'research' (picks the model)
 */
export async function callAI({ system, user, web = false, role = 'write', maxTokens = 8000, temperature = 0.4 }) {
  if (provider() === 'openai') {
    // ChatGPT through the Responses API (it carries the built-in web search tool). The gpt-5 and o-series models
    // reject a temperature, so it is sent only to the others.
    const model = modelName(role)
    const body = {
      model,
      instructions: system,
      input: user,
      max_output_tokens: maxTokens,
      ...(/^(gpt-5|o\d)/i.test(model) ? {} : { temperature }),
      ...(web ? { tools: [{ type: 'web_search' }] } : {}),
    }
    const data = await post('https://api.openai.com/v1/responses', { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body)
    if (data.error) throw new Error(`OpenAI: ${data.error.message ?? JSON.stringify(data.error).slice(0, 300)}`)
    if (data.status === 'incomplete') throw new Error(`OpenAI stopped early (${data.incomplete_details?.reason ?? 'unknown'}); raise the token limit or shorten the article`)
    const parts = (data.output ?? []).filter((o) => o.type === 'message').flatMap((o) => o.content ?? [])
    const text = parts.filter((c) => c.type === 'output_text').map((c) => c.text).join('\n')
    const citations = parts.flatMap((c) => c.annotations ?? []).filter((a) => a.type === 'url_citation' && a.url).map((a) => ({ url: a.url, title: a.title ?? '' }))
    const u = data.usage ?? {}
    return { text, citations: dedupe(citations), usage: { provider: 'openai', model, input_tokens: u.input_tokens, output_tokens: u.output_tokens, total_tokens: u.total_tokens } }
  }
  if (provider() === 'anthropic') {
    const body = {
      model: modelName(role),
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: user }],
      ...(web ? { tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }] } : {}),
    }
    const data = await post(
      'https://api.anthropic.com/v1/messages',
      { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body,
    )
    const blocks = data.content ?? []
    const text = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
    const citations = []
    for (const b of blocks) {
      if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
        for (const r of b.content) if (r.url) citations.push({ url: r.url, title: r.title ?? '' })
      }
      for (const c of b.citations ?? []) if (c.url) citations.push({ url: c.url, title: c.title ?? '' })
    }
    return { text, citations: dedupe(citations), usage: data.usage ?? null }
  }

  const body = {
    model: modelName(role),
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    ...(web ? { plugins: [{ id: 'web', max_results: Number(process.env.OPENROUTER_SEARCH_RESULTS || 6) }] } : {}),
  }
  const data = await post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://solostack.au',
      'X-Title': 'SoloStack article writer',
    },
    body,
  )
  const message = data.choices?.[0]?.message
  if (!message) throw new Error(`OpenRouter returned no message: ${JSON.stringify(data).slice(0, 300)}`)
  const citations = (message.annotations ?? [])
    .filter((a) => a.type === 'url_citation' && a.url_citation?.url)
    .map((a) => ({ url: a.url_citation.url, title: a.url_citation.title ?? '' }))
  return { text: typeof message.content === 'string' ? message.content : '', citations: dedupe(citations), usage: data.usage ?? null }
}

/** A call that must come back as a JSON object. One automatic retry asks the model to fix its own JSON. */
export async function callJson(opts) {
  const first = await callAI(opts)
  try {
    return { json: extractJson(first.text), ...first }
  } catch (err) {
    const again = await callAI({
      ...opts,
      web: false,
      user: `${opts.user}\n\nYour previous reply was not valid JSON (${err.message}). Reply again with ONLY the JSON object, no commentary and no code fence.`,
    })
    return { json: extractJson(again.text), ...again, citations: first.citations }
  }
}

function dedupe(list) {
  const seen = new Set()
  return list.filter((c) => (seen.has(c.url) ? false : seen.add(c.url)))
}
