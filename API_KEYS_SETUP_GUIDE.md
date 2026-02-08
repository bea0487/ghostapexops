# API Keys Setup Guide
## Ghost Rider: Apex Operations Portal

This guide will walk you through obtaining all the necessary API keys and credentials for the application.

---

## 1. Supabase Configuration

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new account or sign in with GitHub
4. Click "New Project"
5. Fill in the project details:
   - **Name:** ghost-rider-portal (or your preferred name)
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for development
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Get Supabase API Keys

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see three important values:

#### Copy These Values:

**VITE_SUPABASE_URL:**
```
https://your-project-id.supabase.co
```
Found under "Project URL"

**VITE_SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Found under "Project API keys" → "anon public"

**SUPABASE_SERVICE_ROLE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Found under "Project API keys" → "service_role" (⚠️ Keep this secret!)

### Step 3: Add to .env File

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2. Stripe Configuration

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign in" or "Start now"
3. Create an account with your email
4. Verify your email address
5. Complete the account setup

### Step 2: Get Stripe API Keys

#### For Development (Test Mode):

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test Mode** (toggle in top right)
3. Click on **Developers** in the top menu
4. Click on **API keys** in the left sidebar

#### Copy These Values:

**VITE_STRIPE_PUBLISHABLE_KEY:**
```
pk_test_51...
```
Found under "Publishable key" (starts with `pk_test_`)

**STRIPE_SECRET_KEY:**
```
sk_test_51...
```
Found under "Secret key" (starts with `sk_test_`) - Click "Reveal test key"
⚠️ **NEVER commit this to version control!**

### Step 3: Set Up Webhook Secret

1. Still in **Developers** section, click **Webhooks**
2. Click "Add endpoint"
3. Enter your webhook URL:
   - **Development:** `http://localhost:3001/api/stripe/webhook`
   - **Production:** `https://yourdomain.com/api/stripe/webhook`
4. Click "Select events"
5. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click "Add endpoint"
7. Click on the newly created endpoint
8. Click "Reveal" under "Signing secret"

**STRIPE_WEBHOOK_SECRET:**
```
whsec_...
```
Copy this value (starts with `whsec_`)

### Step 4: Add to .env File

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 5: Test Stripe Integration

Use these test card numbers in development:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Authentication:** 4000 0025 0000 3155

Use any future expiration date, any 3-digit CVC, and any ZIP code.

---

## 3. AWS S3 Configuration

### Step 1: Create an AWS Account

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card)
4. Complete identity verification

### Step 2: Create an S3 Bucket

1. Sign in to [AWS Console](https://console.aws.amazon.com)
2. Search for "S3" in the services search bar
3. Click "Create bucket"
4. Configure bucket:
   - **Bucket name:** `ghost-rider-documents` (must be globally unique)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Block Public Access:** Keep all boxes checked (we'll use pre-signed URLs)
   - **Bucket Versioning:** Enable (recommended)
   - **Encryption:** Enable with SSE-S3
5. Click "Create bucket"

### Step 3: Create IAM User for S3 Access

1. Go to **IAM** service in AWS Console
2. Click **Users** in the left sidebar
3. Click "Add users"
4. Configure user:
   - **User name:** `ghost-rider-s3-user`
   - **Access type:** Check "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select: `AmazonS3FullAccess` (or create custom policy)
8. Click "Next: Tags" (skip tags)
9. Click "Next: Review"
10. Click "Create user"

### Step 4: Get AWS Credentials

⚠️ **IMPORTANT:** This is your only chance to see the secret key!

**AWS_ACCESS_KEY_ID:**
```
AKIAIOSFODNN7EXAMPLE
```

**AWS_SECRET_ACCESS_KEY:**
```
wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

Click "Download .csv" to save these credentials securely.

### Step 5: Add to .env File

```bash
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=ghost-rider-documents
```

### Step 6: Configure S3 Bucket CORS (Optional)

If you need direct browser uploads:

1. Go to your S3 bucket
2. Click on **Permissions** tab
3. Scroll to **Cross-origin resource sharing (CORS)**
4. Click "Edit" and add:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3001", "https://yourdomain.com"],
        "ExposeHeaders": ["ETag"]
    }
]
```

---

## 4. Complete .env File

Create a `.env` file in your project root with all the keys:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=ghost-rider-documents

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

---

## 5. Verify Setup

### Test Supabase Connection:

```bash
# In your browser console after starting the app:
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
```

### Test Stripe Connection:

1. Go to `/portal/register`
2. Create a test account
3. Proceed to checkout
4. Use test card: 4242 4242 4242 4242
5. Check Stripe Dashboard for the payment

### Test S3 Connection:

1. Log in to the portal
2. Try uploading a document
3. Check your S3 bucket for the uploaded file

---

## 6. Production Setup

### When Moving to Production:

1. **Supabase:**
   - Use the same keys (Supabase handles dev/prod in one project)
   - Or create a separate production project

2. **Stripe:**
   - Switch to **Live Mode** in Stripe Dashboard
   - Get new keys (they'll start with `pk_live_` and `sk_live_`)
   - Create new webhook endpoint for production URL
   - ⚠️ **Test thoroughly before going live!**

3. **AWS S3:**
   - Create a separate production bucket
   - Use separate IAM user for production
   - Enable CloudFront CDN for better performance

4. **Environment Variables:**
   - Use your hosting platform's environment variable settings
   - **NEVER** commit production keys to version control
   - Use secrets management (AWS Secrets Manager, Vercel Env Vars, etc.)

---

## 7. Security Checklist

- [ ] All API keys added to `.env` file
- [ ] `.env` file added to `.gitignore`
- [ ] Service role keys kept secret (server-side only)
- [ ] Stripe webhook secret configured
- [ ] S3 bucket has proper permissions
- [ ] Test mode enabled for Stripe during development
- [ ] Production keys stored securely (not in code)

---

## 8. Troubleshooting

### Supabase Connection Issues:

**Error:** "Invalid API key"
- **Solution:** Double-check you copied the full key (they're very long)
- **Solution:** Make sure you're using the anon key for `VITE_SUPABASE_ANON_KEY`

**Error:** "Failed to fetch"
- **Solution:** Check your Supabase project is active
- **Solution:** Verify the URL is correct (no trailing slash)

### Stripe Issues:

**Error:** "No such customer"
- **Solution:** Make sure you're in Test Mode
- **Solution:** Use test card numbers (4242 4242 4242 4242)

**Error:** "Webhook signature verification failed"
- **Solution:** Make sure webhook secret matches the endpoint
- **Solution:** Check webhook URL is accessible

### AWS S3 Issues:

**Error:** "Access Denied"
- **Solution:** Check IAM user has S3 permissions
- **Solution:** Verify bucket name is correct

**Error:** "Bucket not found"
- **Solution:** Check bucket name matches exactly
- **Solution:** Verify region is correct

---

## 9. Getting Help

### Official Documentation:

- **Supabase:** [https://supabase.com/docs](https://supabase.com/docs)
- **Stripe:** [https://stripe.com/docs](https://stripe.com/docs)
- **AWS S3:** [https://docs.aws.amazon.com/s3](https://docs.aws.amazon.com/s3)

### Support Contacts:

- **Supabase Support:** [https://supabase.com/support](https://supabase.com/support)
- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- **AWS Support:** [https://aws.amazon.com/support](https://aws.amazon.com/support)

---

## 10. Quick Start Commands

After setting up all API keys:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3001
```

---

**Setup Complete!** 🎉

You now have all the API keys needed to run the Ghost Rider: Apex Operations Portal.

**Next Steps:**
1. Run the database migrations (see `supabase/migrations/`)
2. Create an admin user (see `ADMIN_SETUP.md`)
3. Test the registration and payment flow
4. Start building!
