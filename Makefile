.PHONY: build run test clean docker-build docker-run dev deps

# Variables
APP_NAME=analytics-app
DOCKER_IMAGE=analytics-app
DOCKER_TAG=latest

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod
BINARY_PATH=./bin/$(APP_NAME)

# Build the application
build:
	$(GOBUILD) -o $(BINARY_PATH) ./cmd/server

# Run the application
run:
	$(GOCMD) run ./cmd/server/main.go

# Run tests
test:
	$(GOTEST) -v ./...

# Clean build artifacts
clean:
	rm -rf ./bin

# Install dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Development mode with hot reload (requires air)
dev:
	@which air > /dev/null || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	air

# Docker build
docker-build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

# Docker run
docker-run:
	docker run -p 8080:8080 --env-file .env $(DOCKER_IMAGE):$(DOCKER_TAG)

# Docker compose up
docker-up:
	docker-compose up -d

# Docker compose down
docker-down:
	docker-compose down

# Docker compose logs
docker-logs:
	docker-compose logs -f

# Setup development environment
setup: deps
	@echo "Setting up development environment..."
	@cp .env.example .env
	@echo "Please update .env file with your database credentials"
	@echo "Run 'make docker-up' to start PostgreSQL with Docker"
	@echo "Run 'make dev' to start development server with hot reload"

# Database migration (requires golang-migrate)
migrate-up:
	@which migrate > /dev/null || (echo "Installing golang-migrate..." && go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest)
	migrate -path ./migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path ./migrations -database "$(DATABASE_URL)" down

# Format code
fmt:
	go fmt ./...

# Lint code (requires golangci-lint)
lint:
	@which golangci-lint > /dev/null || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run

# Generate API documentation (requires swag)
docs:
	@which swag > /dev/null || (echo "Installing swag..." && go install github.com/swaggo/swag/cmd/swag@latest)
	swag init -g ./cmd/server/main.go

# API Testing
test-api:
	@echo "Running comprehensive API tests..."
	./test_api.sh

# Quick API Test
test-quick:
	@echo "Running quick API test..."
	./quick_test.sh

# Test single endpoint
test-health:
	@echo "Testing health endpoint..."
	curl -s http://localhost:8080/health | jq '.' 2>/dev/null || curl -s http://localhost:8080/health

# Track a sample event
test-track:
	@echo "Tracking a sample event..."
	@SESSION_ID="makefile-test-$$(date +%s)"; \
	curl -X POST "http://localhost:8080/api/v1/track" \
		-H "Content-Type: application/json" \
		-d "{\"session_id\": \"$$SESSION_ID\", \"event_type\": \"page_view\", \"event_name\": \"Makefile Test\", \"page_url\": \"https://example.com/makefile-test\"}" \
		-s | jq '.' 2>/dev/null || curl -X POST "http://localhost:8080/api/v1/track" -H "Content-Type: application/json" -d "{\"session_id\": \"$$SESSION_ID\", \"event_type\": \"page_view\", \"event_name\": \"Makefile Test\", \"page_url\": \"https://example.com/makefile-test\"}" -s

# Help
help:
	@echo "Available commands:"
	@echo "  build        Build the application"
	@echo "  run          Run the application"
	@echo "  test         Run tests"
	@echo "  clean        Clean build artifacts"
	@echo "  deps         Install dependencies"
	@echo "  dev          Run in development mode with hot reload"
	@echo "  docker-build Build Docker image"
	@echo "  docker-run   Run Docker container"
	@echo "  docker-up    Start services with Docker Compose"
	@echo "  docker-down  Stop services with Docker Compose"
	@echo "  setup        Setup development environment"
	@echo "  fmt          Format code"
	@echo "  lint         Lint code"
	@echo "  help         Show this help message"
	@echo "  test-api     Run comprehensive API tests"
	@echo "  test-quick   Run quick API test"
	@echo "  test-health  Test health endpoint"
	@echo "  test-track   Track a sample event"
