#!/bin/bash
# IndexNow submission script for bornchart.app
# Automatically notifies Bing of new/updated URLs

INDEXNOW_KEY="brpwi6gOdYFSGI5Po4COamQWmiwFh57e"
INDEXNOW_ENDPOINT="https://www.bing.com/indexnow"

# URLs to submit (add new blog posts, pages here)
URLS=(
  "https://bornchart.app/"
  "https://bornchart.app/bazi"
  "https://bornchart.app/blog"
  "https://bornchart.app/pricing"
)

# Submit
URL_LIST=$(printf '"%s",' "${URLS[@]}")
URL_LIST="[${URL_LIST%,}]"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$INDEXNOW_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"host\":\"bornchart.app\",\"key\":\"$INDEXNOW_KEY\",\"keyLocation\":\"https://bornchart.app/${INDEXNOW_KEY}.txt\",\"urlList\":$URL_LIST" 2>&1)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] IndexNow submitted for bornchart.app (${#URLS[@]} URLs) → HTTP $RESPONSE"
