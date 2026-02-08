# Vercel Deployment Guide
## Ghost Rider: Apex Operations Portal

---

## Step 1: Prepare for GitHub

### ✅ Files Ready for Commit:

**Safe to commit (already done):**
- ✅ `.gitignore` - Protects sensitive files
- ✅ `vercel.json` - Vercel configuration
- ✅ All source code files
- ✅ Documentation files
- ✅ `package.json` and `package-lock.json`

**NEVER commit (protected by .gitignore):**
- ❌ `.env` - Contains all your API keys
- ❌ `node_modules/` - Dependencies
- ❌ `.next/` - Build files

---

## Step 2: Push to GitHub

### Initialize Git (if not already done):

```bash
# Check if git is initialized
git status

# If not initialized, run:
git init
git add .
git commit -m "Initial commit: Ghost Rider Apex Operations Portal"
```

### Connect to GitHub:

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/yourusername/ghost-rider-portal.git
git branch -M main
git push -u origin main
```

**Or if you already have a repo:**
```bash
git add .
git commit -m "Add registration, Stripe integration, and security features"
git push
```

---

## Step 3: Connect to Vercel

### A. Sign Up / Log In to Vercel:

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Sign Up" or "Log In"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

### B. Import Your Project:

1. Click "Add New..." → "Project"
2. Find your GitHub repository: `ghost-rider-portal`
3. Click "Import"

### C. Configure Project:

**Framework Preset:** Next.js (should auto-detect)

**Root Directory:** `./` (leave as default)

**Build Command:** `npm run build` (should auto-fill)

**Output Directory:** `.next` (should auto-fill)

**Install Command:** `npm install` (should auto-fill)

---

## Step 4: Add Environment Variables in Vercel

### ⚠️ CRITICAL: Add ALL Environment Variables

In the Vercel project settings, go to **Settings** → **Environment Variables**

Add each of these (copy from your local `.env` file):

#### Supabase Configuration:
```
VITE_SUPABASE_URL = https://dsquakmspzspgvfoouqy.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcXVha21zcHpzcGd2Zm9vdXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTM1NDgsImV4cCI6MjA4NTkyOTU0OH0.k3Q6TaHH97UPiYt2rCjyhSjnoBZdkM37NRrJmEVgPtc

NEXT_PUBLIC_SUPABASE_URL = https://dsquakmspzspgvfoouqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcXVha21zcHpzcGd2Zm9vdXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNTM1NDgsImV4cCI6MjA4NTkyOTU0OH0.k3Q6TaHH97UPiYt2rCjyhSjnoBZdkM37NRrJmEVgPtc

SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzcXVha21zcHpzcGd2Zm9vdXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDM1MzU0OCwiZXhwIjoyMDg1OTI5NTQ4fQ.LanZg8xg7Hi5-Aj4AGDdsYR7WXIvPw10n5U0Q3rfsvo
```

#### AWS S3 Configuration:
```
AWS_REGION = us-east-2
AWS_ACCESS_KEY_ID = your_aws_access_key_here
AWS_SECRET_ACCESS_KEY = your_aws_secret_key_here
AWS_S3_BUCKET = ghostapex-documents-prod
```

#### Stripe Configuration:
```
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_your_publishable_key_here

STRIPE_SECRET_KEY = sk_live_your_secret_key_here

STRIPE_WEBHOOK_SECRET = whsec_placeholder_will_add_after_deployment
```

#### Application Configuration:
```
FRONTEND_URL = https://yourdomain.com
NODE_ENV = production
```

**Important:** For each variable, select **"Production"** environment (and optionally Preview/Development)

---

## Step 5: Deploy

1. Click **"Deploy"** button in Vercel
2. Wait for build to complete (~2-5 minutes)
3. You'll get a URL like: `https://ghost-rider-portal.vercel.app`

---

## Step 6: Connect Your Custom Domain

### A. Add Domain in Vercel:

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Enter your domain: `yourdomain.com`
4. Click **Add**

### B. Configure DNS:

Vercel will show you DNS records to add. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

**For root domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Wait 5-60 minutes for DNS propagation**

### C. Verify Domain:

Once DNS propagates, Vercel will automatically issue an SSL certificate and your site will be live at `https://yourdomain.com`

---

## Step 7: Set Up Stripe Webhook (CRITICAL!)

### Now that your site is live:

1. **Go to:** [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

2. **Click:** "Add endpoint"

3. **Enter your production URL:**
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click:** "Add endpoint"

6. **Copy the webhook secret** (starts with `whsec_`)

7. **Update in Vercel:**
   - Go to Vercel project → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Click "Edit"
   - Replace placeholder with actual secret
   - Click "Save"

8. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## Step 8: Test Your Production Site

### ✅ Test Registration:
1. Go to `https://yourdomain.com/portal/register`
2. Create a test account
3. Select a tier
4. Complete Stripe checkout (⚠️ real payment!)
5. Verify webhook activates subscription
6. Log in and test features

### ✅ Test Webhook:
1. Go to Stripe Dashboard → Webhooks
2. Click on your endpoint
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Check Vercel logs to verify receipt

### ✅ Verify Everything:
- [ ] Registration works
- [ ] Payment processes
- [ ] Webhook activates subscription
- [ ] Login works
- [ ] Features match tier
- [ ] Documents upload/download
- [ ] SSL certificate active (https://)

---

## Step 9: Monitor Your Deployment

### Vercel Dashboard:
- **Deployments:** See all deployments and their status
- **Logs:** Real-time application logs
- **Analytics:** Traffic and performance metrics
- **Functions:** Serverless function logs

### Check Logs:
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# View logs
vercel logs
```

---

## Troubleshooting

### Build Fails:

**Check:**
1. All environment variables are set in Vercel
2. `package.json` has all dependencies
3. Build command is correct: `npm run build`
4. Check Vercel build logs for specific errors

**Common fixes:**
```bash
# Locally test the build
npm run build

# If it fails locally, fix errors first
# Then commit and push
git add .
git commit -m "Fix build errors"
git push
```

### Environment Variables Not Working:

**Check:**
1. Variables are set for "Production" environment
2. Variable names match exactly (case-sensitive)
3. No extra spaces in values
4. Redeploy after adding variables

### Domain Not Working:

**Check:**
1. DNS records are correct
2. Wait 5-60 minutes for DNS propagation
3. Check domain status in Vercel
4. Verify SSL certificate issued

### Webhook Not Receiving Events:

**Check:**
1. Webhook URL is correct (https://yourdomain.com/api/stripe/webhook)
2. Webhook secret is updated in Vercel
3. App was redeployed after updating secret
4. Check Stripe dashboard for delivery attempts
5. Check Vercel function logs

---

## Automatic Deployments

### Every time you push to GitHub:

1. Vercel automatically detects the push
2. Builds your app
3. Runs tests (if configured)
4. Deploys to production
5. Sends you a notification

### Preview Deployments:

- Every pull request gets a preview URL
- Test changes before merging to main
- Preview URLs: `https://ghost-rider-portal-git-branch.vercel.app`

---

## Rollback (If Needed)

### If something goes wrong:

1. Go to Vercel → Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"
4. Previous version is instantly live

---

## Environment-Specific URLs

After deployment, you'll have:

- **Production:** `https://yourdomain.com`
- **Vercel URL:** `https://ghost-rider-portal.vercel.app`
- **Preview:** `https://ghost-rider-portal-git-branch.vercel.app`

All will work, but use your custom domain for production.

---

## Security Checklist

Before going live:

- [ ] `.env` file is NOT in GitHub (check .gitignore)
- [ ] All environment variables set in Vercel
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Stripe webhook secret updated
- [ ] Database RLS policies active
- [ ] S3 bucket permissions correct
- [ ] Test with real payment
- [ ] Monitor logs for errors

---

## Success! 🎉

Your Ghost Rider: Apex Operations Portal is now live!

**Next Steps:**
1. Test thoroughly with real users
2. Monitor Stripe dashboard for payments
3. Check Vercel logs for any errors
4. Set up monitoring/alerts
5. Announce to your customers!

---

## Quick Commands Reference

```bash
# Push to GitHub
git add .
git commit -m "Your commit message"
git push

# Install Vercel CLI
npm i -g vercel

# Deploy manually (if needed)
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls
```

---

## Support

**Vercel Support:** [https://vercel.com/support](https://vercel.com/support)  
**Vercel Docs:** [https://vercel.com/docs](https://vercel.com/docs)  
**Vercel Discord:** [https://vercel.com/discord](https://vercel.com/discord)

---

**You're ready to deploy!** 🚀

Follow the steps above and your app will be live in minutes.
