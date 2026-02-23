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
        '/me': { ssr: false },
        '/me/**': { ssr: false },
        '/matches': { ssr: false },
        '/events': { ssr: false },
    },
    image: {
        provider: 'none',
        domains: ['ziglffbvcexvwguqopqm.supabase.co'],
    },
    devServer: {
        host: "0.0.0.0"
    },
    pwa: {
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
            title: 'Minutes 2 Match',
            titleTemplate: '%s | Minutes 2 Match',
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { name: 'description', content: 'Find your perfect match through curated speed dating events. Science-backed compatibility matching for meaningful connections.' },
                { name: 'theme-color', content: '#FFFCF8' },
                // Apple Mobile Config - PWA Module handles standard manifest, but keeping apple specific meta is good
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
                { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo-icon.png' },
                { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo-icon.png' },
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
        hubtelClientId: process.env.HUBTEL_CLIENT_ID,
        hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET,
        paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
        supabaseServiceKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY,
        cronSecret: process.env.CRON_SECRET,
        discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
        geminiApiKey: process.env.GEMINI_API_KEY,
        // Public keys (available client-side)
        public: {
            appVersion: '1.2.0',
            paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY,
            baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        }
    },
})