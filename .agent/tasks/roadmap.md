# Minutes 2 Match - Feature Roadmap

Based on the current state of the application, here are 4 high-impact suggestions to improve user acquisition, retention, and engagement.

## 1. Viral Referral Hub 🚀
**Goal:** Leverage your existing backend referral system (`referral_code` column) to drive organic growth.
- **Action:** Create a `/me/referrals` page.
- **Features:** 
  - Display user's unique invite link/code.
  - Show a progress bar: "Invite 3 friends, get 1 free Event Ticket".
  - List successful referrals (Pending vs. Converted).
  - WhatsApp/Twitter share buttons.

## 2. "Live" Community Pulse ⚡
**Goal:** Increase FOMO and trust on the landing page.
- **Action:** Add a dynamic ticker or notification bubbles on the home page.
- **Content:** 
  - "Someone in East Legon just completed the Vibe Check"
  - "Accra Speed Dating Event is 80% Full"
  - "New Match Unlocked: 94% Compatibility"
- **Implementation:** Simple array of strings rotated randomly or real-time via Supabase Realtime.

## 3. Native App Experience (PWA) 📱
**Goal:** Increase retention by getting on the user's home screen.
- **Action:** Install `@vite-pwa/nuxt`.
- **Features:**
  - "Add to Home Screen" prompt for mobile users.
  - Verified Icon and Splash Screen.
  - Offline access to "My Tickets" (QR Codes).

## 4. Match "Teasers" 🫣
**Goal:** Encourage profile completion and payments.
- **Action:** Show "Potential Matches" in the dashboard even if not fully unlocked.
- **UI:** 
  - Display a blurred card with a "95% Match" badge.
  - "Fill your profile to reveal".
  - "Book an event to meet".

---

**Recommendation:** Start with **#1 (Referral Hub)** as the backend is already prepared and it directly drives new users.
