package handlers

import (
	"analytic-app/internal/models"
	"analytic-app/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EventHandler struct {
	eventService     *services.EventService
	adminService     *services.AdminService
	websocketHandler *WebSocketHandler
}

func NewEventHandler(eventService *services.EventService, adminService *services.AdminService, websocketHandler *WebSocketHandler) *EventHandler {
	return &EventHandler{
		eventService:     eventService,
		adminService:     adminService,
		websocketHandler: websocketHandler,
	}
}

// APIKeyValidationMiddleware validates API key for tracking endpoints
func (h *EventHandler) APIKeyValidationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			// Try to get API key from query parameter as fallback
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "API key is required"})
			c.Abort()
			return
		}

		// Validate API key and get project
		project, err := h.adminService.GetProjectByAPIKey(apiKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
			c.Abort()
			return
		}

		// Store project in context for use in handlers
		c.Set("project", project)
		c.Next()
	}
}

// TrackEvent handles POST /track
func (h *EventHandler) TrackEvent(c *gin.Context) {
	// Get project from middleware
	projectInterface, exists := c.Get("project")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Project context not found"})
		return
	}

	project, ok := projectInterface.(*models.Project)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid project context"})
		return
	}

	var req services.CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set project ID from validated project
	req.ProjectID = &project.ID

	// Get IP from request if not provided
	if req.IPAddress == "" {
		req.IPAddress = c.ClientIP()
	}

	event, err := h.eventService.CreateEvent(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to track event"})
		return
	}

	// Broadcast event to WebSocket clients if handler is available
	if h.websocketHandler != nil {
		h.websocketHandler.BroadcastEvent(event)
	}

	c.JSON(http.StatusCreated, gin.H{
		"success":  true,
		"event_id": event.ID,
		"project":  project.Name,
	})
}

// GetEvents handles GET /events
func (h *EventHandler) GetEvents(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")
	sessionID := c.Query("session_id")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 1000 {
		limit = 50
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	events, err := h.eventService.GetEvents(limit, offset, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"limit":  limit,
		"offset": offset,
	})
}
