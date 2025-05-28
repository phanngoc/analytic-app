# Analytics API - Curl Commands Reference

## Base Configuration
```bash
BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/v1"
```

## 1. Health Check
```bash
curl -X GET "http://localhost:8080/health" \
  -H "Content-Type: application/json"
```

## 2. Track Events

### Track Page View
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "user_id": "user-456",
    "event_type": "page_view",
    "event_name": "Homepage View",
    "properties": {
      "page_section": "header"
    },
    "page_url": "https://example.com/",
    "page_title": "Homepage",
    "referrer": "https://google.com",
    "user_agent": "Mozilla/5.0 (Test Browser)",
    "country": "US",
    "city": "New York",
    "screen_width": 1920,
    "screen_height": 1080,
    "language": "en-US",
    "platform": "Linux"
  }'
```

### Track Button Click
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "user_id": "user-456",
    "event_type": "click",
    "event_name": "CTA Button Click",
    "properties": {
      "button_text": "Sign Up Now",
      "button_color": "blue"
    },
    "page_url": "https://example.com/signup",
    "page_title": "Sign Up Page",
    "country": "US",
    "city": "New York"
  }'
```

### Track Form Submit
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "event_type": "form_submit",
    "event_name": "Contact Form Submission",
    "properties": {
      "form_type": "contact",
      "fields_count": 4,
      "success": true
    },
    "page_url": "https://example.com/contact",
    "page_title": "Contact Us",
    "country": "US",
    "city": "New York"
  }'
```

### Track Download
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "event_type": "download",
    "event_name": "PDF Download",
    "properties": {
      "file_name": "product-brochure.pdf",
      "file_size": "2.5MB",
      "file_type": "pdf"
    },
    "page_url": "https://example.com/downloads",
    "page_title": "Downloads",
    "country": "US",
    "city": "New York"
  }'
```

### Track Search
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "event_type": "search",
    "event_name": "Product Search",
    "properties": {
      "query": "analytics dashboard",
      "results_count": 15
    },
    "page_url": "https://example.com/search",
    "country": "US",
    "city": "New York"
  }'
```

### Track E-commerce Purchase
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "user_id": "user-456",
    "event_type": "purchase",
    "event_name": "Product Purchase",
    "properties": {
      "product_id": "prod-789",
      "product_name": "Analytics Pro",
      "price": 99.99,
      "currency": "USD",
      "quantity": 1
    },
    "page_url": "https://example.com/checkout/success",
    "page_title": "Purchase Complete",
    "country": "US",
    "city": "New York"
  }'
```

## 3. Get Events

### Get Latest Events
```bash
curl -X GET "http://localhost:8080/api/v1/events?limit=10" \
  -H "Content-Type: application/json"
```

### Get Events with Pagination
```bash
curl -X GET "http://localhost:8080/api/v1/events?limit=20&offset=40" \
  -H "Content-Type: application/json"
```

### Get Events by Session ID
```bash
curl -X GET "http://localhost:8080/api/v1/events?session_id=session-123&limit=10" \
  -H "Content-Type: application/json"
```

## 4. Analytics Endpoints

### Dashboard Statistics
```bash
curl -X GET "http://localhost:8080/api/v1/dashboard" \
  -H "Content-Type: application/json"
```

### Events by Day (Last 7 days)
```bash
curl -X GET "http://localhost:8080/api/v1/analytics/events-by-day?days=7" \
  -H "Content-Type: application/json"
```

### Events by Day (Last 30 days)
```bash
curl -X GET "http://localhost:8080/api/v1/analytics/events-by-day?days=30" \
  -H "Content-Type: application/json"
```

### Top Pages
```bash
curl -X GET "http://localhost:8080/api/v1/analytics/top-pages?limit=10" \
  -H "Content-Type: application/json"
```

### Top Countries
```bash
curl -X GET "http://localhost:8080/api/v1/analytics/top-countries?limit=10" \
  -H "Content-Type: application/json"
```

### Top Event Types
```bash
curl -X GET "http://localhost:8080/api/v1/analytics/top-event-types?limit=5" \
  -H "Content-Type: application/json"
```

## 5. Curl with Pretty JSON Output

Install `jq` for pretty JSON formatting:
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### Example with Pretty Output
```bash
curl -X GET "http://localhost:8080/api/v1/dashboard" \
  -H "Content-Type: application/json" \
  -s | jq '.'
```

## 6. Load Testing

### Create Multiple Events (Bash Loop)
```bash
for i in {1..10}; do
  curl -X POST "http://localhost:8080/api/v1/track" \
    -H "Content-Type: application/json" \
    -d "{
      \"session_id\": \"load-test-session-$i\",
      \"user_id\": \"load-test-user-$i\",
      \"event_type\": \"page_view\",
      \"event_name\": \"Load Test Page View $i\",
      \"page_url\": \"https://example.com/page-$i\",
      \"country\": \"US\",
      \"city\": \"Test City\"
    }" \
    -s -o /dev/null -w "Request $i: %{http_code}\n"
  sleep 0.1
done
```

## 7. Common Event Types for Testing

### Video Play Event
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "event_type": "video_play",
    "event_name": "Product Demo Video Play",
    "properties": {
      "video_title": "How to Use Analytics",
      "video_duration": 180,
      "video_position": 0
    },
    "page_url": "https://example.com/demo"
  }'
```

### Scroll Event
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-123",
    "event_type": "scroll",
    "event_name": "Page Scroll",
    "properties": {
      "scroll_percent": 75,
      "scroll_depth": 2400
    },
    "page_url": "https://example.com/blog/article"
  }'
```

## 8. Testing Different Countries and Cities

```bash
# Test with different locations
countries=("US" "UK" "CA" "DE" "FR" "JP" "AU" "BR")
cities=("New York" "London" "Toronto" "Berlin" "Paris" "Tokyo" "Sydney" "São Paulo")

for i in {0..7}; do
  curl -X POST "http://localhost:8080/api/v1/track" \
    -H "Content-Type: application/json" \
    -d "{
      \"session_id\": \"geo-test-$i\",
      \"event_type\": \"page_view\",
      \"event_name\": \"Geo Test Page View\",
      \"page_url\": \"https://example.com/\",
      \"country\": \"${countries[$i]}\",
      \"city\": \"${cities[$i]}\"
    }" \
    -s -o /dev/null -w "Country ${countries[$i]}: %{http_code}\n"
done
```

## 9. Error Testing

### Missing Required Fields
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "page_view"
  }'
```

### Invalid JSON
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

## 10. Performance Testing

### Measure Response Time
```bash
curl -X POST "http://localhost:8080/api/v1/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "perf-test",
    "event_type": "page_view",
    "event_name": "Performance Test",
    "page_url": "https://example.com/"
  }' \
  -w "Time: %{time_total}s\nStatus: %{http_code}\n" \
  -o /dev/null -s
```
