# AWS S3 Setup Guide for Ghost Apex Operations Portal

This guide walks you through setting up AWS S3 for document storage in the Ghost Apex Operations Portal backend.

## Prerequisites

- An AWS account (create one at https://aws.amazon.com if you don't have one)
- Access to AWS Management Console

## Step 1: Create an AWS Account (if needed)

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process (requires credit card, but S3 has a free tier)
4. Complete identity verification

## Step 2: Create an S3 Bucket

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com
   - Sign in with your AWS account credentials

2. **Navigate to S3**
   - In the AWS Console search bar, type "S3"
   - Click on "S3" under Services

3. **Create Bucket**
   - Click the orange "Create bucket" button
   - **Bucket name**: Choose a globally unique name (e.g., `ghostapex-documents-prod`)
     - Must be lowercase, no spaces
     - Must be unique across ALL AWS accounts
     - Suggestion: `ghostapex-docs-[your-company-name]`
   - **AWS Region**: Choose a region close to your users (e.g., `us-east-1` for US East)
   - **Object Ownership**: Select "ACLs disabled (recommended)"

4. **Block Public Access Settings**
   - ✅ Keep "Block all public access" CHECKED
   - This ensures documents are private and only accessible via pre-signed URLs

5. **Bucket Versioning**
   - Select "Disable" (optional: enable if you want version history)

6. **Default Encryption**
   - Select "Enable" under Server-side encryption
   - Choose "Amazon S3 managed keys (SSE-S3)" (recommended)
   - This encrypts all documents at rest

7. **Advanced Settings**
   - Leave defaults

8. **Create Bucket**
   - Click "Create bucket" at the bottom

## Step 3: Configure CORS for Frontend Uploads

1. **Open Your Bucket**
   - Click on your newly created bucket name

2. **Go to Permissions Tab**
   - Click the "Permissions" tab

3. **Edit CORS Configuration**
   - Scroll down to "Cross-origin resource sharing (CORS)"
   - Click "Edit"
   - Paste the following CORS configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://ghostapexops.com",
            "https://www.ghostapexops.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

4. **Save Changes**
   - Click "Save changes"

## Step 4: Create IAM User for Programmatic Access

1. **Navigate to IAM**
   - In the AWS Console search bar, type "IAM"
   - Click on "IAM" under Services

2. **Create User**
   - Click "Users" in the left sidebar
   - Click "Create user" button
   - **User name**: `ghostapex-s3-user`
   - Click "Next"

3. **Set Permissions**
   - Select "Attach policies directly"
   - In the search box, type "S3"
   - Find and check "AmazonS3FullAccess" (for development)
     - **Note**: For production, use a custom policy (see Step 5)
   - Click "Next"

4. **Review and Create**
   - Review the settings
   - Click "Create user"

## Step 5: Create Access Keys

1. **Open the User**
   - Click on the newly created user (`ghostapex-s3-user`)

2. **Create Access Key**
   - Click the "Security credentials" tab
   - Scroll down to "Access keys"
   - Click "Create access key"

3. **Select Use Case**
   - Select "Application running outside AWS"
   - Check the confirmation checkbox
   - Click "Next"

4. **Set Description (Optional)**
   - Description tag: `Ghost Apex Backend S3 Access`
   - Click "Create access key"

5. **Save Credentials**
   - ⚠️ **IMPORTANT**: This is the ONLY time you'll see the Secret Access Key
   - Copy both:
     - **Access key ID**: (starts with `AKIA...`)
     - **Secret access key**: (long random string)
   - Click "Download .csv file" to save them securely
   - Click "Done"

## Step 6: Add Credentials to Your Project

1. **Open your `.env` file** in the project root

2. **Add the following environment variables**:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_S3_BUCKET=your-bucket-name-here
```

3. **Replace the values**:
   - `AWS_REGION`: The region you selected when creating the bucket (e.g., `us-east-1`)
   - `AWS_ACCESS_KEY_ID`: The Access Key ID from Step 5
   - `AWS_SECRET_ACCESS_KEY`: The Secret Access Key from Step 5
   - `AWS_S3_BUCKET`: Your bucket name from Step 2 (e.g., `ghostapex-documents-prod`)

4. **Save the file**

## Step 7: (RECOMMENDED) Create Custom IAM Policy for Production

For production, it's better to use a least-privilege policy instead of `AmazonS3FullAccess`.

1. **Navigate to IAM Policies**
   - Go to IAM → Policies
   - Click "Create policy"

2. **Use JSON Editor**
   - Click the "JSON" tab
   - Paste the following policy (replace `YOUR-BUCKET-NAME`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "ListBucket",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
        },
        {
            "Sid": "ObjectAccess",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:PutObjectAcl"
            ],
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

3. **Create Policy**
   - Click "Next"
   - **Policy name**: `GhostApexS3Policy`
   - **Description**: `Allows Ghost Apex backend to manage documents in S3`
   - Click "Create policy"

4. **Attach to User**
   - Go to IAM → Users → `ghostapex-s3-user`
   - Click "Add permissions" → "Attach policies directly"
   - Search for `GhostApexS3Policy`
   - Check the policy
   - Click "Add permissions"
   - Remove the `AmazonS3FullAccess` policy (click X next to it)

## Step 8: Verify Setup

Once you've completed the setup, I'll create a verification script to test the S3 connection.

## Security Best Practices

1. **Never commit credentials to Git**
   - Ensure `.env` is in your `.gitignore` file
   - Never share your Secret Access Key

2. **Rotate Access Keys Regularly**
   - Create new access keys every 90 days
   - Delete old keys after rotation

3. **Use Separate Buckets for Environments**
   - Development: `ghostapex-docs-dev`
   - Staging: `ghostapex-docs-staging`
   - Production: `ghostapex-docs-prod`

4. **Enable S3 Bucket Logging** (Optional)
   - Helps track access and detect unauthorized usage
   - Go to bucket → Properties → Server access logging

5. **Set Up Lifecycle Policies** (Optional)
   - Automatically delete old documents or move to cheaper storage
   - Go to bucket → Management → Lifecycle rules

## Pricing Information

**S3 Free Tier** (first 12 months):
- 5 GB of standard storage
- 20,000 GET requests
- 2,000 PUT requests

**After Free Tier**:
- Storage: ~$0.023 per GB/month (us-east-1)
- PUT/POST requests: $0.005 per 1,000 requests
- GET requests: $0.0004 per 1,000 requests

**Estimated Monthly Cost** (for small operation):
- 10 GB storage: ~$0.23/month
- 10,000 uploads: ~$0.05/month
- 50,000 downloads: ~$0.02/month
- **Total: ~$0.30/month**

## Troubleshooting

### "Access Denied" Errors
- Verify IAM user has correct permissions
- Check bucket policy doesn't block access
- Ensure credentials in `.env` are correct

### "Bucket Not Found" Errors
- Verify bucket name is correct in `.env`
- Ensure bucket exists in the correct region
- Check AWS_REGION matches bucket region

### CORS Errors
- Verify CORS configuration includes your domain
- Check AllowedOrigins includes your frontend URL
- Ensure AllowedMethods includes required methods

## Next Steps

After completing this setup:

1. ✅ Verify your `.env` file has all AWS credentials
2. ✅ Notify me that setup is complete
3. ✅ I'll create a verification script to test the connection
4. ✅ I'll continue with Task 5 implementation

## Support

If you encounter issues:
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- AWS Support: https://console.aws.amazon.com/support/
- Ghost Apex Support: Contact your development team
