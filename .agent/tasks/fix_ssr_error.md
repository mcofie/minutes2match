
# SSR Error Fix

Resolved `TypeError: Cannot read properties of undefined (reading 'getSSRProps')` during Server-Side Rendering.

### Issue
The custom directive `v-scroll-animate` was defined in a plugin named `scroll-animation.client.ts`. The `.client` suffix prevented the plugin from loading on the server. Consequently, when Vue SSR encountered `<div v-scroll-animate>`, it failed to resolve the directive definition, leading to a crash when the renderer attempted to access directive properties (like `getSSRProps`) on `undefined`.

### Fix
-   **Renamed Plugin**: Changed `plugins/scroll-animation.client.ts` to `plugins/scroll-animation.ts`.
-   **Universal Registration**: The directive is now registered on both client and server.
-   **SSR Safety**: The directive only defines `mounted` and `unmounted` hooks, which are client-only lifecycles. This ensures that browser-specific logic (like `IntersectionObserver`) is not executed on the server, avoiding "window is not defined" errors while satisfying the SSR renderer's requirement for the directive to exist.

The application should now render correctly on the server without errors.
