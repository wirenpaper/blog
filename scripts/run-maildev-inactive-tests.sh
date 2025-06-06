#!/bin/bash

# A script to ensure Maildev is INACTIVE before launching Jest tests.
# It's for testing fallback logic when the mail service is down.

# Check if port 1025 is open.
if nc -z -w 2 localhost 1025 >/dev/null 2>&1; then
  # If the check SUCCEEDS, it means Maildev IS running, which is an error for this test.
  echo "❌ ERROR: Maildev is running but should not be. Please stop it first."
  exit 1
else
  # If the check FAILS, it means Maildev IS NOT running, which is the desired state.
  # "$@" passes all command-line arguments to the jest command.
  echo "✅ Maildev is confirmed inactive. Starting tests..."
  NODE_ENV=test jest "$@"
fi
