#!/bin/bash

# A script to ensure Maildev is running before launching Jest tests.
# It accepts all arguments passed to it and forwards them to the jest command.

# Check if port 1025 is open, silencing all output from the check itself.
# The `-w 2` adds a 2-second timeout to prevent it from hanging.
if nc -z -w 2 localhost 1025 >/dev/null 2>&1; then
  # If the check succeeds, print a confirmation and run Jest.
  # "$@" is a special variable that passes all command-line arguments
  # from this script directly to the jest command.
  echo "✅ Maildev is running. Starting tests..."
  NODE_ENV=test jest "$@"
else
  # If the check fails, print a clear error message and exit with a
  # failure code to stop everything.
  echo "❌ ERROR: Maildev not found. Please run maildev first: \"npx maildev\""
  exit 1
fi
