import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection, reference } from 'astro:content'

const pages = defineCollection({
  loader: glob({ pattern: 'src/content/pages/*.md' }),
  schema: ({ image }) => {
    const headingBlock = z.object({
      type: z.literal('heading_block'),
      title: z.string().optional(),
    })

    const introBlock = z.object({
      type: z.literal('intro_block'),
      heading: z.string().optional(),
      lead: z.string().optional(),
      body: z.string().optional(),
      button: z.string().optional(),
      link: z.string().optional(),
      alignment: z.string().optional(),
    })

    const heroBlock = z.object({
      type: z.literal('hero_block'),
      intro: z.string().optional(),
      button: z.string().optional(),
      link: z.string().optional(),
      name: z.string().optional(),
      lead: z.string().optional(),
      body: z.string().optional(),
      image: image().optional(),
    })

    const calloutBlock = z.object({
      type: z.literal('callout_block'),
      name: z.string().optional(),
      lead: z.string().optional(),
      body: z.string().optional(),
      button: z.string().optional(),
      link: z.string().optional(),
      image: image().optional(),
    })

    const accordionBlock = z.object({
      type: z.literal('accordion_block'),
      heading: z.string().optional(),
      items: z.array(z.object({
        title: z.string().optional(),
        first: z.string().optional(),
        second: z.string().optional(),
        text: z.string().optional(),
      })).default([]),
    })

    const numberedAccordionBlock = z.object({
      type: z.literal('numbered_accordion_block'),
      heading: z.string().optional(),
      items: z.array(z.object({
        title: z.string().optional(),
        text: z.string().optional(),
      })).default([]),
    })

    const contactsBlock = z.object({
      type: z.literal('contacts_block'),
      items: z.array(z.object({
        title: z.string().optional(),
        contact: z.string().optional(),
        href: z.string().optional(),
      })).default([]),
    })

    const featuredDesignsBlock = z.object({
      type: z.literal('featured_designs_block'),
      heading: z.string().optional(),
      button: z.string().optional(),
      link: z.string().optional(),
    })

    const allDesignsBlock = z.object({
      type: z.literal('all_designs_block'),
      heading: z.string().optional(),
    })

    const designDetailsBlock = z.object({
      type: z.literal('design_details_block'),
      paymentButtonLabel: z.string().optional(),
    })

    return z.object({
      title: z.string().optional(),
      slug: z.string().optional(),
      comment: z.string().optional(),
      blocks: z.array(z.discriminatedUnion('type', [
        headingBlock,
        introBlock,
        heroBlock,
        calloutBlock,
        accordionBlock,
        numberedAccordionBlock,
        contactsBlock,
        featuredDesignsBlock,
        allDesignsBlock,
        designDetailsBlock,
      ])).default([]),
    })
  },
})

const designs = defineCollection({
  loader: glob({ pattern: 'src/content/designs/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().optional(),
    slug: z.string().optional(),
    sortDate: z.coerce.date().optional(),
    client: z.string().optional(),
    detailsPage: reference('pages').optional(),
    category: z.string().optional(),
    services: z.string().optional(),
    featuredImage: image().optional(),
    imageTwo: image().optional(),
    imageThree: image().optional(),
    imageFour: image().optional(),
    paymentLink: z.url().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isDraft: z.boolean().optional(),
  }),
})

const settings = defineCollection({
  loader: glob({ pattern: 'src/content/settings/*.md' }),
  schema: z.discriminatedUnion('section', [
    z.object({
      section: z.literal('layout'),
      mainPageTitle: z.string().optional(),
      socialsHeading: z.string().optional(),
      navigationHeading: z.string().optional(),
      socials: z.array(z.object({
        title: z.string().optional(),
        href: z.string().optional(),
      })).default([]),
      copyright: z.string().optional(),
      creditsPrefix: z.string().optional(),
      builtWithLabel: z.string().optional(),
      builtWithHref: z.string().optional(),
      builtByLabel: z.string().optional(),
      builtByHref: z.string().optional(),
    }),
    z.object({
      section: z.literal('navigation'),
      navLinks: z.array(z.object({
        title: z.string().optional(),
        href: z.string().optional(),
      })).default([]),
    }),
    z.object({
      section: z.literal('designs'),
      categories: z.array(z.string()).default([]),
    }),
  ]),
})

export const collections = { pages, designs, settings }
