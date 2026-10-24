'use client'

import { Check, Copy } from 'lucide-react'
import React, { useState } from 'react'

/** A button that copies the email address. Without clipboard access it selects nothing and the address stays visible next to it. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The address is shown on the page; nothing else to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="btn btn-line"
    >
      {copied ? <Check className="size-4 " aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy address'}</span>
    </button>
  )
}
