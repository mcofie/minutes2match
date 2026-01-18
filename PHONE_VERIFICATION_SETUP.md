# Phone Verification Setup & Testing

## Quick Fix: Development Bypass

**For immediate testing**, you can bypass phone verification by:
1. Fill in the phone number field with ANY number (e.g., `244111111`)
2. Click "Send Verification Code"
3. Enter `111111` as the OTP code
4. Click "Verify Code"

This will bypass the actual SMS sending and allow you to complete the flow.

---

## Full Setup (For Production)

### Step 1: Run the Database Migration

1. Go to your Supabase Dashboard: https://ziglffbvcexvwguqopqm.supabase.co
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run in the SQL Editor

This will create the `m2m` schema and all required tables, including `m2m.otp_codes`.

### Step 2: Verify Hubtel Credentials

Your `.env` file already has Hubtel credentials:
```
HUBTEL_CLIENT_ID=tshvvuam
HUBTEL_CLIENT_SECRET=ssakouxw
```

Make sure these are valid by testing at: https://developers.hubtel.com

### Step 3: Test the Flow

1. Restart your dev server: `npm run dev`
2. Navigate to `/vibe-check`
3. Fill in the form
4. Enter a real Ghanaian phone number (format: +233XXXXXXXXX)
5. Click "Send Verification Code"
6. Check the browser console for the generated OTP (it will be logged during development)
7. Enter the OTP code from the console
8. Click "Verify Code"

---

## Troubleshooting

### Issue: "Failed to send code"
- **Check browser console** for detailed error messages
- Verify Hubtel credentials are correct
- Ensure you have SMS credits in your Hubtel account

### Issue: "Invalid or expired code"
- Check the browser console for the generated OTP
- Ensure you're using the code within 5 minutes
- Try the bypass code `111111` for testing

### Issue: Database errors
- Run the migration script in Supabase SQL Editor
- Check that the `m2m` schema exists
- Verify RLS policies are enabled

---

## How It Works

1. **Send OTP**:
   - Generates a random 6-digit code
   - Stores in `m2m.otp_codes` table with 5-minute expiry
   - Sends SMS via Hubtel API
   - **DEV**: Logs the code to console

2. **Verify OTP**:
   - Checks if code exists and hasn't expired
   - Marks code as "used" after successful verification
   - **DEV**: Accepts `111111` as bypass code

3. **Create User**:
   - After verification, creates Supabase Auth user
   - Creates profile in `m2m.profiles`
   - Saves vibe answers to `m2m.vibe_answers`
   - Calculates and assigns dating persona
