#!/bin/bash
# Script to remove sensitive data from git history

# Remove AWS keys
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch DEPLOYMENT_CHECKLIST.md IMPLEMENTATION_SUMMARY.md VERCEL_DEPLOYMENT_GUIDE.md || true' \
  --prune-empty --tag-name-filter cat -- --all
