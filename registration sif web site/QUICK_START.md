# Quick Start Guide - Email Receipt System

## 🚀 Deploy in 3 Steps

### Step 1: Sign up for Resend (2 minutes)
1. Go to [resend.com](https://resend.com)
2. Create free account
3. Get your API key from dashboard
4. Copy the key (starts with `re_`)

---

### Step 2: Add Environment Variables in Netlify
1. Go to Netlify site → **Settings** → **Environment variables**
2. Click **Add a variable**
3. Add these two:

```
RESEND_API_KEY = re_your_api_key_here
SENDER_EMAIL = onboarding@resend.dev
```

---

### Step 3: Deploy
```bash
git add .
git commit -m "Add email receipt system"
git push
```

✅ **Done!** Netlify will auto-deploy and install packages.

---

## 📧 What Customers Get

After successful payment, customers automatically receive:
- ✅ Professional HTML email
- ✅ PDF receipt matching your template
- ✅ All booking details
- ✅ Payment confirmation

---

## 🧪 Test It

1. Make a test booking
2. Use test card: `4111 1111 1111 1111`
3. Check email (might be in spam first time)
4. Open PDF attachment

---

## 📁 Files Created

```
netlify/functions/
├── verify-booking.js          (Modified - sends emails)
└── utils/
    ├── generate-receipt.js   (New - creates PDF)
    └── email-template.js     (New - email HTML)

assets/
└── receipt-header.png        (New - receipt header)

package.json                   (Updated - added packages)
ENV_SETUP.md                   (New - detailed setup guide)
```

---

## 🆘 Need Help?

**Email not received?**
- Check spam folder
- Check Netlify function logs
- Verify `RESEND_API_KEY` is set correctly

**See**: [`ENV_SETUP.md`](file:///C:/Users/VICTUS/OneDrive/Desktop/registration%20sif%20web%20site/ENV_SETUP.md) for detailed troubleshooting

---

## 📊 Email Limits

**Free Tier (Resend):**
- 100 emails/day
- 3,000 emails/month
- Enough for ~3 bookings/day

**Need more?** Upgrade to Pro: $20/month for 50,000 emails

---

## ✨ Next Steps (Optional)

**Use your own domain:**
1. Add domain in Resend
2. Add DNS records
3. Change `SENDER_EMAIL` to `noreply@sifworld.com`
4. Redeploy

**Benefits:**
- ✅ No "via resend.dev" disclaimer
- ✅ Better deliverability  
- ✅ More professional

---

**Full documentation**: See [`walkthrough.md`](file:///C:/Users/VICTUS/.gemini/antigravity/brain/128b8751-f572-4989-b31f-6bef8707198a/walkthrough.md)
