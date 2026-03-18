import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content'; 
import { z } from 'astro/zod'

const designs = defineCollection({
    loader: glob({pattern: "src/content/designs/*.md"}),
    schema: ({image}) => z.object({
        title: z.string().max(50),
        slug: z.string(),
        client: z.string().max(50),
        category: z.enum(["UI/UX Design", "Web Design", "Art Direction", "Product Design", "Branding"]),
        services: z.string().max(65),
        year: z.string().max(4),
        featuredImage: image(),
        imageTwo: image(),
        imageThree: image(),
        imageFour: image(),
        liveSite: z.url(),
        description: z.string().max(350),
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
                    contact: z.string()
                }))
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

const siteSettings = defineCollection({
    loader: glob({ pattern: "src/content/site-settings.md" }),
    schema: z.object({
        designs: z.object({
            paginationPageSize: z.number().int().min(1).max(50)
        }),
        navLinks: z.array(z.object({
            title: z.string(),
            href: z.string()
        })),
        footer: z.object({
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
        })
    })
});

export const collections = { designs, pages, siteSettings };
