
# Disable Dark Mode

Removed all dark mode functionality to enforce a Light Theme only.

### Changes
-   **app.vue**:
    -   Removed the `isDark` state and toggling logic.
    -   Removed the persistent dark mode check (localStorage).
    -   Removed the specific `.dark` CSS overrides for body background using `#0c0a09`.
    -   Removed the fixed position Dark Mode Toggle button.

### Result
The application now strictly uses the default Light Mode styles defined in Tailwind configuration (stone-50/white backgrounds, black/stone-900 text). Any `dark:` variants in the class names are now dormant as the `.dark` class is never applied.
