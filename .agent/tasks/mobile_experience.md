
# Mobile Experience Improvements

Implemented a native-app-like experience for the Dashboard (`/me`) on mobile devices.

### Features
1.  **Mobile Bottom Navigation**:
    - Replaced the top tab bar (now hidden on mobile) with a fixed, premium bottom navigation bar.
    - Features 3 tabs: Matches, Events, Profile.
    - Active states use brand colors (Rose-500/Black) and scaling animations.
    - Supports Dark Mode (`bg-stone-900`, `border-stone-700`).

2.  **Swipe Gestures**:
    - Users can now swipe left/right anywhere on the dashboard main content to switch tabs.
    - Logic: Matches <-> Events <-> Profile.
    - Implemented using `@vueuse/core`'s `useSwipe`.

3.  **Pull-to-Refresh**:
    - Added a custom swipe-down logic to trigger a data refresh.
    - Includes a visual spinner/indicator that follows the pull distance.
    - Triggers `fetchMatchesById` and `fetchEvents` when pulled beyond a threshold (80px), providing haptic-like feedback via animation.

### files Modified
- `pages/me/index.vue`:
  - Added `BottomNav` markup.
  - Added `useSwipe` and custom touch logic script.
  - Updated responsive classes for existing tabs.
  - Added Pull-to-Refresh spinner UI with Z-index handling.
