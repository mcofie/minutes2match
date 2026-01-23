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
    devServer: {
        host: "0.0.0.0"
    },
    app: {
        head: {
            title: 'Minutes 2 Match',
            titleTemplate: '%s | Minutes 2 Match',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Find your perfect match through curated speed dating events. Science-backed compatibility matching for meaningful connections.' },
                { name: 'theme-color', content: '#FFFCF8' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'M2M' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'application-name', content: 'Minutes 2 Match' },
                { name: 'msapplication-TileColor', content: '#000000' },
                { property: 'og:title', content: 'Minutes 2 Match' },
                { property: 'og:description', content: 'Find your perfect match through curated speed dating events.' },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: 'Minutes 2 Match' },
                { property: 'og:image', content: '/og-image.png' },
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:image', content: '/og-image.png' },
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'manifest', href: '/site.webmanifest' },
                { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#000000' },
            ],
        }
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
        supabaseUrl: process.env.SUPABASE_URL,
        hubtelClientId: process.env.HUBTEL_CLIENT_ID,
        hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET,
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
        supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
        cronSecret: process.env.CRON_SECRET,
        discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
        // Public keys (available client-side)
        public: {
            paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        }
    },
})