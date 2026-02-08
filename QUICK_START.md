# Quick Start: Deploy to Vercel

## 🚀 Fast Track Deployment

### Step 1: Push to GitHub (5 minutes)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ghost Rider Portal: Registration, Stripe, Security"

# Connect to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel (10 minutes)

1. **Go to:** [https://vercel.com](https://vercel.com)
2. **Sign in** with GitHub
3. **Click:** "Add New..." → "Project"
4. **Import** your repository
5. **Add Environment Variables** (copy from `.env` file):
   - All `VITE_*` variables
   - All `NEXT_PUBLIC_*` variables
   - All `AWS_*` variables
   - All `STRIPE_*` variables
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FRONTEND_URL` (set to your domain)
   - `NODE_ENV=production`
6. **Click:** "Deploy"

### Step 3: Connect Domain (5 minutes)

1. In Vercel: **Settings** → **Domains**
2. Add your domain
3. Update DNS at your registrar:
   - A Record: `@` → `76.76.21.21`
   - CNAME: `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 min)

### Step 4: Set Up Stripe Webhook (5 minutes)

1. **Go to:** [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint:** `https://yourdomain.com/api/stripe/webhook`
3. **Select events:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret**
5. **Update in Vercel:** Environment Variables → `STRIPE_WEBHOOK_SECRET`
6. **Redeploy**

### Step 5: Test! (10 minutes)

1. Visit `https://yourdomain.com/portal/register`
2. Create test account
3. Complete payment
4. Verify subscription activates
5. Log in and test features

---

## ✅ Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] Domain connected
- [ ] SSL certificate active
- [ ] Stripe webhook configured
- [ ] Test registration completed
- [ ] Payment processed successfully
- [ ] Subscription activated
- [ ] Features accessible

---

## 📚 Detailed Guides

- **Full Deployment:** See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Security Info:** See `SECURITY_AUDIT.md`
- **API Keys:** See `API_KEYS_SETUP_GUIDE.md`

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails:** Check environment variables in Vercel
2. **Webhook not working:** Verify URL and secret
3. **Domain not working:** Wait for DNS propagation
4. **Payment fails:** Check Stripe dashboard

**Support:**
- Vercel: https://vercel.com/support
- Stripe: https://support.stripe.com

---

**Total Time: ~35 minutes** ⏱️

**You're ready to go live!** 🎉
