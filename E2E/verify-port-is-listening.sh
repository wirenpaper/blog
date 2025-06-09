#!/bin/bash

verify_port_is_listening() {
  local port=${1:-5000}
  local max_retries=${4:-5} # Give it up to 15 seconds
  local delay_seconds=1

  echo "### Checking if any process is listening on port $port... ###"

  for i in $(seq 1 $max_retries); do
    # Use 'lsof'. It succeeds (exit code 0) if it finds a listener on the port.
    # We redirect all output to /dev/null because we only care if it succeeds or fails.
    if lsof -i :$port >/dev/null 2>&1; then
      echo "✅ Confirmed: A process is now listening on port $port. Proceeding."
      return 0 # Success!
    fi

    echo "Attempt $i/$max_retries: No listener found. Waiting ${delay_seconds}s..."
    sleep $delay_seconds
  done

  # If the loop finishes, it timed out.
  echo "❌ FATAL: Timed out waiting for a process to listen on port $port."
  echo "Please check the 'npm run dev' logs for errors."
  exit 1
}
