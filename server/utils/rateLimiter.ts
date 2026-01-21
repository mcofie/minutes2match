/**
 * Simple in-memory rate limiter for API endpoints
 * 
 * Uses a sliding window approach to track requests per IP
 * Suitable for single-server deployments
 * For multi-server, use Redis instead
 */

import { getHeader, setHeader, createError, H3Event } from 'h3'

interface RateLimitEntry {
    count: number
    resetAt: number
}

// Store rate limit data in memory
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetAt < now) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number
    /** Time window in seconds */
    windowSeconds: number
    /** Optional prefix for the key (e.g., 'login', 'sms') */
    prefix?: string
}

export interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean
    /** Current request count */
    current: number
    /** Maximum allowed requests */
    limit: number
    /** Seconds until the limit resets */
    retryAfter: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const { maxRequests, windowSeconds, prefix = 'default' } = config
    const key = `${prefix}:${identifier}`
    const now = Date.now()
    const windowMs = windowSeconds * 1000

    let entry = rateLimitStore.get(key)

    // If no entry or window has expired, create new entry
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + windowMs
        }
        rateLimitStore.set(key, entry)
        return {
            allowed: true,
            current: 1,
            limit: maxRequests,
            retryAfter: 0
        }
    }

    // Increment count
    entry.count++
    rateLimitStore.set(key, entry)

    // Check if over limit
    if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        return {
            allowed: false,
            current: entry.count,
            limit: maxRequests,
            retryAfter
        }
    }

    return {
        allowed: true,
        current: entry.count,
        limit: maxRequests,
        retryAfter: 0
    }
}

/**
 * Get client IP from the request event
 * Handles proxies and load balancers
 */
export function getClientIP(event: any): string {
    // Try various headers for real IP behind proxies
    const forwardedFor = getHeader(event, 'x-forwarded-for')
    if (forwardedFor) {
        // Take the first IP (client IP)
        return forwardedFor.split(',')[0].trim()
    }

    const realIP = getHeader(event, 'x-real-ip')
    if (realIP) {
        return realIP
    }

    // Fall back to direct connection IP
    return event.node?.req?.socket?.remoteAddress || 'unknown'
}

/**
 * Middleware-style rate limiter that throws an error if rate limited
 */
export function enforceRateLimit(
    event: any,
    config: RateLimitConfig
): void {
    const ip = getClientIP(event)
    const result = checkRateLimit(ip, config)

    if (!result.allowed) {
        // Set rate limit headers
        setHeader(event, 'X-RateLimit-Limit', String(result.limit))
        setHeader(event, 'X-RateLimit-Remaining', '0')
        setHeader(event, 'X-RateLimit-Reset', String(result.retryAfter))
        setHeader(event, 'Retry-After', result.retryAfter)

        throw createError({
            statusCode: 429,
            statusMessage: `Too many requests. Please try again in ${result.retryAfter} seconds.`
        })
    }

    // Set headers for successful requests too
    setHeader(event, 'X-RateLimit-Limit', String(result.limit))
    setHeader(event, 'X-RateLimit-Remaining', String(result.limit - result.current))
}
