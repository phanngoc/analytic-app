package handlers

import (
	"analytic-app/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RealTimeHandler struct {
	realTimeService *services.RealTimeService
	adminService    *services.AdminService
}

func NewRealTimeHandler(realTimeService *services.RealTimeService, adminService *services.AdminService) *RealTimeHandler {
	return &RealTimeHandler{
		realTimeService: realTimeService,
		adminService:    adminService,
	}
}

// GetProjectStats handles GET /admin/projects/:id/realtime/stats
func (h *RealTimeHandler) GetProjectStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		return
	}

	stats, err := h.realTimeService.GetProjectStats(projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetRecentEvents handles GET /admin/projects/:id/realtime/events
func (h *RealTimeHandler) GetRecentEvents(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 200 {
		limit = 50
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		return
	}

	events, err := h.realTimeService.GetRecentEvents(projectID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recent events"})
		return
	}

	// Always return an array, even if empty
	if events == nil {
		events = []services.RecentEvent{}
	}

	c.JSON(http.StatusOK, gin.H{
		"events": events,
		"limit":  limit,
	})
}

// GetEventTypeStats handles GET /admin/projects/:id/realtime/event-types
func (h *RealTimeHandler) GetEventTypeStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 50 {
		limit = 10
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		return
	}

	stats, err := h.realTimeService.GetEventTypeStats(projectID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch event type statistics"})
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.EventTypeStats{}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"limit": limit,
	})
}

// GetCountryStats handles GET /admin/projects/:id/realtime/countries
func (h *RealTimeHandler) GetCountryStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 50 {
		limit = 10
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		return
	}

	stats, err := h.realTimeService.GetCountryStats(projectID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch country statistics"})
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.CountryStats{}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"limit": limit,
	})
}

// GetPageStats handles GET /admin/projects/:id/realtime/pages
func (h *RealTimeHandler) GetPageStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 50 {
		limit = 10
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch project"})
		return
	}

	stats, err := h.realTimeService.GetPageStats(projectID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch page statistics"})
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.PageStats{}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"limit": limit,
	})
}
