#!/bin/bash

restart_database() {
  DB_USER="saifr"
  DB_NAME="blogdb"
  SCRIPT_DIR=$(dirname "$0")
  DB_SCHEMA_FILE="$SCRIPT_DIR/../schema.sql"
  psql -U "$DB_USER" -d "$DB_NAME" -f "$DB_SCHEMA_FILE"
  echo "✅ Database reset successfully."
  echo ""
}
