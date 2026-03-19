import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod'

const designs = defineCollection({
    loader: glob({pattern: "src/content/designs/*.md"}),
    schema: ({image}) => z.object({
        title: z.string(),
        slug: z.string(),
        sortDate: z.coerce.date(),
        client: z.string(),
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

const pages = defineCollection({
    loader: glob({ pattern: "src/content/pages/*.md" }),
    schema: ({ image }) => z.discriminatedUnion("template", [
        z.object({
            template: z.literal("home"),
            pageTitle: z.string(),
            hero: z.object({
                introText: z.string(),
                ctaLabel: z.string(),
                ctaHref: z.string(),
                name: z.string(),
                image: image(),
                imageAlt: z.string()
            }),
            selectedDesigns: z.object({
                heading: z.string(),
                buttonLabel: z.string(),
                buttonHref: z.string()
            }),
            services: z.object({
                heading: z.string(),
                items: z.array(z.object({
                    title: z.string(),
                    text: z.string()
                }))
            }),
            aboutSection: z.object({
                heading: z.string(),
                lead: z.string(),
                bodyOne: z.string(),
                bodyTwo: z.string(),
                buttonLabel: z.string(),
                buttonHref: z.string(),
                image: image(),
                imageAlt: z.string()
            }),
            faq: z.object({
                heading: z.string(),
                items: z.array(z.object({
                    title: z.string(),
                    text: z.string()
                }))
            })
        }),
        z.object({
            template: z.literal("about"),
            pageTitle: z.string(),
            intro: z.object({
                heading: z.string(),
                lead: z.string(),
                body: z.string(),
                image: image(),
                imageAlt: z.string()
            }),
            experience: z.object({
                heading: z.string(),
                items: z.array(z.object({
                    title: z.string(),
                    place: z.string(),
                    period: z.string(),
                    text: z.string()
                }))
            }),
            education: z.object({
                heading: z.string(),
                items: z.array(z.object({
                    title: z.string(),
                    place: z.string(),
                    period: z.string(),
                    text: z.string()
                }))
            })
        }),
        z.object({
            template: z.literal("contact"),
            pageTitle: z.string(),
            intro: z.object({
                heading: z.string(),
                lead: z.string(),
                bodyOne: z.string(),
                bodyTwo: z.string()
            }),
            contactDetails: z.object({
                items: z.array(z.object({
                    title: z.string(),
                    contact: z.string(),
                    href: z.string()
                }))
            })
        }),
        z.object({
            template: z.literal("thank-you"),
            pageTitle: z.string(),
            intro: z.object({
                heading: z.string(),
                lead: z.string(),
                body: z.string()
            })
        }),
        z.object({
            template: z.literal("not-found"),
            pageTitle: z.string(),
            heading: z.string(),
            message: z.string(),
            buttonLabel: z.string(),
            buttonHref: z.string()
        })
    ])
});

const settings = defineCollection({
    loader: glob({ pattern: "src/content/settings/*.md" }),
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
            paginationPageSize: z.number().int()
        }),
        z.object({
            section: z.literal("orders"),
            paymentButtonLabel: z.string()
        })
    ])
});

export const collections = { designs, pages, settings };
