package services

import (
	"analytic-app/internal/database"
	"analytic-app/internal/models"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EventService struct {
	db *database.DB
}

func NewEventService(db *database.DB) *EventService {
	return &EventService{db: db}
}

type CreateEventRequest struct {
	ProjectID    *uuid.UUID             `json:"project_id,omitempty"`
	SessionID    string                 `json:"session_id" binding:"required"`
	UserID       *string                `json:"user_id,omitempty"`
	EventType    string                 `json:"event_type" binding:"required"`
	EventName    string                 `json:"event_name" binding:"required"`
	Properties   map[string]interface{} `json:"properties,omitempty"`
	PageURL      *string                `json:"page_url,omitempty"`
	PageTitle    *string                `json:"page_title,omitempty"`
	Referrer     *string                `json:"referrer,omitempty"`
	UserAgent    *string                `json:"user_agent,omitempty"`
	IPAddress    string                 `json:"ip_address" binding:"required"`
	Country      *string                `json:"country,omitempty"`
	City         *string                `json:"city,omitempty"`
	ScreenWidth  *int                   `json:"screen_width,omitempty"`
	ScreenHeight *int                   `json:"screen_height,omitempty"`
	Language     *string                `json:"language,omitempty"`
	Platform     *string                `json:"platform,omitempty"`
}

func (s *EventService) CreateEvent(req *CreateEventRequest) (*models.Event, error) {
	// Convert properties to JSON string
	var propertiesJSON string
	if req.Properties != nil {
		data, err := json.Marshal(req.Properties)
		if err != nil {
			return nil, err
		}
		propertiesJSON = string(data)
	}

	event := &models.Event{
		ID:           uuid.New(),
		ProjectID:    req.ProjectID,
		SessionID:    req.SessionID,
		UserID:       req.UserID,
		EventType:    req.EventType,
		EventName:    req.EventName,
		Properties:   propertiesJSON,
		PageURL:      req.PageURL,
		PageTitle:    req.PageTitle,
		Referrer:     req.Referrer,
		UserAgent:    req.UserAgent,
		IPAddress:    req.IPAddress,
		Country:      req.Country,
		City:         req.City,
		ScreenWidth:  req.ScreenWidth,
		ScreenHeight: req.ScreenHeight,
		Language:     req.Language,
		Platform:     req.Platform,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := s.db.Create(event).Error; err != nil {
		return nil, err
	}

	// Update session and user stats
	go s.updateSessionStats(req.SessionID)
	if req.UserID != nil {
		go s.updateUserStats(*req.UserID, req.IPAddress, req.Country, req.City)
	}

	return event, nil
}

func (s *EventService) GetEvents(limit, offset int, sessionID string) ([]models.Event, error) {
	var events []models.Event
	query := s.db.Model(&models.Event{})

	if sessionID != "" {
		query = query.Where("session_id = ?", sessionID)
	}

	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&events).Error

	return events, err
}

func (s *EventService) updateSessionStats(sessionID string) {
	var session models.Session
	if err := s.db.Where("id = ?", sessionID).First(&session).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new session
			session = models.Session{
				ID:         sessionID,
				StartTime:  time.Now(),
				EventCount: 1,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			s.db.Create(&session)
		}
		return
	}

	// Update session
	s.db.Model(&session).Updates(map[string]interface{}{
		"event_count": gorm.Expr("event_count + 1"),
		"updated_at":  time.Now(),
	})
}

func (s *EventService) updateUserStats(userID, ipAddress string, country, city *string) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new user
			user = models.User{
				ID:           userID,
				FirstSeen:    time.Now(),
				LastSeen:     time.Now(),
				SessionCount: 1,
				EventCount:   1,
				Country:      country,
				City:         city,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			}
			s.db.Create(&user)
		}
		return
	}

	// Update user
	updates := map[string]interface{}{
		"last_seen":   time.Now(),
		"event_count": gorm.Expr("event_count + 1"),
		"updated_at":  time.Now(),
	}

	if country != nil {
		updates["country"] = *country
	}
	if city != nil {
		updates["city"] = *city
	}

	s.db.Model(&user).Updates(updates)
}
