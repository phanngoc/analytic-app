package main

import (
	"analytic-app/internal/database"
	"analytic-app/internal/handlers"
	"analytic-app/internal/services"
	"analytic-app/pkg/config"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.NewConnection(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Initialize services
	eventService := services.NewEventService(db)
	analyticsService := services.NewAnalyticsService(db)
	adminService := services.NewAdminService(db)
	realTimeService := services.NewRealTimeService(db)

	// Initialize handlers
	websocketHandler := handlers.NewWebSocketHandler(adminService)
	eventHandler := handlers.NewEventHandler(eventService, adminService, websocketHandler)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	adminHandler := handlers.NewAdminHandler(adminService)
	realTimeHandler := handlers.NewRealTimeHandler(realTimeService, adminService)

	// Setup router
	router := setupRouter(eventHandler, analyticsHandler, adminHandler, realTimeHandler, websocketHandler)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(eventHandler *handlers.EventHandler, analyticsHandler *handlers.AnalyticsHandler, adminHandler *handlers.AdminHandler, realTimeHandler *handlers.RealTimeHandler, websocketHandler *handlers.WebSocketHandler) *gin.Engine {
	router := gin.Default()

	// Add comprehensive middleware
	router.Use(handlers.CORSMiddleware())
	router.Use(handlers.LoggingMiddleware())
	router.Use(handlers.ErrorHandlingMiddleware())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Event tracking API
	api := router.Group("/api/v1")
	{
		// Event endpoints with API key validation
		api.POST("/track", eventHandler.APIKeyValidationMiddleware(), eventHandler.TrackEvent)
		api.GET("/events", eventHandler.GetEvents)

		// Analytics endpoints
		api.GET("/dashboard", analyticsHandler.GetDashboard)
		api.GET("/analytics/events-by-day", analyticsHandler.GetEventsByDay)
		api.GET("/analytics/top-pages", analyticsHandler.GetTopPages)
		api.GET("/analytics/top-countries", analyticsHandler.GetTopCountries)
		api.GET("/analytics/top-event-types", analyticsHandler.GetTopEventTypes)
	}

	// Admin API
	admin := router.Group("/api/v1/admin")
	{
		// Project management
		admin.POST("/projects", adminHandler.CreateProject)
		admin.GET("/projects", adminHandler.GetProjects)
		admin.GET("/projects/:id", adminHandler.GetProject)
		admin.PUT("/projects/:id", adminHandler.UpdateProject)
		admin.DELETE("/projects/:id", adminHandler.DeleteProject)
		admin.POST("/projects/:id/regenerate-key", adminHandler.RegenerateAPIKey)

		// Script generation
		admin.GET("/projects/:id/script", adminHandler.GetTrackingScript)
		admin.GET("/projects/:id/script/download", adminHandler.DownloadTrackingScript)

		// Real-time analytics endpoints
		admin.GET("/projects/:id/realtime/stats", realTimeHandler.GetProjectStats)
		admin.GET("/projects/:id/realtime/events", realTimeHandler.GetRecentEvents)
		admin.GET("/projects/:id/realtime/event-types", realTimeHandler.GetEventTypeStats)
		admin.GET("/projects/:id/realtime/countries", realTimeHandler.GetCountryStats)
		admin.GET("/projects/:id/realtime/pages", realTimeHandler.GetPageStats)

		// WebSocket endpoint for real-time events
		admin.GET("/projects/:id/ws", websocketHandler.HandleWebSocket)
	}

	// Serve static files for dashboard
	router.Static("/static", "./web/static")
	router.LoadHTMLGlob("web/templates/*")

	// Dashboard route
	router.GET("/", func(c *gin.Context) {
		c.HTML(200, "dashboard.html", gin.H{
			"title": "Analytics Dashboard",
		})
	})

	// Demo route for testing tracking script
	router.GET("/demo", func(c *gin.Context) {
		c.HTML(200, "demo.html", gin.H{
			"title": "Analytics Demo",
		})
	})

	return router
}
