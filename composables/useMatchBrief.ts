// Match briefs, cached for the session: /matches prefetches the latest one so opening it is instant,
// and coming back to a brief shows it straight away while a fresh copy loads behind it.

export interface MatchBrief {
    match: any
    me: any
    myAnswers: { question_key: string; answer_value: any }[]
    partner: any
}

// One request per brief at a time, however many callers ask
const inflight = new Map<string, Promise<MatchBrief>>()

export const useMatchBrief = () => {
    const briefs = useState<Record<string, MatchBrief>>('match_briefs', () => ({}))

    const loadBrief = (id: string): Promise<MatchBrief> => {
        const pending = inflight.get(id)
        if (pending) return pending
        const req = $fetch<MatchBrief>(`/api/matches/brief/${id}`)
            .then((data) => {
                briefs.value = { ...briefs.value, [id]: data }
                return data
            })
            .finally(() => inflight.delete(id))
        inflight.set(id, req)
        return req
    }

    // Warm the cache when the browser is idle; failures are ignored (the page will load it itself)
    const prefetchBrief = (id?: string | null) => {
        if (!id || briefs.value[id] || inflight.has(id) || typeof window === 'undefined') return
        const run = () => { loadBrief(id).catch(() => {}) }
        const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => void) | undefined
        if (idle) idle(run, { timeout: 2000 })
        else setTimeout(run, 300)
    }

    return { briefs, loadBrief, prefetchBrief }
}
