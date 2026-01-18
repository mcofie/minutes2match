// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@nuxt/fonts', '@nuxtjs/supabase', '@pinia/nuxt'],
    css: [
        '~/assets/css/main.css',
        '~/assets/css/admin.css'
    ],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    supabase: {
        redirect: false,
        redirectOptions: {
            login: '/vibe-check',
            callback: '/me',
            exclude: ['/', '/vibe-check/**'],
        },
        clientOptions: {
            db: {
                schema: 'm2m'
            }
        }
    },
    runtimeConfig: {
        // Private keys (only available server-side)
        hubtelClientId: process.env.HUBTEL_CLIENT_ID,
        hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET,
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
        // Public keys (available client-side)
        public: {
            paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        }
    },
})