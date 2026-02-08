/**
 * Badges composable for Minutes 2 Match
 * Defines badge types, icons, and display logic
 */

export interface Badge {
    id: string
    name: string
    description: string
    icon: string // SVG path
    color: string // Background color
    textColor: string
}

export const badges: Record<string, Badge> = {
    verified: {
        id: 'verified',
        name: 'Verified',
        description: 'Identity verified by M2M team',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        color: '#10B981',
        textColor: '#ffffff'
    },
    new_user: {
        id: 'new_user',
        name: 'New',
        description: 'Joined within the last 7 days',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        color: '#8B5CF6',
        textColor: '#ffffff'
    },
    event_regular: {
        id: 'event_regular',
        name: 'Event Regular',
        description: 'Attended 3+ speed dating events',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        color: '#F59E0B',
        textColor: '#ffffff'
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        description: 'Active premium subscription',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        color: '#000000',
        textColor: '#FFD700'
    },
    photo_verified: {
        id: 'photo_verified',
        name: 'Photo Verified',
        description: 'Profile photo verified',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
        color: '#3B82F6',
        textColor: '#ffffff'
    },
    fast_responder: {
        id: 'fast_responder',
        name: 'Fast Responder',
        description: 'Typically responds within 2 hours',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        color: '#EF4444',
        textColor: '#ffffff'
    }
}

export const useBadges = () => {
    /**
     * Get badge by ID
     */
    const getBadge = (badgeId: string): Badge | null => {
        return badges[badgeId] || null
    }

    /**
     * Get all badges for a user profile
     */
    const getUserBadges = (badgeIds: string[] | null): Badge[] => {
        if (!badgeIds || !Array.isArray(badgeIds)) return []
        return badgeIds
            .map(id => badges[id])
            .filter((badge): badge is Badge => badge !== undefined)
    }

    /**
     * Check if a user has a specific badge
     */
    const hasBadge = (badgeIds: string[] | null, badgeId: string): boolean => {
        if (!badgeIds || !Array.isArray(badgeIds)) return false
        return badgeIds.includes(badgeId)
    }

    /**
     * Calculate badges for a user based on their profile
     * This is a client-side calculation for display purposes
     * The actual badges are stored in the database
     */
    const calculateBadges = (profile: any): string[] => {
        const badgeList: string[] = []

        // Verified badge
        if (profile.is_verified) {
            badgeList.push('verified')
        }

        // New user badge (joined within 7 days)
        if (profile.created_at) {
            const daysSinceCreation = Math.floor(
                (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
            )
            if (daysSinceCreation <= 7) {
                badgeList.push('new_user')
            }
        }

        // Event regular badge
        if (profile.events_attended && profile.events_attended >= 3) {
            badgeList.push('event_regular')
        }

        // Photo verified badge
        if (profile.photo_url) {
            badgeList.push('photo_verified')
        }

        // Fast responder badge
        if (profile.avg_response_time_hours && profile.avg_response_time_hours < 2) {
            badgeList.push('fast_responder')
        }

        return badgeList
    }

    return {
        badges,
        getBadge,
        getUserBadges,
        hasBadge,
        calculateBadges
    }
}
