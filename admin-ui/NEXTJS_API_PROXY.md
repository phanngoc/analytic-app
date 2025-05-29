# Next.js API Proxy Architecture

This document describes the API architecture for the analytics application, which uses Next.js API routes as a proxy layer between the client and the Go backend.

## Architecture Overview

```
Client (React) → Next.js API Routes → Go Backend API
```

### Benefits of this approach:

1. **Security**: API keys and sensitive configuration stay on the server
2. **CORS Management**: No need to configure CORS on the Go backend for browser requests
3. **Caching**: Can implement caching at the Next.js layer
4. **Request/Response Transformation**: Can modify data before sending to client
5. **Rate Limiting**: Can implement rate limiting at the proxy layer
6. **Monitoring**: Centralized logging and monitoring

## API Routes Structure

```
/api/v1/
├── admin/
│   └── projects/
│       ├── route.ts                    # GET /admin/projects, POST /admin/projects
│       └── [id]/
│           ├── route.ts                # GET, PUT, DELETE /admin/projects/{id}
│           ├── regenerate-key/
│           │   └── route.ts            # POST /admin/projects/{id}/regenerate-key
│           ├── script/
│           │   ├── route.ts            # GET /admin/projects/{id}/script
│           │   └── download/
│           │       └── route.ts        # GET /admin/projects/{id}/script/download
│           └── realtime/
│               ├── stats/
│               │   └── route.ts        # GET /admin/projects/{id}/realtime/stats
│               ├── events/
│               │   └── route.ts        # GET /admin/projects/{id}/realtime/events
│               ├── event-types/
│               │   └── route.ts        # GET /admin/projects/{id}/realtime/event-types
│               ├── countries/
│               │   └── route.ts        # GET /admin/projects/{id}/realtime/countries
│               ├── pages/
│               │   └── route.ts        # GET /admin/projects/{id}/realtime/pages
│               └── ws/
│                   └── route.ts        # WebSocket connection info
├── analytics/
│   ├── events-by-day/
│   │   └── route.ts                    # GET /analytics/events-by-day
│   ├── top-pages/
│   │   └── route.ts                    # GET /analytics/top-pages
│   ├── top-countries/
│   │   └── route.ts                    # GET /analytics/top-countries
│   └── top-event-types/
│       └── route.ts                    # GET /analytics/top-event-types
├── dashboard/
│   └── route.ts                        # GET /dashboard
└── track/
    └── route.ts                        # POST /track
```

## Configuration

### Environment Variables

```bash
# .env.local
GO_API_BASE_URL=http://localhost:8080/api/v1          # Server-side Go API URL
NEXT_PUBLIC_GO_API_BASE_URL=http://localhost:8080/api/v1  # Client-side Go API URL (for WebSocket)
NEXT_PUBLIC_APP_URL=http://localhost:3000             # Next.js app URL
```

### API Client Configuration

The `src/lib/api.ts` file has been updated to use Next.js API routes:

```typescript
// Before (direct Go API calls)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// After (Next.js API proxy)
const API_BASE_URL = '/api/v1';
```

## API Proxy Utility

The `src/lib/api-proxy.ts` provides a reusable utility for creating proxy routes:

```typescript
import { proxyToGoAPI, getQueryParams, buildQueryString } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
  const queryParams = getQueryParams(request);
  const queryString = buildQueryString(queryParams);
  
  return proxyToGoAPI({
    endpoint: `/admin/projects${queryString}`,
    request,
  });
}
```

## Features

### Error Handling
- Consistent error response format
- Proper HTTP status code forwarding
- Fallback error messages

### Content Type Support
- JSON responses
- Text responses (for scripts)
- Binary responses (for file downloads)

### Header Forwarding
- Authorization headers
- User-Agent headers
- Custom headers as needed

### WebSocket Support
- Returns WebSocket connection info
- Direct connection to Go backend for real-time features

## Testing

Use the provided test script to verify the API proxy:

```bash
./test_nextjs_api.sh
```

## Usage Examples

### Client-side API calls
```typescript
// All API calls now go through Next.js proxy
const projects = await apiService.getProjects();
const stats = await apiService.getDashboardStats();
```

### WebSocket connections
```typescript
// WebSocket connections still go directly to Go backend
const ws = apiService.createWebSocket(projectId);
```

## Development Workflow

1. Start Go backend: `go run cmd/server/main.go`
2. Start Next.js app: `npm run dev`
3. All client requests automatically proxied through Next.js
4. Test with: `./test_nextjs_api.sh`

## Production Considerations

1. **Environment Variables**: Update `GO_API_BASE_URL` to point to production Go API
2. **Error Logging**: Implement proper error logging and monitoring
3. **Rate Limiting**: Add rate limiting middleware
4. **Caching**: Implement response caching for static data
5. **Security**: Add API key validation and request sanitization
