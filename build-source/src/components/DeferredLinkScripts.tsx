'use client'

import { useEffect } from 'react'

const CONVERTLINK_SRC = 'https://convertlink.com/script/ce8f3235-a4ab-4b5b-bde4-b86890fd281b/bundle.js'
const VIGLINK_KEY = 'c8e0277878ff223506949e2999123ff0'
const VIGLINK_SRC = '//cdn.viglink.com/api/vglnk.js'
const INTERACTION_EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll'] as const

// Affiliate link rewriters (ConvertLink and Sovrn Commerce/VigLink) are not needed to render the page, so they load on the
// first interaction, or after a few idle seconds, to keep them off the critical path.
export function DeferredLinkScripts() {
  useEffect(() => {
    let loaded = false

    const add = (src: string) => {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      document.body.appendChild(s)
    }

    const load = () => {
      if (loaded) return
      loaded = true
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, load))
      window.clearTimeout(timer)
      ;(window as any).vglnk = { key: VIGLINK_KEY }
      add(VIGLINK_SRC)
      add(CONVERTLINK_SRC)
    }

    INTERACTION_EVENTS.forEach((e) => window.addEventListener(e, load, { passive: true, once: true }))
    const timer = window.setTimeout(load, 6000)

    return () => {
      loaded = true
      INTERACTION_EVENTS.forEach((e) => window.removeEventListener(e, load))
      window.clearTimeout(timer)
    }
  }, [])

  return null
}
