
# Dark Mode Implementation

I have fully implemented a premium Dark Mode across the application.

### core Changes
- **Root Setup**: Added `useDark` and `useToggle` (VueUse) in `app.vue` to handle theme switching and persistence.
- **Global Styles**: Updated global backgrounds and text colors to support `dark:` variants.

### Pages Updated
1. **Landing Page (`/`)**:
   - Hero section, features, testimonials, and footer now feature a sleek dark theme.
   - Used `dark:bg-stone-950` as the primary dark background for a warm, premium feel.

2. **Dashboard (`/me`)**:
   - Updated tab navigation, headers, and empty states.
   - **Profile Tab**: All cards (Photos, Basic Info, Bio, Interests) now have dark mode styles.
   - **Events/Matches Tabs**: Cards and headers adapted.

3. **Connection View (`/me/connection/[id]`)**:
   - Sidebar profile card and action buttons updated.
   - Main content areas (Basic Info, Ice Breakers, etc.) fully styled for dark mode.
   - Navbar and back links adjusted.

4. **Vibe Check (`/vibe-check`)**:
   - Main container and typography updated.
   - **VibeCard**: Component updated to support dark selection states.
   - Modal and Progress bar styled.

### Components
- **DatePicker**: Updated calendar and birthday modes to support `dark:` classes (`bg-stone-800`, `text-stone-100`, etc.).
- **VibeCard**: Added dark mode support for selection states.

### Design System
- **Backgrounds**: `bg-stone-950` (Main), `bg-stone-900` (Cards), `bg-stone-800` (Inputs/Secondary).
- **Text**: `text-stone-100` (Primary), `text-stone-400` (Secondary).
- **Borders**: `border-stone-700/800`.
- **Accents**: White (`text-white`) for high contrast headers in dark mode.

The app should now automatically respect system preference or toggle (if a toggle button is added to the UI, currently it respects system preference/persisted state).
