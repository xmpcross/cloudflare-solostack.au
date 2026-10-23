import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const extractTextFromChildren = (children: any[]): string => {
  if (!Array.isArray(children)) return ''
  return children
    .map((c) => {
      if (typeof c === 'string') return c
      if (c && typeof c === 'object') {
        if ('text' in c && typeof c.text === 'string') return c.text
        if ('children' in c && Array.isArray(c.children)) return extractTextFromChildren(c.children)
      }
      return ''
    })
    .join('')
}


// ---- markdown tables --------------------------------------------------------------------------------------------------
// The editor has no table feature, so a markdown table arrives as one paragraph: text lines joined by line breaks, each
// line like "| Step | Time |". These helpers turn such lines into a real <table>; anything else is left alone.
type Line = any[]

const splitLines = (children: any[]): Line[] => {
  const lines: Line[] = [[]]
  for (const c of children ?? []) {
    if (c?.type === 'linebreak') lines.push([])
    else lines[lines.length - 1].push(c)
  }
  return lines
}

const lineText = (line: Line) => extractTextFromChildren(line).trim()
const isPipeLine = (line: Line) => lineText(line).startsWith('|')
const isSeparator = (line: Line) => /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(lineText(line))

// "| a | [b](/x) | c |" -> [[a], [link b], [c]]: split text nodes at pipes, keep other nodes (links) inside their cell.
function toCells(line: Line): any[][] {
  const cells: any[][] = [[]]
  for (const node of line) {
    if (node?.type === 'text' && typeof node.text === 'string') {
      node.text.split('|').forEach((piece: string, i: number) => {
        if (i > 0) cells.push([])
        if (piece.trim()) cells[cells.length - 1].push({ ...node, text: piece })
      })
    } else {
      cells[cells.length - 1].push(node)
    }
  }
  if (!cells[0].length) cells.shift() // text before the first pipe
  if (cells.length && !cells[cells.length - 1].length) cells.pop() // text after the last pipe
  return cells.map((cell) => {
    const first = cell[0]
    const last = cell[cell.length - 1]
    if (first?.type === 'text') cell[0] = { ...first, text: first.text.replace(/^\s+/, '') }
    if (last?.type === 'text') cell[cell.length - 1] = { ...cell[cell.length - 1], text: last.text.replace(/\s+$/, '') }
    return cell
  })
}

type Piece = { kind: 'text'; lines: Line[] } | { kind: 'table'; lines: Line[] }

/** Splits a paragraph's lines into plain-text runs and tables (a pipe line, a separator line, then pipe lines). */
function splitTables(lines: Line[]): Piece[] {
  const pieces: Piece[] = []
  let i = 0
  while (i < lines.length) {
    if (isPipeLine(lines[i]) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      let j = i + 2
      while (j < lines.length && isPipeLine(lines[j])) j++
      pieces.push({ kind: 'table', lines: lines.slice(i, j) })
      i = j
    } else {
      const last = pieces[pieces.length - 1]
      if (last?.kind === 'text') last.lines.push(lines[i])
      else pieces.push({ kind: 'text', lines: [lines[i]] })
      i++
    }
  }
  return pieces
}

const joinLines = (lines: Line[]): any[] =>
  lines.flatMap((line, i) => (i === 0 ? line : [{ type: 'linebreak', version: 1 }, ...line]))

function MarkdownTable({ lines, nodesToJSX }: { lines: Line[]; nodesToJSX: (args: { nodes: any[] }) => React.ReactNode }) {
  const [head, , ...rows] = lines.map(toCells) // lines[1] is the |---| separator
  const cell = (nodes: any[]) => nodesToJSX({ nodes })
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
      <table style={{ minWidth: `${Math.min(head.length * 7, 48)}rem` }} className="w-full border-collapse text-left text-sm leading-relaxed">
        <thead className="bg-muted/60">
          <tr>
            {head.map((nodes, c) => (
              <th key={c} scope="col" className="px-4 py-3 align-bottom font-semibold text-foreground">
                {cell(nodes)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} className="border-t border-border">
              {cells.map((nodes, c) => (
                <td key={c} className="px-4 py-3 align-top text-neutral-700 dark:text-neutral-300">
                  {cell(nodes)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  paragraph: (args) => {
    const { node, nodesToJSX } = args as any
    const pieces = splitTables(splitLines(node.children))
    if (!pieces.some((p) => p.kind === 'table')) return (defaultConverters.paragraph as any)(args)
    return (
      <>
        {pieces.map((piece, i) =>
          piece.kind === 'table' ? (
            <MarkdownTable key={i} lines={piece.lines} nodesToJSX={nodesToJSX} />
          ) : (
            <p key={i}>{nodesToJSX({ nodes: joinLines(piece.lines) })}</p>
          ),
        )}
      </>
    )
  },
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag
    const text = extractTextFromChildren(node.children)
    const id = slugify(text)
    return (
      <Tag id={id} className="scroll-mt-28 group relative">
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    )
  },
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = true, enableGutter = true, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        'payload-richtext',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}
