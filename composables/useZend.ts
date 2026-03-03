/**
 * Zend SMS & OTP Integration Composable
 * Handles SMS sending and OTP verification via Zend server APIs
 * 
 * Replaces the old useHubtel composable.
 * OTP is generated manually and sent via Zend SMS API to support custom sender ID, then verified via Supabase.
 */
export const useZend = () => {
    /**
     * Send SMS via server API (never expose API keys client-side)
     */
    const sendSMS = async (to: string, message: string) => {
        try {
            return await $fetch('/api/send-sms', {
                method: 'POST',
                body: { to, message }
            })
        } catch (error) {
            console.error('SMS Send Error:', error)
            throw error
        }
    }

    /**
     * Send OTP via server-side
     * Returns the OTP ID needed for verification
     */
    const sendOTP = async (phone: string, provider?: 'hubtel' | 'zend') => {
        console.log(`📱 Sending OTP to: ${phone} (provider: ${provider || 'default'})`)

        try {
            const response = await $fetch<{ success: boolean; otpId: string; expiresAt: string }>('/api/otp/send', {
                method: 'POST',
                body: { phone, provider }
            })

            if (!response.success) {
                throw new Error('Failed to send verification code')
            }

            console.log('✅ OTP sent successfully, ID:', response.otpId)
            return {
                success: true,
                otpId: response.otpId,
                expiresAt: response.expiresAt
            }
        } catch (error) {
            console.error('OTP send error:', error)
            throw error
        }
    }

    /**
     * Verify OTP via ZendOTP (server-side)
     */
    const verifyOTP = async (_phone: string, code: string, otpId?: string) => {
        // Development bypass
        if (code === '111111') {
            console.log('✅ [DEV] Using bypass code 111111')
            return { valid: true }
        }

        if (!otpId) {
            console.error('❌ No OTP ID provided for verification')
            return { valid: false, error: 'No OTP ID. Please request a new code.' }
        }

        console.log('🔍 Verifying OTP:', otpId, 'Code:', code)

        try {
            const response = await $fetch<{ valid: boolean; error?: string }>('/api/otp/verify', {
                method: 'POST',
                body: { otpId, code }
            })

            if (response.valid) {
                console.log('✅ OTP verified successfully!')
            } else {
                console.error('❌ OTP verification failed:', response.error)
            }

            return response
        } catch (error) {
            console.error('❌ OTP verification error:', error)
            return { valid: false, error: 'Verification failed' }
        }
    }

    return { sendSMS, sendOTP, verifyOTP }
}
