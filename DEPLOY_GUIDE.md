# JE Garmon CM Consulting — Deployment Guide
## Full Setup: Vercel + Airtable + Email + SMS

---

## WHAT YOU'RE DEPLOYING

A fully autonomous client acquisition platform with:
- **AI Intake Consultant** (Claude-powered, 24/7)
- **Lead storage** → Airtable (permanent, spreadsheet-style)
- **Email alerts** → Gmail (every new lead)
- **SMS alerts** → Twilio (instant text to your phone)

---

## STEP 1 — Get Your API Keys (15–20 min total)

### A) Anthropic (AI Engine)
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click **"API Keys"** → **"Create Key"**
4. Copy the key → save as `ANTHROPIC_API_KEY`
5. Add $10–20 credit (each conversation costs ~$0.01)

### B) Airtable (Lead Storage)
1. Go to https://airtable.com → Sign up free
2. Create a new **Base** called `JE Garmon Consulting`
3. Create a **Table** called `Leads` with these fields:
   - Name (Single line text)
   - Company (Single line text)
   - Email (Email)
   - Phone (Phone number)
   - Project Type (Single line text)
   - Installation / Location (Single line text)
   - Status (Single select: New Lead, Contacted, Qualified, Closed)
   - Source (Single line text)
   - Submitted At (Date)
   - Notes (Long text)
4. Go to https://airtable.com/create/tokens → **"Create new token"**
   - Scope: `data.records:write`, `data.records:read`
   - Access: your base
   - Copy token → save as `AIRTABLE_TOKEN`
5. Open your base in browser → copy the ID from the URL:
   `airtable.com/YOUR_BASE_ID/...` → save as `AIRTABLE_BASE_ID`

### C) Gmail App Password (Email Alerts)
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** if not already on
3. Search "App passwords" → create one for "Mail"
4. Copy the 16-character password → save as `SMTP_PASS`
5. Your Gmail address → save as `SMTP_USER`
6. The email to receive alerts (can be same) → save as `NOTIFY_EMAIL`

### D) Twilio (SMS Alerts)
1. Go to https://twilio.com → Sign up free (includes trial credit)
2. From Console dashboard:
   - Copy **Account SID** → save as `TWILIO_ACCOUNT_SID`
   - Copy **Auth Token** → save as `TWILIO_AUTH_TOKEN`
3. Get a phone number: **Phone Numbers → Manage → Buy a number** (free on trial)
   - Copy number → save as `TWILIO_FROM_NUMBER` (format: +1xxxxxxxxxx)
4. Your cell phone number → save as `NOTIFY_PHONE` (format: +1xxxxxxxxxx)

---

## STEP 2 — Deploy to Vercel (10 min)

### Option A: Deploy via GitHub (Recommended)
1. Install Git if needed: https://git-scm.com
2. Create a free GitHub account: https://github.com
3. Create a new repository called `jegarmon-consulting`
4. In your terminal, from the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial deploy"
   git remote add origin https://github.com/YOUR_USERNAME/jegarmon-consulting.git
   git push -u origin main
   ```
5. Go to https://vercel.com → Sign up with GitHub
6. Click **"Add New Project"** → Import your repo
7. Click **"Deploy"** (it auto-detects Next.js)

### Option B: Deploy via Vercel CLI
1. Install Node.js: https://nodejs.org (LTS version)
2. In terminal:
   ```bash
   npm install -g vercel
   cd /path/to/jegarmon
   vercel
   ```
3. Follow the prompts

---

## STEP 3 — Add Environment Variables in Vercel

1. In Vercel dashboard → your project → **Settings → Environment Variables**
2. Add each variable (copy from your saved list):

| Variable | Value |
|---|---|
| ANTHROPIC_API_KEY | your_key |
| AIRTABLE_TOKEN | your_token |
| AIRTABLE_BASE_ID | your_base_id |
| AIRTABLE_TABLE_NAME | Leads |
| SMTP_USER | yourname@gmail.com |
| SMTP_PASS | your_app_password |
| NOTIFY_EMAIL | james@jegarmon.com |
| TWILIO_ACCOUNT_SID | your_sid |
| TWILIO_AUTH_TOKEN | your_token |
| TWILIO_FROM_NUMBER | +1xxxxxxxxxx |
| NOTIFY_PHONE | +1xxxxxxxxxx |

3. Click **"Redeploy"** after saving all variables

---

## STEP 4 — Add Your Custom Domain (Optional but Recommended)

1. In Vercel → your project → **Settings → Domains**
2. Add `consult.jegarmon.com` (or whatever you own)
3. Follow Vercel's DNS instructions (update your domain registrar)
4. SSL is automatic — your site is live at your domain within minutes

---

## HOW IT WORKS (once live)

```
Client visits your site
       ↓
Fills out intake form
       ↓
AI Consultant qualifies them (24/7, no one needed)
       ↓
Lead saved to Airtable ──→ You get Email + SMS instantly
       ↓
AI generates scoped proposal
       ↓
Client is invited to schedule a call with James
```

---

## ESTIMATED MONTHLY COSTS

| Service | Cost |
|---|---|
| Vercel hosting | Free (Hobby plan) |
| Anthropic AI | ~$5–15/mo (usage-based) |
| Airtable | Free (up to 1,000 records) |
| Gmail | Free |
| Twilio SMS | ~$1/mo + $0.0079/text |
| **Total** | **~$6–20/mo** |

---

## NEED HELP?

Contact info for each service:
- Vercel: https://vercel.com/docs
- Anthropic: https://docs.anthropic.com
- Airtable: https://support.airtable.com
- Twilio: https://help.twilio.com
