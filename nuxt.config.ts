// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";


export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },
    modules: ['@nuxt/fonts', '@nuxtjs/supabase', '@pinia/nuxt', '@vite-pwa/nuxt', '@nuxt/image', '@nuxt/content'],
    css: [
        '~/assets/css/main.css',
        '~/assets/css/admin.css',
        '~/assets/css/app-theme.css'
    ],
    // Load the real medium/semibold/bold cuts; with only 400 the browser fakes the heavier weights
    fonts: {
        defaults: {
            weights: [400, 500, 600, 700],
        },
        // Fallback for Messina Sans on the match letter; listed second in that font stack,
        // so load it globally rather than relying on @nuxt/fonts spotting it
        families: [
            { name: 'Hanken Grotesk', global: true },
        ],
    },
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
            title: 'Minutes 2 Match | Date without swiping',
            htmlAttrs: { lang: 'en' },
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
                { name: 'description', content: 'Date without swiping. We get to know you deeply, then introduce you to one compatible match each week in Accra and Nairobi.' },
                { name: 'theme-color', content: '#f7f7f7' },
                { name: 'apple-mobile-web-app-capable', content: 'yes' },
                { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
                { name: 'apple-mobile-web-app-title', content: 'M2M' },
                { name: 'mobile-web-app-capable', content: 'yes' },
                { name: 'application-name', content: 'Minutes 2 Match' },
                { name: 'msapplication-TileColor', content: '#ffffff' },
                // Open Graph / Facebook
                { property: 'og:site_name', content: 'Minutes 2 Match' },
                { property: 'og:type', content: 'website' },
                { property: 'og:locale', content: 'en_GB' },
                { property: 'og:title', content: 'Minutes 2 Match | Date without swiping' },
                { property: 'og:description', content: 'We get to know you deeply, then introduce you to one compatible match each week.' },
                { property: 'og:image', content: 'https://minutes2match.com/og-image.png' },
                { property: 'og:image:width', content: '1200' },
                { property: 'og:image:height', content: '630' },
                { property: 'og:image:alt', content: 'Minutes 2 Match: date without swiping' },
                // Twitter
                { name: 'twitter:card', content: 'summary_large_image' },
                { name: 'twitter:title', content: 'Minutes 2 Match | Date without swiping' },
                { name: 'twitter:description', content: 'We get to know you deeply, then introduce you to one compatible match each week.' },
                { name: 'twitter:image', content: 'https://minutes2match.com/og-image.png' },
            ],
            link: [
                { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                { rel: 'manifest', href: '/site.webmanifest' },
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