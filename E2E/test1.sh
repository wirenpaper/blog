#!/bin/bash

set -e # Exit immediately if a command exits with a non-zero status.

SCRIPT_DIR=$(dirname "$0")
source "$SCRIPT_DIR/verify-port-is-listening.sh"
source "$SCRIPT_DIR/restart-database.sh"

verify_port_is_listening
restart_database

# --- Variables ---
BASE_URL="http://localhost:5000"

# User 1 Details
USERNAME="saif.rashiduddin@gmail.com"
PASSWORD='K!m1@2025#P@ssw0rd$' # Use single quotes for strong passwords
FIRST_NAME="Mustapha"
LAST_NAME="Rashiduddin"

# User 2 Details (ready for future use)
USERNAME2="bob.harry@gmail.com"
PASSWORD2='G#4hJ!8kL@5mP$'
FIRST_NAME2="bob"
LAST_NAME2="harry"

echo "### 1. Registering a new user... ###"

# Use httpie to send the POST request.
# The key=value syntax automatically creates a JSON object and sets the
# 'Content-Type: application/json' header.
# We pipe (|) the JSON output directly to jq to parse it.
TOKEN=$(http --body POST "$BASE_URL/auth/register" \
  userName="$USERNAME" \
  password="$PASSWORD" \
  firstName="$FIRST_NAME" \
  lastName="$LAST_NAME" |
  jq -r '"Bearer \(.token)"')

# --- Check if we got a token ---
if [ -z "$TOKEN" ]; then
  echo "Error: Failed to get token. The response did not contain a 'token' field."
  exit 1
fi

echo ""
echo "✅ Success! Token extracted."
echo "TOKEN=${TOKEN}"
echo ""

# --- Example of using the token in a subsequent request ---
# echo "### 2. Using the token to access a protected route... ###"

# Let's assume there is a /auth/me route that requires a bearer token
# http GET "$BASE_URL/auth/me" "Authorization: Bearer $TOKEN"
