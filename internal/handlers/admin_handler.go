package handlers

import (
	"analytic-app/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	adminService *services.AdminService
}

func NewAdminHandler(adminService *services.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// CreateProject handles POST /admin/projects
func (h *AdminHandler) CreateProject(c *gin.Context) {
	var req services.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	project, err := h.adminService.CreateProject(&req)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to create project", err.Error())
		return
	}

	JSONSuccessResponse(c, gin.H{"project": project})
}

// GetProjects handles GET /admin/projects
func (h *AdminHandler) GetProjects(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit > 100 {
		limit = 50
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	projects, total, err := h.adminService.GetProjects(limit, offset)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch projects", err.Error())
		return
	}

	// Ensure projects is never nil
	if projects == nil {
		projects = []services.ProjectResponse{}
	}

	JSONSuccessResponse(c, projects, gin.H{
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

// GetProject handles GET /admin/projects/:id
func (h *AdminHandler) GetProject(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	project, err := h.adminService.GetProjectByID(id)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	JSONSuccessResponse(c, gin.H{"project": project})
}

// UpdateProject handles PUT /admin/projects/:id
func (h *AdminHandler) UpdateProject(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var req services.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid request data", err.Error())
		return
	}

	project, err := h.adminService.UpdateProject(id, &req)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to update project", err.Error())
		return
	}

	JSONSuccessResponse(c, gin.H{"project": project})
}

// DeleteProject handles DELETE /admin/projects/:id
func (h *AdminHandler) DeleteProject(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	err = h.adminService.DeleteProject(id)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to delete project", err.Error())
		return
	}

	JSONSuccessResponse(c, gin.H{"message": "Project deleted successfully"})
}

// RegenerateAPIKey handles POST /admin/projects/:id/regenerate-key
func (h *AdminHandler) RegenerateAPIKey(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	project, err := h.adminService.RegenerateAPIKey(id)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to regenerate API key", err.Error())
		return
	}

	JSONSuccessResponse(c, gin.H{
		"project": project,
		"message": "API key regenerated successfully",
	})
}

// GetTrackingScript handles GET /admin/projects/:id/script
func (h *AdminHandler) GetTrackingScript(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	// Get project to retrieve API key
	project, err := h.adminService.GetProjectByID(id)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to fetch project", err.Error())
		return
	}

	script, err := h.adminService.GenerateTrackingScript(project.APIKey)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to generate tracking script", err.Error())
		return
	}

	// Return script as text/plain for easy copying
	c.Header("Content-Type", "text/plain")
	c.String(http.StatusOK, script)
}

// GetTrackingScriptByAPIKey handles GET /script/:api_key
func (h *AdminHandler) GetTrackingScriptByAPIKey(c *gin.Context) {
	apiKey := c.Param("api_key")
	if apiKey == "" {
		JSONErrorResponse(c, http.StatusBadRequest, "API key is required")
		return
	}

	script, err := h.adminService.GenerateTrackingScript(apiKey)
	if err != nil {
		if err.Error() == "invalid API key" {
			JSONErrorResponse(c, http.StatusNotFound, "Invalid API key")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to generate tracking script", err.Error())
		return
	}

	// Return script as JavaScript content type
	c.Header("Content-Type", "application/javascript")
	c.String(http.StatusOK, script)
}

// DownloadTrackingScript handles GET /admin/projects/:id/script/download
func (h *AdminHandler) DownloadTrackingScript(c *gin.Context) {
	idParam := c.Param("id")
	projectID, err := uuid.Parse(idParam)
	if err != nil {
		JSONErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	// Get project to validate it exists and get API key
	project, err := h.adminService.GetProjectByID(projectID)
	if err != nil {
		if err.Error() == "project not found" {
			JSONErrorResponse(c, http.StatusNotFound, "Project not found")
			return
		}
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to get project", err.Error())
		return
	}

	script, err := h.adminService.GenerateTrackingScript(project.APIKey)
	if err != nil {
		JSONErrorResponse(c, http.StatusInternalServerError, "Failed to generate tracking script", err.Error())
		return
	}

	// Set headers for file download
	c.Header("Content-Type", "application/javascript")
	c.Header("Content-Disposition", "attachment; filename=\"analytics-tracking.js\"")
	c.String(http.StatusOK, script)
}
