// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@nuxt/fonts', '@nuxtjs/supabase', '@pinia/nuxt', '@vite-pwa/nuxt', '@nuxt/image', '@nuxt/content'],
    css: [
        '~/assets/css/main.css',
        '~/assets/css/admin.css'
    ],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    routeRules: {
        '/login': { ssr: false },
        '/vibe-check': { ssr: false },
        '/me': { ssr: false },
        '/me/**': { ssr: false },
        '/matches': { ssr: false },
        '/events': { ssr: false },
        '/vouch/**': { ssr: false },
        '/shot/**': { ssr: false },
        '/shoot-your-shot': { ssr: false },
        '/payment/shot-callback': { ssr: false },
        '/manage/**': { ssr: false },
        '/speed-date/**': { ssr: false },
        '/s/**': { ssr: false },
    },


    image: {
        provider: 'none',
        domains: ['ziglffbvcexvwguqopqm.supabase.co'],
    },
    devServer: {
        host: "0.0.0.0"
    },
    pwa: {
        disable: process.env.NODE_ENV === 'production' || !!process.env.NETLIFY,
        registerType: 'autoUpdate',
        manifest: {
            name: 'Minutes 2 Match',
            short_name: 'M2M',
            description: 'Find your perfect match through curated speed dating events.',
            theme_color: '#FFFCF8',
            background_color: '#FFFCF8',
            display: 'standalone',
            orientation: 'portrait',
            icons: [
                {
                    src: 'logo-icon.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'logo-icon.png',
                    sizes: '512x512',
                    type: 'image/png'
                }
            ],
            start_url: "/"
        },
        workbox: {
            navigateFallback: '/',
            globPatterns: ['**/*.{js,css,html,png,svg,ico}']
        },
        client: {
            installPrompt: true,
        },
        devOptions: {
            enabled: false,
            type: 'module'
        }
    },
    app: {
        head: {
            title: 'Minutes 2 Match | Real Connections via Protocol & Events',
            titleTemplate: '%s | Minutes 2 Match',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Experience the M2M Protocol. We use psychometrics and curated events in Accra to build connections that actually last. Skip the swipe, engineering the click.' },
                { name: 'theme-color', content: '#FFFCF8' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
                { name: 'apple-mobile-web-app-title', content: 'M2M' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'application-name', content: 'Minutes 2 Match' },
                { name: 'msapplication-TileColor', content: '#000000' },
                // Open Graph / Facebook
                { property: 'og:site_name', content: 'Minutes 2 Match' },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: 'Minutes 2 Match | Real Connections via Protocol & Events' },
                { property: 'og:description', content: 'Experience the M2M Protocol. Psychometric matching + real world events in Accra.' },
                { property: 'og:image', content: '/og-image.png' },
                // Twitter
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'Minutes 2 Match | Real Connections' },
                { name: 'twitter:description', content: 'Ditch the infinite swipe. Engineering real chemistry through science and curated events.' },
                { name: 'twitter:image', content: '/og-image.png' },
            ],
            link: [
                { rel: 'icon', type: 'image/png', href: '/logo-icon.png' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo-icon.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo-icon.png' },
            ],
            script: [
                { src: 'https://telegram.org/js/telegram-web-app.js' }
            ]
        }
    },
    supabase: {
        redirect: false,
        redirectOptions: {
            login: '/vibe-check',
            callback: '/me',
            exclude: ['/', '/vibe-check/**'],
        },
        cookieOptions: {
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        },
        clientOptions: {
            db: {
                schema: 'm2m'
            },
            auth: {
                flowType: 'pkce',
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true,
            }
        }
    },
    runtimeConfig: {
        // Private keys (only available server-side)
        supabaseUrl: process.env.SUPABASE_URL,
        zendApiKey: process.env.ZEND_API_KEY,
        hubtelClientId: process.env.HUBTEL_CLIENT_ID,
        hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET,
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
        supabaseServiceKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY,
        cronSecret: process.env.CRON_SECRET,
        discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
        geminiApiKey: process.env.GEMINI_API_KEY,
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
        // Public keys (available client-side)
        public: {
            appVersion: '1.7.0',
            paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        }
    },
})