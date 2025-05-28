package services

import (
	"analytic-app/internal/database"
	"analytic-app/internal/models"
	"time"

	"github.com/google/uuid"
)

type RealTimeService struct {
	db *database.DB
}

func NewRealTimeService(db *database.DB) *RealTimeService {
	return &RealTimeService{db: db}
}

type ProjectStats struct {
	TotalEvents     int64      `json:"total_events"`
	TotalSessions   int64      `json:"total_sessions"`
	TotalUsers      int64      `json:"total_users"`
	EventsToday     int64      `json:"events_today"`
	SessionsToday   int64      `json:"sessions_today"`
	UsersToday      int64      `json:"users_today"`
	LastEventTime   *time.Time `json:"last_event_time,omitempty"`
	ActiveSessions  int64      `json:"active_sessions"`
	CurrentVisitors int64      `json:"current_visitors"`
}

type RecentEvent struct {
	ID         uuid.UUID `json:"id"`
	EventType  string    `json:"event_type"`
	EventName  string    `json:"event_name"`
	PageURL    *string   `json:"page_url,omitempty"`
	PageTitle  *string   `json:"page_title,omitempty"`
	Country    *string   `json:"country,omitempty"`
	SessionID  string    `json:"session_id"`
	UserID     *string   `json:"user_id,omitempty"`
	Properties string    `json:"properties"`
	CreatedAt  time.Time `json:"created_at"`
}

type EventTypeStats struct {
	EventType string `json:"event_type"`
	Count     int64  `json:"count"`
}

type PageStats struct {
	PageURL   string `json:"page_url"`
	PageTitle string `json:"page_title,omitempty"`
	Count     int64  `json:"count"`
}

// GetProjectStats returns real-time statistics for a specific project
func (s *RealTimeService) GetProjectStats(projectID uuid.UUID) (*ProjectStats, error) {
	stats := &ProjectStats{}
	today := time.Now().Format("2006-01-02")

	// Last 5 minutes for "active" sessions
	fiveMinutesAgo := time.Now().Add(-5 * time.Minute)

	// Total counts for the project
	s.db.Model(&models.Event{}).Where("project_id = ?", projectID).Count(&stats.TotalEvents)
	s.db.Model(&models.Session{}).
		Joins("JOIN events ON events.session_id = sessions.id").
		Where("events.project_id = ?", projectID).
		Distinct("sessions.id").
		Count(&stats.TotalSessions)

	s.db.Model(&models.User{}).
		Joins("JOIN events ON events.user_id = users.id").
		Where("events.project_id = ?", projectID).
		Distinct("users.id").
		Count(&stats.TotalUsers)

	// Today's counts
	s.db.Model(&models.Event{}).
		Where("project_id = ? AND DATE(created_at) = ?", projectID, today).
		Count(&stats.EventsToday)

	s.db.Model(&models.Session{}).
		Joins("JOIN events ON events.session_id = sessions.id").
		Where("events.project_id = ? AND DATE(sessions.created_at) = ?", projectID, today).
		Distinct("sessions.id").
		Count(&stats.SessionsToday)

	s.db.Model(&models.User{}).
		Joins("JOIN events ON events.user_id = users.id").
		Where("events.project_id = ? AND DATE(events.created_at) = ?", projectID, today).
		Distinct("users.id").
		Count(&stats.UsersToday)

	// Active sessions (sessions with events in last 5 minutes)
	s.db.Model(&models.Session{}).
		Joins("JOIN events ON events.session_id = sessions.id").
		Where("events.project_id = ? AND events.created_at > ?", projectID, fiveMinutesAgo).
		Distinct("sessions.id").
		Count(&stats.ActiveSessions)

	// Current visitors (unique users active in last 5 minutes)
	s.db.Model(&models.User{}).
		Joins("JOIN events ON events.user_id = users.id").
		Where("events.project_id = ? AND events.created_at > ?", projectID, fiveMinutesAgo).
		Distinct("users.id").
		Count(&stats.CurrentVisitors)

	// Last event time
	var lastEvent models.Event
	if err := s.db.Where("project_id = ?", projectID).
		Order("created_at DESC").
		First(&lastEvent).Error; err == nil {
		stats.LastEventTime = &lastEvent.CreatedAt
	}

	return stats, nil
}

// GetRecentEvents returns recent events for a specific project
func (s *RealTimeService) GetRecentEvents(projectID uuid.UUID, limit int) ([]RecentEvent, error) {
	if limit <= 0 {
		limit = 50
	}

	var events []RecentEvent
	err := s.db.Model(&models.Event{}).
		Select("id, event_type, event_name, page_url, page_title, country, session_id, user_id, properties, created_at").
		Where("project_id = ?", projectID).
		Order("created_at DESC").
		Limit(limit).
		Find(&events).Error

	// Ensure we always return an empty slice instead of nil
	if events == nil {
		events = []RecentEvent{}
	}

	return events, err
}

// GetEventTypeStats returns event type statistics for a project
func (s *RealTimeService) GetEventTypeStats(projectID uuid.UUID, limit int) ([]EventTypeStats, error) {
	if limit <= 0 {
		limit = 10
	}

	var stats []EventTypeStats
	err := s.db.Model(&models.Event{}).
		Select("event_type, COUNT(*) as count").
		Where("project_id = ?", projectID).
		Group("event_type").
		Order("count DESC").
		Limit(limit).
		Find(&stats).Error

	// Ensure we always return an empty slice instead of nil
	if stats == nil {
		stats = []EventTypeStats{}
	}

	return stats, err
}

// GetCountryStats returns country statistics for a project
func (s *RealTimeService) GetCountryStats(projectID uuid.UUID, limit int) ([]CountryStats, error) {
	if limit <= 0 {
		limit = 10
	}

	var stats []CountryStats
	err := s.db.Model(&models.Event{}).
		Select("country, COUNT(*) as count").
		Where("project_id = ? AND country IS NOT NULL", projectID).
		Group("country").
		Order("count DESC").
		Limit(limit).
		Find(&stats).Error

	// Ensure we always return an empty slice instead of nil
	if stats == nil {
		stats = []CountryStats{}
	}

	return stats, err
}

// GetPageStats returns page statistics for a project
func (s *RealTimeService) GetPageStats(projectID uuid.UUID, limit int) ([]PageStats, error) {
	if limit <= 0 {
		limit = 10
	}

	var stats []PageStats
	err := s.db.Model(&models.Event{}).
		Select("page_url, page_title, COUNT(*) as count").
		Where("project_id = ? AND page_url IS NOT NULL", projectID).
		Group("page_url, page_title").
		Order("count DESC").
		Limit(limit).
		Find(&stats).Error

	// Ensure we always return an empty slice instead of nil
	if stats == nil {
		stats = []PageStats{}
	}

	return stats, err
}
