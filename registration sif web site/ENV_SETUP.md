# Environment Variables Setup Guide

This document lists all the environment variables required for the Sunyatee Retreat booking website to function properly.

## Required Environment Variables

Add these variables in your Netlify dashboard under **Site settings → Environment variables**.

### 1. Supabase Configuration

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**How to get these:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "service_role secret key"

---

### 2. Razorpay Payment Gateway

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**How to get these:**
1. Log in to your Razorpay dashboard
2. Go to "Settings" → "API Keys"
3. Generate or copy your Key ID and Key Secret
4. **Important**: Use LIVE keys for production, TEST keys for testing

---

### 3. Email Service (Resend)

```
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@sifworld.com
```

**How to get these:**

#### Step 1: Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

#### Step 2: Get API Key
1. After signing in, go to "API Keys" in the dashboard
2. Click "Create API Key"
3. Give it a name (e.g., "Sunyatee Production")
4. Copy the API key (starts with `re_`)

#### Step 3: Set up sender email

**Option A: Use Resend's test domain (Quick start)**
```
SENDER_EMAIL=onboarding@resend.dev
```
This works immediately but shows "via resend.dev" in emails.

**Option B: Use your own domain (Recommended for production)**
1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `sifworld.com`)
4. Add the DNS records shown to your domain registrar
5. Once verified, set:
```
SENDER_EMAIL=noreply@sifworld.com
```

---

## Complete Environment Variables List

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
SENDER_EMAIL=noreply@sifworld.com
```

---

## Verification

After adding all environment variables:

1. **Redeploy your site** on Netlify (Environment variable changes require redeployment)
2. **Test the booking flow** with a small amount payment
3. **Check email delivery** - You should receive a confirmation email with PDF receipt
4. **Check Netlify function logs** for any errors

---

## Troubleshooting

### Emails not sending?
- Check that `RESEND_API_KEY` is correctly set
- Verify your sender email is added in Resend dashboard
- Check Netlify function logs for errors

### Database not updating?
- Verify `SUPABASE_SERVICE_ROLE_KEY` (not anon key!)
- Check Supabase table permissions

### Payment failing?
- Ensure you're using the correct Razorpay key pair (both keys from same environment)
- For testing, use TEST mode keys
- For production, use LIVE mode keys

---

## Security Notes

⚠️ **NEVER** commit these values to Git or share them publicly!

✅ All sensitive keys should ONLY be stored in Netlify's environment variables dashboard.
