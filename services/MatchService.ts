export class MatchService {
    static async enrichMatches(userIds: string[]): Promise<Record<string, any>> {
        if (!userIds || userIds.length === 0) return {}
        try {
            const response = await $fetch('/api/enrich_matches', {
                method: 'POST',
                body: { matchUserIds: userIds }
            })
            return response as Record<string, any>
        } catch (error) {
            console.error('[MatchService] Failed to enrich matches', error)
            return {}
        }
    }
}
