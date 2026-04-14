export type FlashLobbyIntentStatus = 'pending' | 'mutual' | 'converted_to_match' | 'declined' | 'expired'

export type FlashLobbyAction = 'unlock' | 'super_connect' | 'decline' | 'delete'

export function normalizeGender(value: string | null | undefined): 'male' | 'female' | null {
    const normalized = String(value || '').trim().toLowerCase()
    if (['male', 'man', 'men'].includes(normalized)) return 'male'
    if (['female', 'woman', 'women'].includes(normalized)) return 'female'
    return null
}

export function normalizeInterest(value: string | null | undefined): 'male' | 'female' | 'everyone' | null {
    const normalized = String(value || '').trim().toLowerCase()
    if (['male', 'man', 'men'].includes(normalized)) return 'male'
    if (['female', 'woman', 'women'].includes(normalized)) return 'female'
    if (['everyone', 'all', 'both', 'any'].includes(normalized)) return 'everyone'
    return null
}

export function canUsersSeeEachOther(options: {
    viewerGender?: string | null
    viewerInterest?: string | null
    candidateGender?: string | null
    candidateInterest?: string | null
}) {
    const viewerGender = normalizeGender(options.viewerGender)
    const viewerInterest = normalizeInterest(options.viewerInterest)
    const candidateGender = normalizeGender(options.candidateGender)
    const candidateInterest = normalizeInterest(options.candidateInterest)

    const viewerCanSeeCandidate =
        !viewerInterest ||
        viewerInterest === 'everyone' ||
        (candidateGender !== null && viewerInterest === candidateGender)

    const candidateCanSeeViewer =
        !candidateInterest ||
        candidateInterest === 'everyone' ||
        (viewerGender !== null && candidateInterest === viewerGender)

    return {
        viewerGender,
        viewerInterest,
        candidateGender,
        candidateInterest,
        viewerCanSeeCandidate,
        candidateCanSeeViewer,
        mutuallyVisible: viewerCanSeeCandidate && candidateCanSeeViewer
    }
}

export function sanitizeSparkMessage(message: unknown) {
    return String(message || '').trim().replace(/\s+/g, ' ')
}

export function validateSparkMessage(message: string) {
    if (!message) {
        return 'Target ID and message are required'
    }

    if (message.length < 12) {
        return 'Say a little more. Spark messages should be at least 12 characters.'
    }

    if (message.length > 180) {
        return 'Spark messages must be 180 characters or less.'
    }

    return null
}

export function isResolvedIntentStatus(status?: string | null) {
    return ['converted_to_match', 'declined', 'expired'].includes(status || '')
}

export function resolveSparkOutcome(options: {
    existingIntentStatus?: string | null
    reverseIntentExists: boolean
}) {
    if (options.existingIntentStatus === 'mutual') return 'mutual'
    if (isResolvedIntentStatus(options.existingIntentStatus)) return 'resolved'
    if (options.reverseIntentExists) return 'mutual'
    return 'pending'
}

export function canPerformPostLobbyAction(options: {
    action: FlashLobbyAction
    status: FlashLobbyIntentStatus
    isSender: boolean
    isReceiver: boolean
    lobbyEnded: boolean
}) {
    if (!options.lobbyEnded) {
        return { ok: false, error: 'This action is only available after the lobby ends' }
    }

    if (options.status === 'expired') {
        return { ok: false, error: 'This spark has expired.' }
    }

    if (options.status === 'declined') {
        return { ok: false, error: 'This spark has already been declined.' }
    }

    if (options.status === 'mutual') {
        return { ok: false, error: 'This spark is already mutual.' }
    }

    if (options.action === 'unlock' && !options.isReceiver) {
        return { ok: false, error: 'Only the recipient can unlock this spark' }
    }

    if (options.action === 'decline' && !options.isReceiver) {
        return { ok: false, error: 'Only the recipient can decline this spark' }
    }

    if (options.action === 'super_connect' && !options.isSender) {
        return { ok: false, error: 'Only the sender can super connect this spark' }
    }

    if (options.action === 'delete' && !options.isSender) {
        return { ok: false, error: 'Only the sender can delete this spark' }
    }

    return { ok: true }
}
