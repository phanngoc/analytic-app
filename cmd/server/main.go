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

	// Initialize handlers
	eventHandler := handlers.NewEventHandler(eventService, adminService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	adminHandler := handlers.NewAdminHandler(adminService)

	// Setup router
	router := setupRouter(eventHandler, analyticsHandler, adminHandler)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(eventHandler *handlers.EventHandler, analyticsHandler *handlers.AnalyticsHandler, adminHandler *handlers.AdminHandler) *gin.Engine {
	router := gin.Default()

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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

	return router
}
