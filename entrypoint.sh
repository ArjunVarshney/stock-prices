#!/bin/bash

echo "Starting stock scraper..."
echo "Timezone: $TZ"
echo "Schedule: Mon-Fri at 3:30 PM"

# Configure git remote with PAT for push access
if [ -n "$GH_PAT" ] && [ -n "$GH_REPO" ]; then
   cd /app
   git remote set-url origin "https://${GH_PAT}@github.com/${GH_REPO}.git"
   echo "Git remote configured for ${GH_REPO}"
else
   echo "WARNING: GH_PAT or GH_REPO not set — git push will not work"
fi

# Make environment variables available to cron jobs
printenv | grep -v "no_proxy" >> /etc/environment

if [ "$RUN_NOW" = "true" ]; then
   echo "RUN_NOW=true — running scraper immediately..."
   cd /app && node index.js
fi

# Start cron in foreground
cron -f
