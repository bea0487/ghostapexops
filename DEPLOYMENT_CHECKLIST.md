# Deployment Checklist
## Ghost Rider: Apex Operations Portal

---

## Pre-Deployment Testing (Local)

### ✅ Test Registration Flow:
```bash
# Start your dev server
npm run dev

# Open browser to:
http://localhost:3001/portal/register
```

**Test Steps:**
1. [ ] Fill out registration form
2. [ ] Select a tier (Wingman/Guardian/Apex Command)
3. [ ] Click "Continue to Payment"
4. [ ] Verify checkout page loads with correct pricing
5. [ ] Click "Proceed to Secure Checkout"
6. [ ] Complete Stripe checkout (⚠️ This will charge real money!)
7. [ ] Verify redirect to success page

**Note:** Since webhook isn't set up yet, you'll need to manually activate the subscription in the database:

```sql
-- In Supabase SQL Editor:
UPDATE clients 
SET status = 'active',
    stripe_customer_id = 'cus_xxx',  -- Get from Stripe dashboard
    stripe_subscription_id = 'sub_xxx'  -- Get from Stripe dashboard
WHERE contact_email = 'your-test-email@example.com';
```

### ✅ Test Login Flow:
1. [ ] Go to http://localhost:3001/portal/login
2. [ ] Log in with registered credentials
3. [ ] Verify redirect to dashboard
4. [ ] Check that features match selected tier

---

## Deployment Steps

### 1. Update Environment Variables for Production

Update your `.env` or hosting platform environment variables:

```bash
# Update these values:
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production

# Keep these the same:
VITE_SUPABASE_URL=https://dsquakmspzspgvfoouqy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_SUPABASE_URL=https://dsquakmspzspgvfoouqy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=your_s3_bucket_name
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 2. Deploy to Your Domain

**If using Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**If using Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**If using your own server:**
```bash
# Build the app
npm run build

# Upload build files to your server
# Set up nginx/apache to serve the app
```

### 3. Set Up Stripe Webhook (CRITICAL!)

Once your app is deployed:

1. **Go to:** [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)

2. **Click:** "Add endpoint"

3. **Enter your production URL:**
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

4. **Select these events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click:** "Add endpoint"

6. **Copy the webhook secret** (starts with `whsec_`)

7. **Update your production environment variable:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_actual_secret_from_stripe
   ```

8. **Redeploy** your app with the new webhook secret

### 4. Test Webhook in Production

**Test from Stripe Dashboard:**
1. Go to your webhook endpoint in Stripe
2. Click "Send test webhook"
3. Select `checkout.session.completed`
4. Click "Send test webhook"
5. Check your app logs to verify it was received

**Test with Real Payment:**
1. Create a new test account on your production site
2. Complete the checkout flow
3. Verify the webhook is received
4. Check database: client status should be 'active'
5. Log in and verify access to features

---

## Post-Deployment Verification

### ✅ Registration & Payment:
- [ ] Registration page loads correctly
- [ ] Tier selection works
- [ ] Checkout redirects to Stripe
- [ ] Payment processes successfully
- [ ] Webhook activates subscription automatically
- [ ] User can log in after registration

### ✅ Authentication:
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works
- [ ] Session persists across page refreshes

### ✅ Tier-Based Access:
- [ ] Wingman users see correct features
- [ ] Guardian users see correct features
- [ ] Apex Command users see all features
- [ ] Restricted features show upgrade message

### ✅ Document Management:
- [ ] Upload document works
- [ ] Download document works
- [ ] Delete document works
- [ ] Files stored in S3 correctly
- [ ] Only user's own documents visible

### ✅ Subscription Management:
- [ ] Subscription status displays correctly
- [ ] Cancel subscription works
- [ ] Subscription shows "cancels at period end"

---

## Monitoring & Maintenance

### Set Up Monitoring:

1. **Stripe Dashboard:**
   - Monitor payments
   - Check webhook delivery
   - Review failed payments

2. **Supabase Dashboard:**
   - Monitor database queries
   - Check authentication logs
   - Review RLS policy performance

3. **AWS S3:**
   - Monitor storage usage
   - Check access logs
   - Review costs

4. **Application Logs:**
   - Set up error tracking (Sentry, LogRocket, etc.)
   - Monitor API response times
   - Track user registration/login rates

### Regular Maintenance:

- [ ] Review Stripe webhook logs weekly
- [ ] Check for failed payments
- [ ] Monitor S3 storage costs
- [ ] Review security logs for unauthorized access attempts
- [ ] Update dependencies monthly
- [ ] Rotate API keys every 90 days

---

## Troubleshooting

### Webhook Not Working:

**Check:**
1. Webhook URL is correct (https://yourdomain.com/api/stripe/webhook)
2. Webhook secret is correct in environment variables
3. App has been redeployed after adding webhook secret
4. Webhook endpoint is publicly accessible (not behind auth)
5. Check Stripe dashboard for webhook delivery attempts

**Test:**
```bash
# Check if webhook endpoint is accessible:
curl -X POST https://yourdomain.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Should return 400 (signature verification failed) - this is expected
# If it returns 404, your endpoint isn't set up correctly
```

### Subscription Not Activating:

**Manual Fix:**
```sql
-- In Supabase SQL Editor:
UPDATE clients 
SET status = 'active',
    stripe_customer_id = 'cus_xxx',  -- From Stripe dashboard
    stripe_subscription_id = 'sub_xxx'  -- From Stripe dashboard
WHERE contact_email = 'customer@example.com';
```

### Payment Failing:

**Check:**
1. Stripe is in Live Mode (not Test Mode)
2. Customer's card is valid
3. Stripe account is fully activated
4. No holds or restrictions on Stripe account

---

## Security Reminders

### ⚠️ NEVER Commit These to Git:
- `.env` file
- Stripe secret keys
- AWS secret keys
- Supabase service role key

### ✅ Always Use Environment Variables:
- Set them in your hosting platform
- Use different keys for dev/staging/production
- Rotate keys regularly

### 🔒 Enable Security Features:
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Database backups enabled

---

## Success Criteria

Your deployment is successful when:

✅ Users can register and select a tier  
✅ Stripe checkout processes payments  
✅ Webhooks activate subscriptions automatically  
✅ Users can log in and access tier-appropriate features  
✅ Documents upload/download correctly  
✅ No errors in application logs  
✅ Stripe dashboard shows successful payments  
✅ Database updates correctly on payment events  

---

## Next Steps After Deployment

1. **Monitor for 24 hours:**
   - Watch for errors
   - Check webhook delivery
   - Verify payments processing

2. **Test with real users:**
   - Have a few test customers sign up
   - Get feedback on the flow
   - Fix any issues that arise

3. **Marketing:**
   - Update website with registration link
   - Send email to existing customers
   - Announce new self-service registration

4. **Support:**
   - Prepare support documentation
   - Train team on new registration flow
   - Set up customer support channels

---

## Emergency Contacts

**If something goes wrong:**

- **Stripe Support:** https://support.stripe.com
- **Supabase Support:** https://supabase.com/support
- **AWS Support:** https://aws.amazon.com/support

**Quick Fixes:**

- **Disable registration:** Comment out the route in your app
- **Pause webhooks:** Disable endpoint in Stripe dashboard
- **Rollback:** Redeploy previous version

---

## Deployment Complete! 🚀

Once you've completed all the steps above, your Ghost Rider: Apex Operations Portal will be live and accepting new customer registrations with automatic payment processing!

**Good luck with your launch!** 🎉
