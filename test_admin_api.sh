#!/bin/bash

# Test script for Admin Project Management API
echo "Testing Admin Project Management API"

BASE_URL="http://localhost:8080/api/v1"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Admin Project Management API Tests ===${NC}"

# Function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# 1. Create a new project
echo -e "\n${YELLOW}1. Creating a new project...${NC}"
response=$(curl -s -X POST "$BASE_URL/admin/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Website",
    "domain": "example.com",
    "description": "Main company website",
    "owner_name": "John Doe",
    "owner_email": "john@example.com"
  }')

echo "Response: $response"
project_id=$(echo $response | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
api_key=$(echo $response | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$project_id" ]; then
    print_result 0 "Project created successfully"
    echo "Project ID: $project_id"
    echo "API Key: $api_key"
else
    print_result 1 "Failed to create project"
    exit 1
fi

# 2. Get all projects
echo -e "\n${YELLOW}2. Getting all projects...${NC}"
response=$(curl -s "$BASE_URL/admin/projects")
echo "Response: $response"
print_result $? "Get projects"

# 3. Get specific project
echo -e "\n${YELLOW}3. Getting specific project...${NC}"
response=$(curl -s "$BASE_URL/admin/projects/$project_id")
echo "Response: $response"
print_result $? "Get specific project"

# 4. Update project
echo -e "\n${YELLOW}4. Updating project...${NC}"
response=$(curl -s -X PUT "$BASE_URL/admin/projects/$project_id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Updated Website",
    "description": "Updated description"
  }')
echo "Response: $response"
print_result $? "Update project"

# 5. Get tracking script
echo -e "\n${YELLOW}5. Getting tracking script...${NC}"
response=$(curl -s "$BASE_URL/admin/projects/$project_id/script")
echo "Script length: ${#response} characters"
if [[ $response == *"// Analytics Tracking Script"* ]]; then
    print_result 0 "Get tracking script"
    echo "Script preview (first 200 chars):"
    echo "${response:0:200}..."
else
    print_result 1 "Get tracking script"
fi

# 6. Test tracking script download
echo -e "\n${YELLOW}6. Testing tracking script download...${NC}"
curl -s "$BASE_URL/admin/projects/$project_id/script/download" -o "test_tracking_script.js"
if [ -f "test_tracking_script.js" ] && [ -s "test_tracking_script.js" ]; then
    print_result 0 "Download tracking script"
    echo "Script downloaded to test_tracking_script.js"
    ls -la test_tracking_script.js
else
    print_result 1 "Download tracking script"
fi

# 7. Regenerate API key
echo -e "\n${YELLOW}7. Regenerating API key...${NC}"
response=$(curl -s -X POST "$BASE_URL/admin/projects/$project_id/regenerate-key")
echo "Response: $response"
new_api_key=$(echo $response | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
if [ ! -z "$new_api_key" ] && [ "$new_api_key" != "$api_key" ]; then
    print_result 0 "Regenerate API key"
    echo "New API Key: $new_api_key"
    api_key=$new_api_key
else
    print_result 1 "Regenerate API key"
fi

# 8. Test event tracking with API key
echo -e "\n${YELLOW}8. Testing event tracking with API key...${NC}"
response=$(curl -s -X POST "$BASE_URL/track" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $api_key" \
  -d '{
    "session_id": "test-session-123",
    "event_type": "page_view",
    "event_name": "Home Page Visit",
    "page_url": "https://example.com",
    "page_title": "Home",
    "ip_address": "192.168.1.1"
  }')
echo "Response: $response"
if [[ $response == *"\"success\":true"* ]]; then
    print_result 0 "Track event with API key"
else
    print_result 1 "Track event with API key"
fi

# 9. Test event tracking without API key (should fail)
echo -e "\n${YELLOW}9. Testing event tracking without API key (should fail)...${NC}"
response=$(curl -s -X POST "$BASE_URL/track" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-session-456",
    "event_type": "page_view",
    "event_name": "Test Page",
    "ip_address": "192.168.1.1"
  }')
echo "Response: $response"
if [[ $response == *"API key is required"* ]]; then
    print_result 0 "Reject tracking without API key"
else
    print_result 1 "Reject tracking without API key"
fi

# 10. Test with invalid API key (should fail)
echo -e "\n${YELLOW}10. Testing event tracking with invalid API key (should fail)...${NC}"
response=$(curl -s -X POST "$BASE_URL/track" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid-key" \
  -d '{
    "session_id": "test-session-789",
    "event_type": "page_view",
    "event_name": "Test Page",
    "ip_address": "192.168.1.1"
  }')
echo "Response: $response"
if [[ $response == *"Invalid API key"* ]]; then
    print_result 0 "Reject tracking with invalid API key"
else
    print_result 1 "Reject tracking with invalid API key"
fi

# 11. Delete project (soft delete)
echo -e "\n${YELLOW}11. Deleting project...${NC}"
response=$(curl -s -X DELETE "$BASE_URL/admin/projects/$project_id")
echo "Response: $response"
print_result $? "Delete project"

# Cleanup
if [ -f "test_tracking_script.js" ]; then
    rm test_tracking_script.js
    echo "Cleaned up downloaded script file"
fi

echo -e "\n${GREEN}=== Test completed ===${NC}"
echo "Note: Make sure the server is running with 'go run cmd/server/main.go' before running this test"
