
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const BlindProfileCard: typeof import("../components/BlindProfileCard.vue").default
export const CompatibilityBreakdown: typeof import("../components/CompatibilityBreakdown.vue").default
export const EventCard: typeof import("../components/EventCard.vue").default
export const EventsEmptyState: typeof import("../components/EventsEmptyState.vue").default
export const LivePulse: typeof import("../components/LivePulse.vue").default
export const Pagination: typeof import("../components/Pagination.vue").default
export const ReferralCard: typeof import("../components/ReferralCard.vue").default
export const SubscriptionCard: typeof import("../components/SubscriptionCard.vue").default
export const UserActivityTimeline: typeof import("../components/UserActivityTimeline.vue").default
export const VibeCard: typeof import("../components/VibeCard.vue").default
export const SkeletonEventCard: typeof import("../components/skeleton/EventCard.vue").default
export const SkeletonMatchCard: typeof import("../components/skeleton/MatchCard.vue").default
export const SkeletonProfileCard: typeof import("../components/skeleton/ProfileCard.vue").default
export const UiButton: typeof import("../components/ui/Button.vue").default
export const UiCard: typeof import("../components/ui/Card.vue").default
export const UiCommerceHero: typeof import("../components/ui/CommerceHero.vue").default
export const UiConfettiContainer: typeof import("../components/ui/ConfettiContainer.vue").default
export const UiDatePicker: typeof import("../components/ui/DatePicker.vue").default
export const UiFormInput: typeof import("../components/ui/FormInput.vue").default
export const UiSeparator: typeof import("../components/ui/Separator.vue").default
export const UiSheet: typeof import("../components/ui/Sheet.vue").default
export const UiToastContainer: typeof import("../components/ui/ToastContainer.vue").default
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue").default
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout").default
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue").default
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only").default
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only").default
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder").default
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link").default
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator").default
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue").default
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer").default
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtImg
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtPicture
export const VitePwaManifest: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default
export const NuxtPwaManifest: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default
export const NuxtPwaAssets: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets").default
export const PwaAppleImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue").default
export const PwaAppleSplashScreenImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue").default
export const PwaFaviconImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue").default
export const PwaMaskableImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue").default
export const PwaTransparentImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue").default
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page").default
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components").NoScript
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components").Link
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components").Base
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components").Title
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components").Meta
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components").Style
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components").Head
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components").Html
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components").Body
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island").default
export const LazyBlindProfileCard: LazyComponent<typeof import("../components/BlindProfileCard.vue").default>
export const LazyCompatibilityBreakdown: LazyComponent<typeof import("../components/CompatibilityBreakdown.vue").default>
export const LazyEventCard: LazyComponent<typeof import("../components/EventCard.vue").default>
export const LazyEventsEmptyState: LazyComponent<typeof import("../components/EventsEmptyState.vue").default>
export const LazyLivePulse: LazyComponent<typeof import("../components/LivePulse.vue").default>
export const LazyPagination: LazyComponent<typeof import("../components/Pagination.vue").default>
export const LazyReferralCard: LazyComponent<typeof import("../components/ReferralCard.vue").default>
export const LazySubscriptionCard: LazyComponent<typeof import("../components/SubscriptionCard.vue").default>
export const LazyUserActivityTimeline: LazyComponent<typeof import("../components/UserActivityTimeline.vue").default>
export const LazyVibeCard: LazyComponent<typeof import("../components/VibeCard.vue").default>
export const LazySkeletonEventCard: LazyComponent<typeof import("../components/skeleton/EventCard.vue").default>
export const LazySkeletonMatchCard: LazyComponent<typeof import("../components/skeleton/MatchCard.vue").default>
export const LazySkeletonProfileCard: LazyComponent<typeof import("../components/skeleton/ProfileCard.vue").default>
export const LazyUiButton: LazyComponent<typeof import("../components/ui/Button.vue").default>
export const LazyUiCard: LazyComponent<typeof import("../components/ui/Card.vue").default>
export const LazyUiCommerceHero: LazyComponent<typeof import("../components/ui/CommerceHero.vue").default>
export const LazyUiConfettiContainer: LazyComponent<typeof import("../components/ui/ConfettiContainer.vue").default>
export const LazyUiDatePicker: LazyComponent<typeof import("../components/ui/DatePicker.vue").default>
export const LazyUiFormInput: LazyComponent<typeof import("../components/ui/FormInput.vue").default>
export const LazyUiSeparator: LazyComponent<typeof import("../components/ui/Separator.vue").default>
export const LazyUiSheet: LazyComponent<typeof import("../components/ui/Sheet.vue").default>
export const LazyUiToastContainer: LazyComponent<typeof import("../components/ui/ToastContainer.vue").default>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue").default>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout").default>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue").default>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only").default>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only").default>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder").default>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link").default>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator").default>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue").default>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer").default>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtImg>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs").NuxtPicture>
export const LazyVitePwaManifest: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default>
export const LazyNuxtPwaManifest: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest").default>
export const LazyNuxtPwaAssets: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets").default>
export const LazyPwaAppleImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue").default>
export const LazyPwaAppleSplashScreenImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue").default>
export const LazyPwaFaviconImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue").default>
export const LazyPwaMaskableImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue").default>
export const LazyPwaTransparentImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue").default>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page").default>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").NoScript>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Link>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Base>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Title>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Meta>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Style>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Head>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Html>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components").Body>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island").default>

export const componentNames: string[]
