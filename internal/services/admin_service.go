package services

import (
	"analytic-app/internal/database"
	"analytic-app/internal/models"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminService struct {
	db *database.DB
}

func NewAdminService(db *database.DB) *AdminService {
	return &AdminService{db: db}
}

// CreateProjectRequest represents the request to create a new project
type CreateProjectRequest struct {
	Name        string  `json:"name" binding:"required"`
	Domain      string  `json:"domain" binding:"required"`
	Description *string `json:"description,omitempty"`
	OwnerName   string  `json:"owner_name" binding:"required"`
	OwnerEmail  string  `json:"owner_email" binding:"required,email"`
}

// UpdateProjectRequest represents the request to update a project
type UpdateProjectRequest struct {
	Name        *string `json:"name,omitempty"`
	Domain      *string `json:"domain,omitempty"`
	Description *string `json:"description,omitempty"`
	OwnerName   *string `json:"owner_name,omitempty"`
	OwnerEmail  *string `json:"owner_email,omitempty"`
	IsActive    *bool   `json:"is_active,omitempty"`
}

// ProjectResponse represents the project response with analytics data
type ProjectResponse struct {
	models.Project
	TotalEvents   int64      `json:"total_events"`
	TotalSessions int64      `json:"total_sessions"`
	TotalUsers    int64      `json:"total_users"`
	LastEventTime *time.Time `json:"last_event_time,omitempty"`
}

// CreateProject creates a new project
func (s *AdminService) CreateProject(req *CreateProjectRequest) (*models.Project, error) {
	project := &models.Project{
		Name:        req.Name,
		Domain:      req.Domain,
		Description: req.Description,
		OwnerName:   req.OwnerName,
		OwnerEmail:  req.OwnerEmail,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.db.Create(project).Error; err != nil {
		return nil, err
	}

	return project, nil
}

// GetProjects returns all projects with pagination
func (s *AdminService) GetProjects(limit, offset int) ([]ProjectResponse, int64, error) {
	var projects []models.Project
	var total int64

	// Get total count
	if err := s.db.Model(&models.Project{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get projects with pagination
	if err := s.db.Limit(limit).Offset(offset).Order("created_at DESC").Find(&projects).Error; err != nil {
		return nil, 0, err
	}

	// Build response with analytics data
	var response []ProjectResponse
	for _, project := range projects {
		projectResp := ProjectResponse{Project: project}

		// Get analytics data for each project
		s.db.Model(&models.Event{}).Where("project_id = ?", project.ID).Count(&projectResp.TotalEvents)
		s.db.Model(&models.Session{}).Joins("JOIN events ON sessions.id = events.session_id").
			Where("events.project_id = ?", project.ID).
			Distinct("sessions.id").Count(&projectResp.TotalSessions)
		s.db.Model(&models.User{}).Joins("JOIN events ON users.id = events.user_id").
			Where("events.project_id = ?", project.ID).
			Distinct("users.id").Count(&projectResp.TotalUsers)

		// Get last event time
		var lastEvent models.Event
		if err := s.db.Where("project_id = ?", project.ID).Order("created_at DESC").First(&lastEvent).Error; err == nil {
			projectResp.LastEventTime = &lastEvent.CreatedAt
		}

		response = append(response, projectResp)
	}

	return response, total, nil
}

// GetProjectByID returns a project by ID
func (s *AdminService) GetProjectByID(id uuid.UUID) (*ProjectResponse, error) {
	var project models.Project
	if err := s.db.Where("id = ?", id).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("project not found")
		}
		return nil, err
	}

	response := &ProjectResponse{Project: project}

	// Get analytics data
	s.db.Model(&models.Event{}).Where("project_id = ?", project.ID).Count(&response.TotalEvents)
	s.db.Model(&models.Session{}).Joins("JOIN events ON sessions.id = events.session_id").
		Where("events.project_id = ?", project.ID).
		Distinct("sessions.id").Count(&response.TotalSessions)
	s.db.Model(&models.User{}).Joins("JOIN events ON users.id = events.user_id").
		Where("events.project_id = ?", project.ID).
		Distinct("users.id").Count(&response.TotalUsers)

	// Get last event time
	var lastEvent models.Event
	if err := s.db.Where("project_id = ?", project.ID).Order("created_at DESC").First(&lastEvent).Error; err == nil {
		response.LastEventTime = &lastEvent.CreatedAt
	}

	return response, nil
}

// GetProjectByAPIKey returns a project by API key
func (s *AdminService) GetProjectByAPIKey(apiKey string) (*models.Project, error) {
	var project models.Project
	if err := s.db.Where("api_key = ? AND is_active = ?", apiKey, true).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("invalid API key")
		}
		return nil, err
	}
	return &project, nil
}

// UpdateProject updates a project
func (s *AdminService) UpdateProject(id uuid.UUID, req *UpdateProjectRequest) (*models.Project, error) {
	var project models.Project
	if err := s.db.Where("id = ?", id).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("project not found")
		}
		return nil, err
	}

	// Update fields if provided
	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Domain != nil {
		updates["domain"] = *req.Domain
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.OwnerName != nil {
		updates["owner_name"] = *req.OwnerName
	}
	if req.OwnerEmail != nil {
		updates["owner_email"] = *req.OwnerEmail
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if err := s.db.Model(&project).Updates(updates).Error; err != nil {
		return nil, err
	}

	return &project, nil
}

// DeleteProject deletes a project (soft delete by setting is_active to false)
func (s *AdminService) DeleteProject(id uuid.UUID) error {
	var project models.Project
	if err := s.db.Where("id = ?", id).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.New("project not found")
		}
		return err
	}

	// Soft delete by setting is_active to false
	updates := map[string]interface{}{
		"is_active":  false,
		"updated_at": time.Now(),
	}

	return s.db.Model(&project).Updates(updates).Error
}

// RegenerateAPIKey generates a new API key for a project
func (s *AdminService) RegenerateAPIKey(id uuid.UUID) (*models.Project, error) {
	var project models.Project
	if err := s.db.Where("id = ?", id).First(&project).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.New("project not found")
		}
		return nil, err
	}

	// Generate new API key
	newAPIKey := "ak_" + uuid.New().String()[:8] + uuid.New().String()[:8]

	updates := map[string]interface{}{
		"api_key":    newAPIKey,
		"updated_at": time.Now(),
	}

	if err := s.db.Model(&project).Updates(updates).Error; err != nil {
		return nil, err
	}

	project.APIKey = newAPIKey
	return &project, nil
}

// GenerateTrackingScript generates the JavaScript tracking script for a project
func (s *AdminService) GenerateTrackingScript(apiKey string) (string, error) {
	project, err := s.GetProjectByAPIKey(apiKey)
	if err != nil {
		return "", err
	}

	script := fmt.Sprintf(`<!-- Analytics Tracking Script for %s -->
<script>
(function() {
    // Analytics configuration
    var config = {
        apiKey: '%s',
        endpoint: '%s/api/v1/track',
        projectId: '%s',
        projectName: '%s',
        domain: '%s'
    };

    // Create analytics tracker with project configuration
    class ProjectAnalyticsTracker {
        constructor(config) {
            this.config = config;
            this.endpoint = config.endpoint;
            this.sessionId = this.generateSessionId();
            this.userId = null;
            this.projectId = config.projectId;
            this.init();
        }

        generateSessionId() {
            return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        init() {
            // Auto-track page view
            this.trackPageView();
            
            // Auto-track clicks
            document.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                    this.trackClick(e.target);
                }
            });

            // Auto-track form submissions
            document.addEventListener('submit', (e) => {
                this.trackFormSubmit(e.target);
            });
        }

        async track(eventData) {
            const payload = {
                project_id: this.projectId,
                session_id: this.sessionId,
                user_id: this.userId,
                ip_address: '',
                user_agent: navigator.userAgent,
                screen_width: screen.width,
                screen_height: screen.height,
                language: navigator.language,
                platform: navigator.platform,
                ...eventData
            };

            try {
                await fetch(this.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': this.config.apiKey
                    },
                    body: JSON.stringify(payload)
                });
            } catch (error) {
                console.warn('Analytics tracking failed:', error);
            }
        }

        trackPageView() {
            this.track({
                event_type: 'page_view',
                event_name: 'Page View',
                page_url: window.location.href,
                page_title: document.title,
                referrer: document.referrer || null
            });
        }

        trackClick(element) {
            const elementName = element.textContent?.trim() || element.className || 'Unknown Element';
            this.track({
                event_type: 'click',
                event_name: 'Click: ' + elementName,
                page_url: window.location.href,
                properties: {
                    element_tag: element.tagName,
                    element_class: element.className,
                    element_id: element.id
                }
            });
        }

        trackFormSubmit(form) {
            const formName = form.getAttribute('name') || form.getAttribute('id') || 'Unknown Form';
            this.track({
                event_type: 'form_submit',
                event_name: 'Form Submit: ' + formName,
                page_url: window.location.href,
                properties: {
                    form_name: formName,
                    form_id: form.id
                }
            });
        }

        trackCustomEvent(eventName, eventType, properties) {
            this.track({
                event_type: eventType || 'custom',
                event_name: eventName,
                page_url: window.location.href,
                properties: properties || {}
            });
        }

        setUserId(userId) {
            this.userId = userId;
        }
    }

    // Initialize tracker
    window.analytics = new ProjectAnalyticsTracker(config);
    
    // Global tracking functions
    window.trackEvent = function(eventName, eventType, properties) {
        window.analytics.trackCustomEvent(eventName, eventType, properties);
    };
    
    window.setUserId = function(userId) {
        window.analytics.setUserId(userId);
    };
})();
</script>`,
		project.Name,
		apiKey,
		"http://localhost:8080", // This should be configurable
		project.ID.String(),
		project.Name,
		project.Domain,
	)

	return script, nil
}
