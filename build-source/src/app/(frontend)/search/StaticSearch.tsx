'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { CollectionArchive } from '@/components/CollectionArchive'
import type { CardPostData } from '@/components/Card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Static-site search: every post is embedded in the page and filtered in the browser.
// The query is kept in ?q= so links to /search?q=... still work.
export const StaticSearch: React.FC<{ posts: CardPostData[] }> = ({ posts }) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    setValue(new URLSearchParams(window.location.search).get('q') || '')
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (value) url.searchParams.set('q', value)
    else url.searchParams.delete('q')
    window.history.replaceState(null, '', url)
  }, [value])

  const results = useMemo(() => {
    const terms = value.toLowerCase().split(/\s+/).filter(Boolean)
    if (terms.length === 0) return posts.slice(0, 12)
    return posts.filter((post) => {
      const haystack = [post.title, post.slug, post.meta?.title, post.meta?.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return terms.every((term) => haystack.includes(term))
    })
  }, [posts, value])

  return (
    <>
      <div className="container mb-16">
        <div className="max-w-[50rem] mx-auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input id="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search" />
          </form>
        </div>
      </div>
      {results.length > 0 ? (
        <CollectionArchive posts={results} />
      ) : (
        <div className="container">No results found.</div>
      )}
    </>
  )
}
