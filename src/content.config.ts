import {glob} from 'astro/loaders';
import {defineCollection, reference} from 'astro:content';
import {z} from 'astro/zod'

const pages = defineCollection({
  loader: glob({pattern: "src/content/pages/*.md"}),
  schema: ({image}) => {
    const headingBlock = z.object({
      type: z.literal("heading_block"),
      title: z.string()
    });

    const introBlock = z.object({
      type: z.literal("intro_block"),
      heading: z.string(),
      lead: z.string(),
      body: z.string(),
      button: z.string().optional(),
      link: z.string().optional()
    });

    const heroBlock = z.object({
      type: z.literal("hero_block"),
      intro: z.string(),
      button: z.string(),
      link: z.string(),
      name: z.string(),
      lead: z.string(),
      body: z.string(),
      image: image()
    });

    const calloutBlock = z.object({
      type: z.literal("callout_block"),
      name: z.string(),
      lead: z.string(),
      body: z.string(),
      button: z.string(),
      link: z.string(),
      image: image()
    });

    const accordionBlock = z.object({
      type: z.literal("accordion_block"),
      heading: z.string(),
      items: z.array(z.object({
        title: z.string(),
        first: z.string(),
        second: z.string(),
        text: z.string()
      }))
    });

    const numberedAccordionBlock = z.object({
      type: z.literal("numbered_accordion_block"),
      heading: z.string(),
      items: z.array(z.object({
        title: z.string(),
        text: z.string()
      }))
    });

    const contactsBlock = z.object({
      type: z.literal("contacts_block"),
      items: z.array(z.object({
        title: z.string(),
        contact: z.string(),
        href: z.string().optional()
      }))
    });

    const featuredDesignsBlock = z.object({
      type: z.literal("featured_designs_block"),
      heading: z.string(),
      button: z.string(),
      link: z.string()
    });

    const allDesignsBlock = z.object({
      type: z.literal("all_designs_block"),
      heading: z.string(),
    });

    const designDetailsBlock = z.object({
      type: z.literal("design_details_block"),
      paymentButtonLabel: z.string()
    });

    return z.object({
      title: z.string(),
      slug: z.string(),
      comment: z.string().optional(),
      blocks: z.array(z.discriminatedUnion("type", [
        headingBlock,
        introBlock,
        heroBlock,
        calloutBlock,
        accordionBlock,
        numberedAccordionBlock,
        contactsBlock,
        featuredDesignsBlock,
        allDesignsBlock,
        designDetailsBlock
      ]))
    });
  }
});

const designs = defineCollection({
  loader: glob({pattern: "src/content/designs/*.md"}),
  schema: ({image}) => z.object({
    title: z.string(),
    slug: z.string(),
    sortDate: z.coerce.date(),
    client: z.string(),
    detailsPage: reference("pages"),
    category: z.string(),
    services: z.string(),
    featuredImage: image(),
    imageTwo: image(),
    imageThree: image(),
    imageFour: image(),
    paymentLink: z.url(),
    description: z.string(),
    isFeatured: z.boolean(),
    isDraft: z.boolean()
  })
})

const settings = defineCollection({
  loader: glob({pattern: "src/content/settings/*.md"}),
  schema: z.discriminatedUnion("section", [
    z.object({
      section: z.literal("layout"),
      mainPageTitle: z.string(),
      socialsHeading: z.string(),
      navigationHeading: z.string(),
      socials: z.array(z.object({
        title: z.string(),
        href: z.string()
      })),
      copyright: z.string(),
      creditsPrefix: z.string(),
      builtWithLabel: z.string(),
      builtWithHref: z.string(),
      builtByLabel: z.string(),
      builtByHref: z.string()
    }),
    z.object({
      section: z.literal("navigation"),
      navLinks: z.array(z.object({
        title: z.string(),
        href: z.string()
      }))
    }),
    z.object({
      section: z.literal("designs"),
      categories: z.array(z.string())
    }),
  ])
});

export const collections = {pages, designs, settings};
