/**
 * SEO Composable
 * 
 * Provides easy-to-use SEO utilities for dynamic meta tags
 */

interface SeoOptions {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article' | 'profile'
    twitterCard?: 'summary' | 'summary_large_image'
    noIndex?: boolean
}

export function useSeo(options: SeoOptions = {}) {
    const config = useRuntimeConfig()
    const route = useRoute()

    const baseUrl = config.public.baseUrl || 'https://minutes2match.com'
    const siteName = 'Minutes 2 Match'
    const defaultDescription = 'Find your perfect match through curated speed dating events. Science-backed compatibility matching for meaningful connections.'
    const defaultImage = `${baseUrl}/og-image.png`

    const title = options.title
        ? `${options.title} | ${siteName}`
        : siteName
    const description = options.description || defaultDescription
    const image = options.image || defaultImage
    const url = options.url || `${baseUrl}${route.path}`
    const type = options.type || 'website'
    const twitterCard = options.twitterCard || 'summary_large_image'

    useSeoMeta({
        // Basic Meta
        title,
        description,

        // Open Graph
        ogTitle: title,
        ogDescription: description,
        ogImage: image,
        ogUrl: url,
        ogType: type,
        ogSiteName: siteName,

        // Twitter
        twitterCard,
        twitterTitle: title,
        twitterDescription: description,
        twitterImage: image,
        twitterSite: '@minutes2match',

        // Robots
        ...(options.noIndex ? { robots: 'noindex, nofollow' } : {})
    })

    // Add structured data for organization
    useHead({
        script: [
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: siteName,
                    url: baseUrl,
                    logo: `${baseUrl}/logo.png`,
                    sameAs: [
                        'https://twitter.com/minutes2match',
                        'https://instagram.com/minutes2match'
                    ],
                    contactPoint: {
                        '@type': 'ContactPoint',
                        contactType: 'customer service',
                        availableLanguage: 'English'
                    }
                })
            }
        ]
    })
}

/**
 * Generate SEO for event pages
 */
export function useEventSeo(event: {
    name: string
    description?: string
    date: string
    location: string
    image?: string
}) {
    const config = useRuntimeConfig()
    const route = useRoute()
    const baseUrl = config.public.baseUrl || 'https://minutes2match.com'

    useSeoMeta({
        title: `${event.name} | Minutes 2 Match Events`,
        description: event.description || `Join ${event.name} at ${event.location}. Speed dating event by Minutes2Match.`,
        ogTitle: event.name,
        ogDescription: event.description || `Speed dating event at ${event.location}`,
        ogImage: event.image || `${baseUrl}/og-event.png`,
        ogType: 'event',
        twitterCard: 'summary_large_image',
    })

    // Event structured data
    useHead({
        script: [
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Event',
                    name: event.name,
                    description: event.description,
                    startDate: event.date,
                    location: {
                        '@type': 'Place',
                        name: event.location
                    },
                    organizer: {
                        '@type': 'Organization',
                        name: 'Minutes 2 Match',
                        url: baseUrl
                    },
                    eventStatus: 'https://schema.org/EventScheduled',
                    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
                })
            }
        ]
    })
}
