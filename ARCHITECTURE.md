# Analytics Application - DDD Architecture

## Kiến trúc DDD với 4 tầng chính

### 1. Presentation Layer (Tầng Giao diện)
Chịu trách nhiệm xử lý các request từ client và trả về response.

```
cmd/
├── server/
│   └── main.go                 # Entry point
api/
├── handlers/                   # HTTP handlers
│   ├── analytics_handler.go
│   ├── event_handler.go
│   ├── project_handler.go
│   └── realtime_handler.go
├── middleware/                 # Middleware components
│   ├── auth.go
│   ├── cors.go
│   └── logging.go
└── dto/                        # Data Transfer Objects
    ├── analytics_dto.go
    ├── event_dto.go
    └── project_dto.go
```

### 2. Application Layer (Tầng Ứng dụng)
Chứa business logic cấp cao và orchestrate các domain services.

```
application/
├── services/                   # Application services
│   ├── analytics_service.go
│   ├── event_service.go
│   └── project_service.go
├── commands/                   # Command handlers (CQRS)
│   ├── create_project.go
│   ├── track_event.go
│   └── update_project.go
├── queries/                    # Query handlers (CQRS)
│   ├── get_analytics.go
│   ├── get_events.go
│   └── get_projects.go
└── interfaces/                 # Application interfaces
    ├── event_repository.go
    ├── project_repository.go
    └── analytics_repository.go
```

### 3. Domain Layer (Tầng Miền)
Chứa core business logic và domain entities.

```
domain/
├── entities/                   # Domain entities
│   ├── event.go
│   ├── project.go
│   ├── session.go
│   └── user.go
├── valueobjects/              # Value objects
│   ├── analytics_metrics.go
│   ├── event_properties.go
│   └── project_config.go
├── services/                  # Domain services
│   ├── analytics_calculator.go
│   └── event_aggregator.go
├── repositories/              # Repository interfaces
│   ├── event_repository.go
│   ├── project_repository.go
│   └── analytics_repository.go
└── events/                    # Domain events
    ├── event_tracked.go
    └── project_created.go
```

### 4. Infrastructure Layer (Tầng Hạ tầng)
Chứa implementation details và external dependencies.

```
infrastructure/
├── persistence/               # Database implementations
│   ├── postgres/
│   │   ├── event_repository.go
│   │   ├── project_repository.go
│   │   └── analytics_repository.go
│   └── migrations/
├── external/                  # External service integrations
│   ├── websocket/
│   └── geolocation/
├── config/                    # Configuration
│   └── config.go
└── shared/                    # Shared utilities
    └── utils.go
```

## Nguyên tắc thiết kế

### Dependency Rule
- Các layer trong chỉ được phụ thuộc vào các layer bên trong
- Domain layer không phụ thuộc vào bất kỳ layer nào khác
- Infrastructure layer implement interfaces được định nghĩa trong Domain/Application layer

### CQRS Pattern
- Tách biệt Command (Write) và Query (Read) operations
- Commands: Tạo, cập nhật, xóa data
- Queries: Đọc và truy vấn data

### Repository Pattern
- Abstract data access logic
- Interfaces trong Domain layer, implementations trong Infrastructure layer

### Domain Events
- Capture domain-specific events
- Enable loose coupling between bounded contexts
