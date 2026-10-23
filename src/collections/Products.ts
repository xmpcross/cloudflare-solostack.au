// Products: one record per product found by product research (RapidAPI, DataForSEO, Amazon/Google Shopping data or typed
// in by hand), added 23 Oct 2026 at the owner's request. It stores what research returned: identifiers, specs, where it
// is sold (offers, with the plain merchant URL and whether the merchant works with Sovrn Commerce) and the raw report.
// There is no public page yet; only logged-in admin users can read or change it. Use the status to track a product from
// "researched" to "approved" before it is written into an article.
import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'productType', 'status', 'updatedAt'],
    listSearchableFields: ['name', 'brand', 'model', 'asin', 'gtin'],
    description:
      'Products found by product research. Each product keeps its specs, where it is sold (with Sovrn compatibility) and the raw research data.',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(String(data.name))
        return data
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
        {
          name: 'slug',
          type: 'text',
          unique: true,
          index: true,
          admin: { width: '40%', description: 'Filled in from the name when left empty.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'brand', type: 'text', admin: { width: '50%' } },
        { name: 'model', type: 'text', admin: { width: '50%', description: 'Model name or number, for example "SM7B".' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'productType',
          type: 'select',
          defaultValue: 'hardware',
          options: [
            { label: 'Hardware', value: 'hardware' },
            { label: 'Software / SaaS', value: 'software' },
            { label: 'Service', value: 'service' },
            { label: 'Other', value: 'other' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'researched',
          options: [
            { label: 'Researched (not reviewed)', value: 'researched' },
            { label: 'Approved (ready to use in articles)', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Discontinued', value: 'discontinued' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          admin: { width: '34%', description: 'The site pillar this product belongs to.' },
        },
      ],
    },
    { name: 'summary', type: 'textarea', admin: { description: 'One or two plain sentences: what it is and who it suits. Facts only.' } },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imageSourceUrl',
      type: 'text',
      admin: { description: 'Where the product image came from, if it was fetched from a shop or manufacturer.' },
    },

    {
      type: 'collapsible',
      label: 'Identifiers',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'asin', type: 'text', label: 'Amazon ASIN', admin: { width: '33%' } },
            { name: 'gtin', type: 'text', label: 'GTIN / UPC / EAN', admin: { width: '33%' } },
            { name: 'mpn', type: 'text', label: 'Manufacturer part number', admin: { width: '34%' } },
          ],
        },
        { name: 'manufacturerUrl', type: 'text', label: 'Manufacturer product page' },
      ],
    },

    {
      name: 'specs',
      type: 'array',
      labels: { singular: 'Spec', plural: 'Specs' },
      admin: { initCollapsed: true, description: 'Facts from the manufacturer page or the research report.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'value', type: 'text', required: true, admin: { width: '60%' } },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pros',
          type: 'array',
          admin: { initCollapsed: true },
          fields: [{ name: 'point', type: 'text', required: true }],
        },
        {
          name: 'cons',
          type: 'array',
          admin: { initCollapsed: true },
          fields: [{ name: 'point', type: 'text', required: true }],
        },
      ],
    },
    { name: 'bestFor', type: 'text', label: 'Best for', admin: { description: 'The kind of person or job it suits best.' } },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      admin: { description: 'Average shop rating from research (0 to 5), not our own score.' },
    },
    { name: 'ratingCount', type: 'number', min: 0, admin: { description: 'How many ratings that average is based on.' } },

    {
      name: 'offers',
      type: 'array',
      labels: { singular: 'Offer', plural: 'Offers' },
      admin: {
        description:
          'Where the product is sold. Save the plain product page URL (no tracking parameters): affiliate tracking is added elsewhere.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'merchant', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'merchantDomain', type: 'text', admin: { width: '30%', description: 'For example "bestbuy.com".' } },
            {
              name: 'region',
              type: 'select',
              defaultValue: 'AU',
              options: ['AU', 'US', 'UK', 'CA', 'NZ', 'DE', 'FR', 'Global'].map((r) => ({ label: r, value: r })),
              admin: { width: '30%' },
            },
          ],
        },
        { name: 'url', type: 'text', required: true, label: 'Product page URL' },
        {
          type: 'row',
          fields: [
            { name: 'price', type: 'number', min: 0, admin: { width: '33%', description: 'Research only. Not shown on the site.' } },
            { name: 'currency', type: 'text', defaultValue: 'AUD', admin: { width: '33%' } },
            { name: 'availability', type: 'text', admin: { width: '34%', description: 'For example "In stock".' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'network',
              type: 'select',
              label: 'Affiliate network',
              defaultValue: 'none',
              options: [
                { label: 'None / not yet', value: 'none' },
                { label: 'Sovrn Commerce', value: 'sovrn' },
                { label: 'Amazon Associates', value: 'amazon' },
                { label: 'Awin', value: 'awin' },
                { label: 'CJ', value: 'cj' },
                { label: 'Impact', value: 'impact' },
                { label: 'Direct programme', value: 'direct' },
              ],
              admin: { width: '40%' },
            },
            {
              name: 'sovrnStatus',
              type: 'select',
              label: 'Sovrn compatible?',
              defaultValue: 'unchecked',
              options: [
                { label: 'Not checked yet', value: 'unchecked' },
                { label: 'Yes: Sovrn can track this merchant', value: 'yes' },
                { label: 'No: Sovrn does not support it', value: 'no' },
              ],
              admin: { width: '40%' },
            },
            { name: 'primary', type: 'checkbox', label: 'Main offer', defaultValue: false, admin: { width: '20%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'source',
              type: 'select',
              options: [
                { label: 'Amazon (DataForSEO)', value: 'amazon' },
                { label: 'Google Shopping (DataForSEO)', value: 'dataforseo' },
                { label: 'RapidAPI product search', value: 'rapidapi' },
                { label: 'Sovrn price comparison', value: 'sovrn' },
                { label: 'Manual', value: 'manual' },
              ],
              admin: { width: '50%' },
            },
            { name: 'checkedAt', type: 'date', admin: { width: '50%', date: { pickerAppearance: 'dayOnly' }, description: 'When this offer was last checked.' } },
          ],
        },
      ],
    },

    {
      type: 'collapsible',
      label: 'Research data',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'researchSource',
              type: 'select',
              options: [
                { label: 'DataForSEO', value: 'dataforseo' },
                { label: 'RapidAPI', value: 'rapidapi' },
                { label: 'Both', value: 'both' },
                { label: 'Manual', value: 'manual' },
              ],
              admin: { width: '40%' },
            },
            { name: 'researchKeyword', type: 'text', admin: { width: '40%', description: 'The search the product was found with.' } },
            { name: 'researchedAt', type: 'date', admin: { width: '20%', date: { pickerAppearance: 'dayOnly' } } },
          ],
        },
        { name: 'researchNotes', type: 'textarea' },
        { name: 'rawData', type: 'json', admin: { description: 'The raw record returned by research, kept for reference.' } },
      ],
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: { position: 'sidebar', description: 'Articles that recommend or mention this product.' },
    },
    {
      name: 'relatedTool',
      type: 'relationship',
      relationTo: 'tools',
      admin: { position: 'sidebar', description: 'Link to the Software Directory entry, if this product has one.' },
    },
  ],
}
