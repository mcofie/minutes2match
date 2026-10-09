// Deprecated: this endpoint used to hand back a working login (email + temporary password)
// for any verified member's phone number, with no SMS code — an account-takeover hole.
// Every member now verifies by SMS; sign-up links existing / seeded profiles after the code
// is checked. Kept as a harmless stub so older cached app versions don't break.

export default defineEventHandler(async (event) => {
    enforceRateLimit(event, { maxRequests: 10, windowSeconds: 60, prefix: 'check-existing-user' })
    return { exists: false, requiresOtp: true }
})
