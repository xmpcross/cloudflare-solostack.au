import React from 'react'

import { BreadcrumbBar } from './BreadcrumbBar'
import { getTrails } from './trails'

/** The breadcrumb section under the header. Put it once in the site layout, right after <Header />. */
export async function SiteBreadcrumbs() {
  const trails = await getTrails()
  return <BreadcrumbBar trails={trails} />
}
