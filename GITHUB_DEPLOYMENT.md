# GitHub Deployment Guide
## Push to Repository: https://github.com/bea0487/ghostapexops.git

---

## Pre-Push Checklist

### ✅ Code Verification
- [x] No TypeScript/JavaScript errors
- [x] All routes configured correctly
- [x] API endpoints created and tested
- [x] Security middleware implemented
- [x] Environment variables documented

### ✅ Files Ready
- [x] `.gitignore` configured (protects `.env`)
- [x] All documentation created
- [x] Stripe integration complete
- [x] Registration/Checkout flow implemented

---

## Step 1: Initialize Git (if not already done)

```bash
# Check if git is initialized
git status

# If not initialized, run:
git init
```

---

## Step 2: Add Remote Repository

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/bea0487/ghostapexops.git

# Verify remote was added
git remote -v
```

---

## Step 3: Stage All Files

```bash
# Add all files (except those in .gitignore)
git add .

# Verify what will be committed
git status
```

**IMPORTANT:** Make sure `.env` is NOT in the staged files!

---

## Step 4: Commit Changes

```bash
git commit -m "Complete registration and payment system implementation

- Added registration page with tier selection
- Integrated Stripe payment processing
- Created checkout flow with 30-day free trial
- Implemented server-side security validation
- Added webhook handling for subscription management
- Updated landing page design
- Created comprehensive documentation"
```

---

## Step 5: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If the branch is named 'master' instead:
git push -u origin master
```

**Note:** If you get an error about the branch not existing, you may need to create it first:

```bash
# Create and switch to main branch
git branch -M main

# Then push
git push -u origin main
```

---

## Step 6: Verify on GitHub

1. Go to: https://github.com/bea0487/ghostapexops
2. Verify all files are present
3. Check that `.env` is NOT visible (should be ignored)
4. Verify documentation files are readable

---

## Step 7: Connect to Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose: `bea0487/ghostapexops`
5. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Add Environment Variables:**
   Click "Environment Variables" and add ALL variables from your `.env` file:
   
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   AWS_REGION=your_aws_region
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_S3_BUCKET=your_s3_bucket_name
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_placeholder_will_add_after_deployment
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

7. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Step 8: Configure Stripe Webhook (CRITICAL!)

After deployment, you MUST configure the Stripe webhook:

1. **Get your production URL** from Vercel (e.g., `https://ghostapexops.vercel.app`)

2. **Go to Stripe Dashboard:**
   - https://dashboard.stripe.com/webhooks

3. **Add endpoint:**
   - URL: `https://your-production-url.vercel.app/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Copy webhook secret** (starts with `whsec_`)

5. **Update Vercel environment variable:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Update value to the actual webhook secret
   - Click "Save"

6. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## Step 9: Connect Custom Domain

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your custom domain

2. **Update DNS records** (at your domain registrar):
   - Add CNAME record pointing to Vercel
   - Follow Vercel's instructions

3. **Update environment variable:**
   - Change `FRONTEND_URL` to your custom domain
   - Redeploy

---

## Step 10: Test Production Deployment

### Test Registration Flow:
1. Go to `https://yourdomain.com/portal/register`
2. Create a test account
3. Select a tier
4. Complete Stripe checkout (⚠️ will charge real money!)
5. Verify webhook activates subscription
6. Log in and test features

### Verify Webhook:
1. Check Stripe Dashboard → Webhooks
2. Look for successful webhook deliveries
3. Check your database - client status should be 'active'

---

## Troubleshooting

### Push Rejected (Repository Not Empty)

If GitHub repository already has files:

```bash
# Pull existing files first
git pull origin main --allow-unrelated-histories

# Resolve any conflicts
# Then push
git push -u origin main
```

### Authentication Failed

```bash
# Use personal access token instead of password
# Generate token at: https://github.com/settings/tokens

# Or use SSH instead of HTTPS:
git remote set-url origin git@github.com:bea0487/ghostapexops.git
```

### Vercel Build Fails

Check build logs for errors. Common issues:
- Missing environment variables
- Node version mismatch
- Build command incorrect

### Webhook Not Working

1. Verify webhook URL is correct
2. Check webhook secret in Vercel
3. Ensure endpoint is publicly accessible
4. Check Stripe dashboard for delivery attempts

---

## Post-Deployment Checklist

- [ ] Code pushed to GitHub successfully
- [ ] Vercel deployment successful
- [ ] All environment variables configured
- [ ] Stripe webhook configured and tested
- [ ] Custom domain connected (if applicable)
- [ ] Registration flow tested in production
- [ ] Payment processing verified
- [ ] Webhook activates subscriptions
- [ ] All features accessible based on tier

---

## Continuous Deployment

Once connected to Vercel, any push to GitHub will automatically trigger a new deployment:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically deploy the changes
```

---

## Important Notes

### Security:
- ✅ `.env` file is NOT pushed to GitHub (protected by `.gitignore`)
- ✅ All secrets are stored in Vercel environment variables
- ✅ Never commit API keys or secrets to version control

### Monitoring:
- Monitor Stripe Dashboard for payments
- Check Vercel logs for errors
- Review Supabase dashboard for database activity

### Support:
- GitHub: https://github.com/bea0487/ghostapexops
- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com

---

## Quick Commands Reference

```bash
# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub
git push origin main

# Deploy to Vercel
vercel --prod

# View logs
vercel logs
```

---

**Ready to deploy!** 🚀

Follow the steps above to push your code to GitHub and deploy to production via Vercel.
