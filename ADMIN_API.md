# Admin Project Management API

This document describes the admin functionality for managing tracking projects in the analytics application.

## Overview

The admin functionality allows administrators to:
- Create and manage projects (similar to Google Analytics properties)
- Generate unique API keys for each project
- Generate tracking scripts for websites
- Monitor project analytics and usage

## Project Model

Each project contains:
- **ID**: Unique UUID identifier
- **Name**: Human-readable project name
- **Domain**: Associated domain name
- **API Key**: Unique key for tracking (format: `ak_xxxxxxxxxxxxxxxx`)
- **Description**: Optional project description
- **Owner Information**: Name and email of project owner
- **Analytics Counters**: Total events, sessions, users
- **Status**: Active/inactive flag
- **Timestamps**: Created and updated timestamps

## API Endpoints

### 1. Create Project
```bash
POST /api/v1/admin/projects
Content-Type: application/json

{
  "name": "My Website",
  "domain": "example.com",
  "description": "Main company website",
  "owner_name": "John Doe",
  "owner_email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Website",
    "domain": "example.com",
    "api_key": "ak_1234567890abcdef",
    "description": "Main company website",
    "owner_name": "John Doe",
    "owner_email": "john@example.com",
    "is_active": true,
    "event_count": 0,
    "created_at": "2025-05-27T10:00:00Z",
    "updated_at": "2025-05-27T10:00:00Z"
  }
}
```

### 2. Get All Projects
```bash
GET /api/v1/admin/projects?limit=50&offset=0
```

**Response:**
```json
{
  "projects": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "My Website",
      "domain": "example.com",
      "api_key": "ak_1234567890abcdef",
      "total_events": 1250,
      "total_sessions": 450,
      "total_users": 320,
      "last_event_time": "2025-05-27T09:30:00Z",
      "is_active": true,
      "created_at": "2025-05-27T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 3. Get Specific Project
```bash
GET /api/v1/admin/projects/{project_id}
```

### 4. Update Project
```bash
PUT /api/v1/admin/projects/{project_id}
Content-Type: application/json

{
  "name": "Updated Website Name",
  "description": "Updated description"
}
```

### 5. Delete Project (Soft Delete)
```bash
DELETE /api/v1/admin/projects/{project_id}
```

### 6. Regenerate API Key
```bash
POST /api/v1/admin/projects/{project_id}/regenerate-key
```

### 7. Get Tracking Script
```bash
GET /api/v1/admin/projects/{project_id}/script
```

**Response:** JavaScript tracking code as `text/plain`

### 8. Download Tracking Script
```bash
GET /api/v1/admin/projects/{project_id}/script/download
```

**Response:** JavaScript file download with `Content-Disposition: attachment`

## Generated Tracking Script

The system generates a JavaScript tracking script for each project that includes:

```javascript
// Analytics Tracking Script for: {Project Name}
// Domain: {domain}
// Generated: {timestamp}

(function() {
    // Configuration
    const config = {
        apiKey: '{api_key}',
        endpoint: '{server_url}/api/v1/track',
        projectId: '{project_id}',
        domain: '{domain}',
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        debug: false
    };

    // Session management
    let sessionId = getOrCreateSession();
    let userId = getOrCreateUserId();

    // Event tracking functions
    function track(eventType, eventName, properties = {}) {
        // Implementation for sending events
    }

    function trackPageView() {
        // Auto page view tracking
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
        trackPageView();
    }

    // Global API
    window.analytics = {
        track: track,
        identify: identify,
        page: trackPageView
    };
})();
```

## Event Tracking with API Keys

Once a project is created, events must be tracked using the project's API key:

### Using Header Authentication
```bash
POST /api/v1/track
X-API-Key: ak_1234567890abcdef
Content-Type: application/json

{
  "session_id": "session-123",
  "event_type": "page_view",
  "event_name": "Home Page",
  "page_url": "https://example.com",
  "page_title": "Home",
  "ip_address": "192.168.1.1"
}
```

### Using Query Parameter
```bash
POST /api/v1/track?api_key=ak_1234567890abcdef
```

## Security Features

1. **API Key Validation**: All tracking requests must include a valid API key
2. **Project Isolation**: Events are isolated by project using project_id
3. **Soft Delete**: Projects are deactivated rather than permanently deleted
4. **Owner Tracking**: Each project has associated owner information

## Integration Example

### 1. Create Project
```bash
curl -X POST http://localhost:8080/api/v1/admin/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Blog",
    "domain": "myblog.com",
    "owner_name": "Jane Smith",
    "owner_email": "jane@myblog.com"
  }'
```

### 2. Get Tracking Script
```bash
curl http://localhost:8080/api/v1/admin/projects/{project_id}/script \
  -o analytics.js
```

### 3. Include in Website
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Blog</title>
    <script src="analytics.js"></script>
</head>
<body>
    <!-- Your content -->
    <script>
        // Track custom events
        analytics.track('button_click', 'Subscribe Button', {
            location: 'header',
            campaign: 'newsletter'
        });
    </script>
</body>
</html>
```

## Testing

Use the provided test script to verify functionality:

```bash
./test_admin_api.sh
```

This script tests:
- Project creation and management
- API key generation and regeneration
- Tracking script generation
- Event tracking with API key validation
- Security (invalid/missing API keys)

## Database Migration

Run the migration to add the projects table:

```sql
-- Apply migration
-- File: migrations/002_create_projects.sql
```

## Error Handling

Common errors and responses:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid API key
- **404 Not Found**: Project not found
- **500 Internal Server Error**: Server-side error

Example error response:
```json
{
  "error": "API key is required"
}
```
