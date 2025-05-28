#!/bin/bash

# Analytics API Test Script
# Comprehensive curl commands to test all API endpoints

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/v1"

echo "🚀 Testing Analytics API Endpoints"
echo "=================================="
echo "Base URL: $BASE_URL"
echo "API Base: $API_BASE"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_test() {
    echo -e "${BLUE}📋 Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ Success${NC}"
}

print_error() {
    echo -e "${RED}❌ Error${NC}"
}

print_separator() {
    echo -e "${YELLOW}----------------------------------------${NC}"
}

# 1. Health Check
print_test "Health Check"
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 2. Track Event - Page View
print_test "Track Page View Event"
SESSION_ID="test-session-$(date +%s)"
curl -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"user_id\": \"test-user-123\",
    \"event_type\": \"page_view\",
    \"event_name\": \"Homepage View\",
    \"properties\": {
      \"page_section\": \"header\",
      \"test\": true
    },
    \"page_url\": \"https://example.com/\",
    \"page_title\": \"Homepage\",
    \"referrer\": \"https://google.com\",
    \"user_agent\": \"Mozilla/5.0 (Test Browser)\",
    \"country\": \"US\",
    \"city\": \"New York\",
    \"screen_width\": 1920,
    \"screen_height\": 1080,
    \"language\": \"en-US\",
    \"platform\": \"Linux\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 3. Track Event - Button Click
print_test "Track Button Click Event"
SESSION_ID2="test-session-$(date +%s)-2"
curl -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID2\",
    \"user_id\": \"test-user-456\",
    \"event_type\": \"click\",
    \"event_name\": \"CTA Button Click\",
    \"properties\": {
      \"button_text\": \"Sign Up Now\",
      \"button_color\": \"blue\",
      \"location\": \"hero_section\"
    },
    \"page_url\": \"https://example.com/signup\",
    \"page_title\": \"Sign Up Page\",
    \"country\": \"CA\",
    \"city\": \"Toronto\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 4. Track Event - Form Submit
print_test "Track Form Submit Event"
SESSION_ID3="test-session-$(date +%s)-3"
curl -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID3\",
    \"event_type\": \"form_submit\",
    \"event_name\": \"Contact Form Submission\",
    \"properties\": {
      \"form_type\": \"contact\",
      \"fields_count\": 4,
      \"success\": true
    },
    \"page_url\": \"https://example.com/contact\",
    \"page_title\": \"Contact Us\",
    \"country\": \"UK\",
    \"city\": \"London\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 5. Track Event - Download
print_test "Track Download Event"
SESSION_ID4="test-session-$(date +%s)-4"
curl -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID4\",
    \"event_type\": \"download\",
    \"event_name\": \"PDF Download\",
    \"properties\": {
      \"file_name\": \"product-brochure.pdf\",
      \"file_size\": \"2.5MB\",
      \"file_type\": \"pdf\"
    },
    \"page_url\": \"https://example.com/downloads\",
    \"page_title\": \"Downloads\",
    \"country\": \"DE\",
    \"city\": \"Berlin\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 6. Track Event - Search
print_test "Track Search Event"
SESSION_ID5="test-session-$(date +%s)-5"
curl -X POST "$API_BASE/track" \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID5\",
    \"event_type\": \"search\",
    \"event_name\": \"Product Search\",
    \"properties\": {
      \"query\": \"analytics dashboard\",
      \"results_count\": 15,
      \"category\": \"software\"
    },
    \"page_url\": \"https://example.com/search\",
    \"country\": \"FR\",
    \"city\": \"Paris\"
  }" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 7. Get Events List
print_test "Get Events List (Latest 10)"
curl -X GET "$API_BASE/events?limit=10" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 8. Get Events by Session
print_test "Get Events by Session ID"
SESSION_ID="test-session-$(date +%s)"
curl -X GET "$API_BASE/events?session_id=$SESSION_ID&limit=5" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 9. Dashboard Stats
print_test "Dashboard Statistics"
curl -X GET "$API_BASE/dashboard" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 10. Events by Day
print_test "Events by Day (Last 7 days)"
curl -X GET "$API_BASE/analytics/events-by-day?days=7" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 11. Events by Day (Last 30 days)
print_test "Events by Day (Last 30 days)"
curl -X GET "$API_BASE/analytics/events-by-day?days=30" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 12. Top Pages
print_test "Top Pages (Top 10)"
curl -X GET "$API_BASE/analytics/top-pages?limit=10" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 13. Top Countries
print_test "Top Countries (Top 10)"
curl -X GET "$API_BASE/analytics/top-countries?limit=10" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

# 14. Top Event Types
print_test "Top Event Types (Top 5)"
curl -X GET "$API_BASE/analytics/top-event-types?limit=5" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n" \
  --silent --show-error
print_separator

echo ""
echo -e "${GREEN}🎉 API Testing Complete!${NC}"
echo ""
echo "📊 Dashboard URL: $BASE_URL"
echo "📊 Demo Page URL: $BASE_URL/demo"
echo ""
echo "💡 Tips:"
echo "  - Make sure the server is running: go run cmd/server/main.go"
echo "  - Check database connection in .env file"
echo "  - Use jq for pretty JSON output: curl ... | jq"
echo ""
