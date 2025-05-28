#!/bin/bash

# Quick API Test - Basic functionality check
# Run this to quickly verify API is working

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/v1"

echo "🚀 Quick Analytics API Test"
echo "============================"

# 1. Health Check
echo "1. Health Check..."
curl -s "$BASE_URL/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/health"
echo ""

# 2. Track a simple event
echo "2. Tracking a test event..."
SESSION_ID="quick-test-$(date +%s)"
RESPONSE=$(curl -s -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"event_type\": \"page_view\",
    \"event_name\": \"Quick Test Page View\",
    \"page_url\": \"https://example.com/test\",
    \"country\": \"US\",
    \"city\": \"Test City\"
  }")

echo $RESPONSE | jq '.' 2>/dev/null || echo $RESPONSE
echo ""

# 3. Get dashboard stats
echo "3. Dashboard Statistics..."
curl -s "$API_BASE/dashboard" | jq '.' 2>/dev/null || curl -s "$API_BASE/dashboard"
echo ""

# 4. Get recent events
echo "4. Recent Events (5 latest)..."
curl -s "$API_BASE/events?limit=5" | jq '.events[0:2]' 2>/dev/null || curl -s "$API_BASE/events?limit=5"
echo ""

echo "✅ Quick test complete!"
echo ""
echo "💡 For full testing, run: ./test_api.sh"
echo "📊 Dashboard: $BASE_URL"
