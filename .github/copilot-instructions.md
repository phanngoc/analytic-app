# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Go-based analytics application similar to Google Analytics for collecting user events.

## Project Structure
- `/cmd/server` - Main application entry point
- `/internal/handlers` - HTTP handlers
- `/internal/models` - Data models
- `/internal/services` - Business logic
- `/internal/database` - Database operations
- `/pkg/config` - Configuration management
- `/pkg/utils` - Utility functions
- `/migrations` - Database migrations

## Technologies
- Go 1.24+
- PostgreSQL database
- Gin web framework
- GORM ORM
- Docker for containerization

## Coding Standards
- Follow Go best practices and conventions
- Use dependency injection
- Implement proper error handling
- Add comprehensive logging
- Include unit tests for business logic
- Use interfaces for better testability
