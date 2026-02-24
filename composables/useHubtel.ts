import type { M2MDatabase } from '~/types/database.types'

/**
 * Hubtel SMS Integration Composable
 * Handles SMS sending and OTP verification via server API
 */
export const useHubtel = () => {
    const supabase = useSupabaseClient<M2MDatabase>()
    const config = useRuntimeConfig()

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
     * Generate and send OTP, store in database with expiry
     */
    const sendOTP = async (phone: string) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        console.log('═'.repeat(60))
        console.log('🔐 OTP CODE FOR:', phone)
        console.log('📱 CODE:', otp)
        console.log('⏰ Expires:', expiresAt.toLocaleString())
        console.log('═'.repeat(60))

        try {
            console.log('💾 Attempting to store OTP in database...')

            // Store OTP in database 
            const { data, error } = await supabase
                .schema('m2m')
                .from('otp_codes')
                .upsert({
                    phone,
                    code: otp,
                    expires_at: expiresAt.toISOString(),
                    used: false
                }, { onConflict: 'phone' })
                .select()

            if (error) {
                console.error('❌ Failed to store OTP:', error)
                console.error('Error details:', JSON.stringify(error, null, 2))
                throw new Error('Failed to generate verification code: ' + error.message)
            }

            console.log('✅ OTP stored successfully!')
            console.log('📊 Stored:', data)

            // Skip SMS sending in development - just log the code
            // Send real SMS
            try {
                await sendSMS(phone, `Your M2Match code is: ${otp}. Expires in 5 mins.`)
                console.log('📨 SMS Sent to ' + phone)
            } catch (smsError) {
                console.warn('SMS failed, but OTP is stored:', smsError)
            }

            return { success: true }
        } catch (error) {
            console.error('OTP generation error:', error)
            throw error
        }
    }

    /**
     * Verify OTP code
     */
    const verifyOTP = async (phone: string, code: string) => {
        // Development bypass
        if (code === '111111') {
            console.log('✅ [DEV] Using bypass code 111111')
            return { valid: true }
        }

        console.log('🔍 Verifying OTP for:', phone, 'Code:', code)

        try {
            const { data, error } = await supabase
                .schema('m2m')
                .from('otp_codes')
                .select('*')
                .eq('phone', phone)
                .eq('code', code)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString())
                .maybeSingle()

            if (error) {
                console.error('❌ OTP query error:', error)
                return { valid: false, error: 'Database error during verification' }
            }

            if (!data) {
                console.error('❌ No matching OTP found for:', phone)
                console.log('💡 TIP: Make sure you clicked "Send Verification Code" first')
                console.log('💡 TIP: Or use bypass code 111111')
                return { valid: false, error: 'Invalid or expired code' }
            }

            console.log('✅ OTP verified successfully!')

            // Mark OTP as used
            await supabase
                .schema('m2m')
                .from('otp_codes')
                .update({ used: true })
                .eq('phone', phone)
                .eq('code', code)

            return { valid: true }
        } catch (error) {
            console.error('❌ OTP verification error:', error)
            return { valid: false, error: 'Verification failed' }
        }
    }

    return { sendSMS, sendOTP, verifyOTP }
}
