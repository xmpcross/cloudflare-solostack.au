'use client'

import React, { useState } from 'react'
import { Check, Link2 } from 'lucide-react'

type Props = {
  title: string
  readingTime: number
  slug: string
}

const iconClass = 'size-5 fill-current'

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const buttonClass =
  'inline-flex size-9 items-center justify-center rounded-full text-neutral-800 dark:text-neutral-100 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer'

export const PostShareRail: React.FC<Props> = ({ title, readingTime, slug }) => {
  const [copied, setCopied] = useState(false)

  const getUrl = () =>
    typeof window === 'undefined' ? '' : `${window.location.origin}/posts/${slug}`

  const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <div className="flex items-center gap-4 lg:flex-col lg:gap-6">
      <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card text-center shadow-lg shadow-neutral-900/10 dark:shadow-none dark:border dark:border-border">
        <p className="text-sm font-bold leading-tight text-neutral-900 dark:text-white">
          {readingTime} min
          <br />
          read
        </p>
      </div>

      <div className="flex items-center gap-1 lg:flex-col lg:gap-3" role="group" aria-label="Share this article">
        <button
          type="button"
          className={buttonClass}
          aria-label="Share on X"
          onClick={() =>
            open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getUrl())}`)
          }
        >
          <XIcon />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Share on Facebook"
          onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`)}
        >
          <FacebookIcon />
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-label="Share on LinkedIn"
          onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`)}
        >
          <LinkedInIcon />
        </button>
        <button type="button" className={buttonClass} aria-label="Copy link" title="Copy link" onClick={copy}>
          {copied ? <Check className="size-5 text-emerald-600" /> : <Link2 className="size-5" />}
        </button>
      </div>
    </div>
  )
}
