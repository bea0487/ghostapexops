# Stripe CLI Setup Guide
## Local Webhook Testing for Ghost Rider: Apex Operations

---

## Why Use Stripe CLI?

Without Stripe CLI, webhooks won't work on your local machine because Stripe can't reach `localhost`. This means:
- ❌ Subscriptions won't activate automatically after payment
- ❌ You'll need to manually update the database
- ❌ Can't test the complete payment flow

With Stripe CLI:
- ✅ Webhooks work locally
- ✅ Subscriptions activate automatically
- ✅ Test the complete flow end-to-end
- ✅ See webhook events in real-time

---

## Installation

### Windows

**Option 1: Direct Download**
1. Go to: https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_windows_x86_64.zip`
3. Extract to a folder (e.g., `C:\stripe`)
4. Add to PATH or run from that folder

**Option 2: Scoop**
```bash
scoop install stripe
```

**Option 3: Chocolatey**
```bash
choco install stripe-cli
```

### Mac

```bash
brew install stripe/stripe-cli/stripe
```

### Linux

```bash
# Download latest release
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz

# Extract
tar -xvf stripe_linux_x86_64.tar.gz

# Move to /usr/local/bin
sudo mv stripe /usr/local/bin/
```

---

## Setup (5 Minutes)

### Step 1: Login to Stripe

```bash
stripe login
```

This will:
1. Open your browser
2. Ask you to allow access
3. Authenticate the CLI with your Stripe account

### Step 2: Start Webhook Forwarding

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_1234567890abcdef...
```

**IMPORTANT:** Copy that webhook secret!

### Step 3: Update Your .env File

Open `.env` and update:
```bash
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

Replace `whsec_placeholder_will_add_on_deployment` with the actual secret from Step 2.

### Step 4: Restart Your Dev Server

```bash
# Stop your current server (Ctrl+C)
# Start it again:
npm run dev
```

---

## Testing the Setup

### Test 1: Trigger a Test Event

In a **new terminal** (keep the `stripe listen` running):

```bash
stripe trigger checkout.session.completed
```

You should see:
- ✅ Event appears in the `stripe listen` terminal
- ✅ Your dev server logs show webhook received
- ✅ No errors

### Test 2: Complete a Real Payment

1. Go to `http://localhost:3001/portal/register`
2. Fill out the registration form
3. Select a tier
4. Click "Continue to Payment"
5. Click "Proceed to Secure Checkout"
6. Complete the Stripe checkout (⚠️ will charge real money!)
7. Watch the `stripe listen` terminal

You should see:
```
2026-02-08 12:34:56   --> checkout.session.completed [evt_xxx]
2026-02-08 12:34:56  <--  [200] POST http://localhost:3001/api/stripe/webhook [evt_xxx]
```

This means:
- ✅ Stripe sent the webhook
- ✅ Your local server received it
- ✅ Returned 200 (success)
- ✅ Subscription should be activated in database

---

## Common Issues

### Issue: "stripe: command not found"

**Solution:**
- Windows: Add Stripe CLI folder to PATH
- Mac/Linux: Make sure `/usr/local/bin` is in PATH
- Or run with full path: `C:\stripe\stripe.exe login`

### Issue: "Failed to connect to localhost:3001"

**Solution:**
- Make sure your dev server is running (`npm run dev`)
- Check the port is correct (should be 3001)
- Update the forward URL if using a different port

### Issue: "Webhook signature verification failed"

**Solution:**
- Make sure you copied the webhook secret correctly
- Check `.env` has the right secret (starts with `whsec_`)
- Restart your dev server after updating `.env`

### Issue: "stripe listen" keeps disconnecting

**Solution:**
- This is normal if idle for a while
- Just restart: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- Get the new webhook secret and update `.env`

---

## Workflow

### Daily Development:

1. **Terminal 1:** Start Stripe CLI
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

2. **Terminal 2:** Start dev server
```bash
npm run dev
```

3. **Browser:** Test your app
```
http://localhost:3001
```

### When You're Done:

- Stop both terminals (Ctrl+C)
- Webhook secret stays the same until you restart `stripe listen`

---

## Production Deployment

When you deploy to production:

1. **Stop using Stripe CLI** (only for local development)

2. **Set up real webhook in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, etc.
   - Copy the webhook secret

3. **Update production environment variable:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_production_secret_here
   ```

4. **Redeploy your app**

---

## Useful Commands

### View Recent Events
```bash
stripe events list
```

### Trigger Specific Events
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### View Webhook Logs
```bash
stripe logs tail
```

### Test Webhook Endpoint
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook --print-json
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `stripe login` | Authenticate CLI |
| `stripe listen --forward-to localhost:3001/api/stripe/webhook` | Start webhook forwarding |
| `stripe trigger checkout.session.completed` | Test webhook |
| `stripe events list` | View recent events |
| `stripe logs tail` | View live logs |

---

## Next Steps

1. ✅ Install Stripe CLI
2. ✅ Run `stripe login`
3. ✅ Run `stripe listen --forward-to localhost:3001/api/stripe/webhook`
4. ✅ Copy webhook secret to `.env`
5. ✅ Restart dev server
6. ✅ Test registration flow
7. ✅ Complete a payment
8. ✅ Verify subscription activates automatically

---

## Support

**Stripe CLI Documentation:**
https://stripe.com/docs/stripe-cli

**Stripe CLI GitHub:**
https://github.com/stripe/stripe-cli

**Stripe Webhooks Guide:**
https://stripe.com/docs/webhooks

---

**Ready to test your payment flow locally!** 🚀
