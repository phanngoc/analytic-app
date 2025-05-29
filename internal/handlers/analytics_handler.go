package handlers

import (
	"analytic-app/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AnalyticsHandler struct {
	analyticsService *services.AnalyticsService
}

func NewAnalyticsHandler(analyticsService *services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// GetDashboard handles GET /dashboard
func (h *AnalyticsHandler) GetDashboard(c *gin.Context) {
	stats, err := h.analyticsService.GetDashboardStats()
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch dashboard stats", err.Error())
		return
	}

	JSONSuccessResponse(c, stats)
}

// GetEventsByDay handles GET /analytics/events-by-day
func (h *AnalyticsHandler) GetEventsByDay(c *gin.Context) {
	daysStr := c.DefaultQuery("days", "7")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days > 365 {
		days = 7
	}

	data, err := h.analyticsService.GetEventCountByDay(days)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch events by day", err.Error())
		return
	}

	JSONSuccessResponse(c, data, gin.H{"days": days})
}

// GetTopPages handles GET /analytics/top-pages
func (h *AnalyticsHandler) GetTopPages(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 100 {
		limit = 10
	}

	data, err := h.analyticsService.GetTopPages(limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch top pages", err.Error())
		return
	}

	// Ensure consistent response format
	if data == nil {
		data = []services.TopPage{}
	}

	JSONSuccessResponse(c, data, gin.H{"limit": limit})
}

// GetTopCountries handles GET /analytics/top-countries
func (h *AnalyticsHandler) GetTopCountries(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 100 {
		limit = 10
	}

	data, err := h.analyticsService.GetTopCountries(limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch top countries", err.Error())
		return
	}

	JSONSuccessResponse(c, data, gin.H{"limit": limit})
}

// GetTopEventTypes handles GET /analytics/top-event-types
func (h *AnalyticsHandler) GetTopEventTypes(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 100 {
		limit = 10
	}

	data, err := h.analyticsService.GetTopEventTypes(limit)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch top event types", err.Error())
		return
	}

	JSONSuccessResponse(c, data, gin.H{"limit": limit})
}
