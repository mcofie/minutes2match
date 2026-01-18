# Minutes 2 Match - System Analysis & Implementation Plan

## Executive Summary
This document outlines the gaps between the current implementation and the specified requirements,
along with proposed solutions for each gap.

---

## ✅ IMPLEMENTATION COMPLETE

All critical and important features have been implemented:

### Phase 1: Critical Features - ✅ COMPLETED
1. **Mutual Payment Unlock Logic** - Match requires BOTH users to pay before unlocking
2. **SMS Reminder for Unpaid User** - Automatic notification when partner pays
3. **Display Name Collection** - Added to onboarding Step 1
4. **Post-Onboarding Messaging** - Users informed about notification flow

### Phase 2: Important Features - ✅ COMPLETED
5. **Event Qualification System** - Admin can assign users to specific events
6. **Global Settings Configuration** - Admin settings page for fees and pricing
7. **TypeScript Type Definitions** - Database types for Supabase
8. **Dynamic Questions System** - Admin can manage onboarding/vibe questions

---

## Files Created/Updated

### New Files Created:
| File | Purpose |
|------|---------|
| `/supabase/migrations/002_mutual_payment_tracking.sql` | Database migration for mutual payment |
| `/supabase/migrations/003_dynamic_questions.sql` | Migration for dynamic questions table |
| `/pages/admin/settings.vue` | Admin settings page for global configuration |
| `/pages/admin/questions.vue` | Admin page to manage onboarding questions |
| `/types/database.ts` | TypeScript type definitions for Supabase |

### Files Updated:
| File | Changes |
|------|---------|
| `/supabase/RESET_AND_SETUP.sql` | Added mutual payment fields to matches table |
| `/server/api/paystack/webhook.post.ts` | Complete rewrite with dual-payment logic + SMS reminder |
| `/pages/vibe-check/index.vue` | Display name field + post-onboarding messaging |
| `/pages/dashboard/index.vue` | Handles `partial_payment` status, passes `currentUserPaid` |
| `/components/BlindProfileCard.vue` | "Waiting for them" state when user has paid but partner hasn't |
| `/pages/admin/index.vue` | Added Settings link to navigation |
| `/pages/admin/users.vue` | Added Settings link to navigation |
| `/pages/admin/matches.vue` | Added Settings link + `partial_payment` status styling |
| `/pages/admin/events/index.vue` | Event qualification modal + "Qualify Users" button |

---

## Feature Details

### 1. Mutual Payment Unlock System

**How it works:**
- When admin creates a match, both users receive SMS notification
- Match starts in `pending_payment` status
- When User A pays → status becomes `partial_payment`, User A's side is tracked (`user_1_paid = true`)
- User B receives SMS reminder: "Your match has unlocked their side! Pay now..."
- When User B pays → status becomes `unlocked` and both can see full profiles

**Database Schema:**
```sql
-- Matches table now includes:
user_1_paid BOOLEAN DEFAULT FALSE,
user_2_paid BOOLEAN DEFAULT FALSE,
user_1_paid_at TIMESTAMPTZ,
user_2_paid_at TIMESTAMPTZ,
status CHECK (status IN ('pending_payment', 'partial_payment', 'unlocked', 'rejected', 'expired'))
```

### 2. Event Qualification System

**How it works:**
- Admin clicks "👥 Qualify" on any event card
- Modal opens with searchable list of all verified users
- Admin can add/remove users from the qualified list
- Admin can send bulk SMS notification to all qualified users
- Optional: Events can be marked as public (all users can see) or private (only qualified users)

**Database Schema:**
```sql
CREATE TABLE m2m.event_qualifications (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES m2m.events(id),
  user_id UUID REFERENCES m2m.profiles(id),
  status TEXT CHECK (status IN ('pending', 'qualified', 'invited')),
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
```

### 3. Admin Settings Page

**Features:**
- Configure default match unlock fee (GH₵)
- Configure default male/female ticket prices
- Set match expiry period (days)
- Update platform name

**Route:** `/admin/settings`

### 4. Display Name Collection

**Where:** Onboarding Step 1 (Vibe Check)
**Field:** "What should we call you?"
**Validation:** Minimum 2 characters required

### 5. Post-Onboarding Messaging

**Where:** Persona reveal step (Step 6)
**Message:**
> **What happens next?**
> - 🎟️ We'll SMS you when you qualify for a speed-dating event  
> - 💕 We'll notify you when a compatible match is found

---

## Dashboard Match States

The BlindProfileCard component now handles three states:

| State | Status | User Paid | Partner Paid | UI |
|-------|--------|-----------|--------------|-----|
| Locked | `pending_payment` | ❌ | ❌ | "Unlock Profile" button + price |
| Waiting | `partial_payment` | ✅ | ❌ | "⏳ Waiting for them" message |
| Unlocked | `unlocked` | ✅ | ✅ | Profile revealed + contact info |

---

## How to Apply Database Changes

### For Existing Database:
Run the migration in Supabase SQL Editor:
```sql
-- Copy and paste the contents of:
-- /supabase/migrations/002_mutual_payment_tracking.sql
```

### For Fresh Install:
The `RESET_AND_SETUP.sql` has been updated with all new fields.

---

## TypeScript Notes

The `/types/database.ts` file provides type definitions for all database tables. For full TypeScript integration with Supabase, you can:

1. Configure Nuxt to use the types (optional)
2. Or generate fresh types from your Supabase project:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

The existing `@ts-ignore` comments in the codebase suppress TypeScript errors without affecting runtime functionality.

---

## Testing Checklist

Before deploying, test these flows:

### Match Unlock Flow
- [ ] Admin creates match between User A and User B
- [ ] Both users receive SMS notification
- [ ] User A logs in and sees match in "Matches" tab (locked)
- [ ] User A clicks "Unlock Profile" and pays via Paystack
- [ ] User A's card now shows "Waiting for them"
- [ ] User B receives SMS reminder
- [ ] User B logs in, sees match (locked), pays
- [ ] Both users now see fully unlocked profiles with phone numbers

### Event Qualification Flow
- [ ] Admin goes to Events page
- [ ] Clicks "👥 Qualify" on an event
- [ ] Searches for and adds users
- [ ] Clicks "Notify Users via SMS"
- [ ] Users receive SMS invitation
- [ ] Qualified users can see and book the event

### Settings Flow
- [ ] Admin goes to Settings page
- [ ] Changes default match unlock fee
- [ ] Saves settings
- [ ] Creates new match - should use new default price

### Onboarding Flow
- [ ] New user starts vibe check
- [ ] Step 1 includes display name field
- [ ] User must enter name to proceed
- [ ] After persona reveal, "What happens next?" section is visible
- [ ] User clicks "Go to Dashboard"
- [ ] Profile shows display name

---

## Summary

All critical features have been implemented:

✅ **Mutual Payment** - Match unlocks only when both users pay  
✅ **SMS Reminders** - Unpaid user gets reminder when partner pays  
✅ **Display Name** - Collected during onboarding  
✅ **Event Qualification** - Admin can assign users to events + notify via SMS  
✅ **Global Settings** - Admin can configure default fees  
✅ **Post-Onboarding** - Users know they'll be contacted  

The platform is now feature-complete for the core dating/matching functionality!
