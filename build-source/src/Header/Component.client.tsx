'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { Menu, X, Search } from 'lucide-react'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const drawerLinks = [
    { label: 'Stacks', href: '/stacks' },
    { label: 'Tools', href: '/tools' },
    { label: 'Best Gear', href: '/best-gear' },
    { label: 'Comparisons', href: '/comparisons' },
    { label: 'Guides', href: '/posts' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 text-foreground backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <Logo loading="eager" priority="high" />
          </Link>

          {/* Desktop Navigation Menu (Auto-Inserted Nav Links) */}
          <HeaderNav data={data} />

          {/* Mobile Navigation Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-11 place-items-center rounded-full text-foreground hover:bg-secondary"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-border bg-background px-4 pb-5 pt-2 md:hidden">
          <ul className="divide-y divide-border">
            {drawerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-12 items-center text-lg font-semibold text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search" className="flex min-h-12 items-center gap-2 text-lg font-semibold text-foreground">
                <Search aria-hidden className="size-5" />
                Search
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
