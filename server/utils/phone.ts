/**
 * Phone Number Normalization Utility
 * 
 * Normalizes Ghana phone numbers to a consistent format: +233XXXXXXXXX
 * Handles formats: 0244123456, +233244123456, 233244123456
 */

export function normalizeGhanaPhone(phone: string): string {
    // Remove all whitespace, dashes, parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '')

    // Strip leading +
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1)
    }

    // If starts with 0, replace with 233
    if (cleaned.startsWith('0') && cleaned.length === 10) {
        cleaned = '233' + cleaned.substring(1)
    }

    // If doesn't start with 233, prepend it
    if (!cleaned.startsWith('233') && cleaned.length === 9) {
        cleaned = '233' + cleaned
    }

    // Final format: +233XXXXXXXXX
    return '+' + cleaned
}

/**
 * Check if two phone numbers are the same person
 */
export function isSamePhone(phone1: string, phone2: string): boolean {
    return normalizeGhanaPhone(phone1) === normalizeGhanaPhone(phone2)
}
