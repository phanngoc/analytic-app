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
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
		return
	}

	// Verify project exists
	_, err = h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found", "")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	stats, err := h.realTimeService.GetProjectStats(projectID)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project statistics", err.Error())
		return
	}

	JSONSuccessResponse(c, stats, nil)
}

// GetRecentEvents handles GET /admin/projects/:id/realtime/events
func (h *RealTimeHandler) GetRecentEvents(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
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
			JSONErrorResponse(c, http.StatusNotFound, "Project not found", "")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	events, err := h.realTimeService.GetRecentEvents(projectID, limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch recent events", err.Error())
		return
	}

	// Always return an array, even if empty
	if events == nil {
		events = []services.RecentEvent{}
	}

	JSONSuccessResponse(c, events, gin.H{"limit": limit})
}

// GetEventTypeStats handles GET /admin/projects/:id/realtime/event-types
func (h *RealTimeHandler) GetEventTypeStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
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
			JSONErrorResponse(c, http.StatusNotFound, "Project not found", "")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	stats, err := h.realTimeService.GetEventTypeStats(projectID, limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch event type statistics", err.Error())
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.EventTypeStats{}
	}

	JSONSuccessResponse(c, stats, gin.H{"limit": limit})
}

// GetCountryStats handles GET /admin/projects/:id/realtime/countries
func (h *RealTimeHandler) GetCountryStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
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
			JSONErrorResponse(c, http.StatusNotFound, "Project not found", "")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	stats, err := h.realTimeService.GetCountryStats(projectID, limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch country statistics", err.Error())
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.CountryStats{}
	}

	JSONSuccessResponse(c, stats, gin.H{"limit": limit})
}

// GetPageStats handles GET /admin/projects/:id/realtime/pages
func (h *RealTimeHandler) GetPageStats(c *gin.Context) {
	idStr := c.Param("id")
	projectID, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
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
			JSONErrorResponse(c, http.StatusNotFound, "Project not found", "")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	stats, err := h.realTimeService.GetPageStats(projectID, limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch page statistics", err.Error())
		return
	}

	// Always return an array, even if empty
	if stats == nil {
		stats = []services.PageStats{}
	}

	JSONSuccessResponse(c, stats, gin.H{"limit": limit})
}
