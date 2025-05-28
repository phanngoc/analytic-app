# Analytics Application

This is a Go-based analytics application similar to Google Analytics for collecting and analyzing user events.

## Features

- **Event Tracking**: Collect user events with detailed metadata
- **Real-time Dashboard**: View analytics data in a beautiful web interface
- **Session Management**: Track user sessions automatically
- **Geographic Analytics**: Country and city-level insights
- **Page Analytics**: Track page views and popular content
- **RESTful API**: Clean API endpoints for data collection and retrieval

## Architecture

- **Backend**: Go with Gin web framework
- **Database**: PostgreSQL with GORM ORM
- **Frontend**: Bootstrap 5 with Chart.js
- **Containerization**: Docker and Docker Compose

## Project Structure

```
├── cmd/server/          # Application entry point
├── internal/
│   ├── handlers/        # HTTP handlers
│   ├── models/          # Data models
│   ├── services/        # Business logic
│   └── database/        # Database operations
├── pkg/
│   ├── config/          # Configuration management
│   └── utils/           # Utility functions
├── web/                 # Frontend assets
│   ├── templates/       # HTML templates
│   └── static/         # CSS, JS files
├── migrations/          # Database migrations
└── docker-compose.yml   # Docker setup
```

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the application:
   ```bash
   docker-compose up -d
   ```
4. Access the dashboard at `http://localhost:8080`

### Manual Setup

1. Install PostgreSQL and create a database
2. Update `.env` file with your database credentials
3. Install dependencies:
   ```bash
   go mod tidy
   ```
4. Run the application:
   ```bash
   go run cmd/server/main.go
   ```

## API Endpoints

### Event Tracking

**POST /api/v1/track**
```json
{
  "session_id": "unique-session-id",
  "user_id": "optional-user-id",
  "event_type": "page_view",
  "event_name": "Homepage View",
  "properties": {
    "custom": "data"
  },
  "page_url": "https://example.com",
  "page_title": "Homepage",
  "ip_address": "192.168.1.1",
  "country": "US",
  "city": "New York"
}
```

### Analytics

- **GET /api/v1/dashboard** - Dashboard statistics
- **GET /api/v1/events** - List events
- **GET /api/v1/analytics/events-by-day** - Events over time
- **GET /api/v1/analytics/top-pages** - Most popular pages
- **GET /api/v1/analytics/top-countries** - Traffic by country
- **GET /api/v1/analytics/top-event-types** - Event type distribution

## Event Types

Common event types you can track:

- `page_view` - Page visits
- `click` - Button/link clicks
- `form_submit` - Form submissions
- `download` - File downloads
- `video_play` - Video interactions
- `scroll` - Page scroll events
- `search` - Search queries
- `purchase` - E-commerce events

## Data Models

### Event
- ID, Session ID, User ID
- Event type and name
- Page information (URL, title, referrer)
- Device information (screen size, language, platform)
- Geographic information (country, city)
- Custom properties (JSON)

### Session
- ID, User ID, duration
- Landing page and referrer
- Device and geographic information
- Event count

### User
- ID, first/last seen dates
- Total sessions and events
- Geographic information

## Configuration

Environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 8080)
- `ENVIRONMENT` - Environment (development/production)

## Development

### Adding New Event Types

1. Define the event structure in your client application
2. Send POST request to `/api/v1/track` endpoint
3. Data will automatically appear in the dashboard

### Custom Analytics

You can extend the analytics service to add custom reports:

1. Add new methods to `AnalyticsService`
2. Create corresponding handlers
3. Add new API endpoints
4. Update the dashboard UI

## Client Integration

### JavaScript Example

```javascript
// Track a page view
function trackPageView() {
  fetch('/api/v1/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: getSessionId(),
      event_type: 'page_view',
      event_name: 'Page View',
      page_url: window.location.href,
      page_title: document.title,
      ip_address: '', // Will be auto-detected
      screen_width: screen.width,
      screen_height: screen.height,
      language: navigator.language
    })
  });
}

// Track a button click
function trackClick(buttonName) {
  fetch('/api/v1/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: getSessionId(),
      event_type: 'click',
      event_name: buttonName,
      page_url: window.location.href,
      properties: {
        element: buttonName
      }
    })
  });
}
```

## Deployment

### Production Deployment

1. Set environment variables
2. Build the Docker image:
   ```bash
   docker build -t analytics-app .
   ```
3. Deploy using your preferred container orchestration platform

### Scaling Considerations

- Use connection pooling for PostgreSQL
- Implement Redis for session storage
- Add load balancing for multiple instances
- Consider event queuing for high-traffic scenarios

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
