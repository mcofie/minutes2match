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

This will create the `m2m` schema and all required tables.

### Step 2: Configure Zend API Key

Your `.env` file needs a Zend API key:
```
ZEND_API_KEY=your_zend_api_key_here
```

Get your API key from: https://www.tryzend.com

### Step 3: Test the Flow

1. Restart your dev server: `npm run dev`
2. Navigate to `/vibe-check`
3. Fill in the form
4. Enter a real Ghanaian phone number (format: +233XXXXXXXXX)
5. Click "Send Verification Code"
6. Enter the OTP code sent to your phone
7. Click "Verify Code"

---

## Troubleshooting

### Issue: "Failed to send code"
- **Check browser console** for detailed error messages
- Verify your Zend API key is correct in `.env`
- Ensure you have SMS credits in your Zend account

### Issue: "Invalid or expired code"
- OTP codes expire after 5 minutes
- Try the bypass code `111111` for development testing

### Issue: Database errors
- Run the migration script in Supabase SQL Editor
- Check that the `m2m` schema exists
- Verify RLS policies are enabled

---

## How It Works

1. **Send OTP**:
   - Client calls `/api/otp/send` server route
   - Server calls ZendOTP API to send a 6-digit code
   - Returns an `otpId` to the client for tracking
   - **DEV**: Use `111111` as bypass code

2. **Verify OTP**:
   - Client sends `otpId` + `code` to `/api/otp/verify` (or `/api/auth/login`)
   - Server calls ZendOTP verify API to validate
   - **DEV**: Accepts `111111` as bypass code

3. **Create User**:
   - After verification, creates Supabase Auth user
   - Creates profile in `m2m.profiles`
   - Saves vibe answers to `m2m.vibe_answers`
   - Calculates and assigns dating persona
