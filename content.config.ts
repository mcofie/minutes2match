import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
    collections: {
        releaseNotes: defineCollection({
            source: 'release-notes/*.md',
            type: 'page',
            schema: z.object({
                version: z.string(),
                date: z.string(),
                display_date: z.string(),
                whatsNew: z.array(z.object({
                    emoji: z.string(),
                    title: z.string(),
                    description: z.string()
                })).optional(),
                improvements: z.array(z.object({
                    title: z.string(),
                    description: z.string()
                })).optional(),
                fixes: z.array(z.string()).optional()
            })
        })
    }
})
