package services

import (
	"analytic-app/internal/database"
	"analytic-app/internal/models"
	"time"
)

type AnalyticsService struct {
	db *database.DB
}

func NewAnalyticsService(db *database.DB) *AnalyticsService {
	return &AnalyticsService{db: db}
}

type DashboardStats struct {
	TotalEvents         int64 `json:"total_events"`
	TotalSessions       int64 `json:"total_sessions"`
	TotalUsers          int64 `json:"total_users"`
	TotalProjects       int64 `json:"total_projects"`
	EventsToday         int64 `json:"events_today"`
	SessionsToday       int64 `json:"sessions_today"`
	UniqueUsersToday    int64 `json:"unique_users_today"`
	UniqueVisitorsToday int64 `json:"unique_visitors_today"`
}

type EventCountByDay struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type TopPage struct {
	PageURL string `json:"page_url"`
	Count   int64  `json:"count"`
}

type CountryStats struct {
	Country string `json:"country"`
	Count   int64  `json:"count"`
}

func (s *AnalyticsService) GetDashboardStats() (*DashboardStats, error) {
	stats := &DashboardStats{}
	today := time.Now().Format("2006-01-02")

	// Total counts
	s.db.Model(&models.Event{}).Count(&stats.TotalEvents)
	s.db.Model(&models.Session{}).Count(&stats.TotalSessions)
	s.db.Model(&models.User{}).Count(&stats.TotalUsers)
	s.db.Model(&models.Project{}).Count(&stats.TotalProjects)

	// Today counts
	s.db.Model(&models.Event{}).Where("DATE(created_at) = ?", today).Count(&stats.EventsToday)
	s.db.Model(&models.Session{}).Where("DATE(created_at) = ?", today).Count(&stats.SessionsToday)
	s.db.Model(&models.User{}).Where("DATE(created_at) = ?", today).Count(&stats.UniqueUsersToday)

	// Set unique_visitors_today to same as unique_users_today for now
	stats.UniqueVisitorsToday = stats.UniqueUsersToday

	return stats, nil
}

func (s *AnalyticsService) GetEventCountByDay(days int) ([]EventCountByDay, error) {
	var results []EventCountByDay

	// Calculate the start date using Go time package for better portability
	startDate := time.Now().AddDate(0, 0, -days)

	err := s.db.Raw(`
		SELECT 
			DATE(created_at) as date,
			COUNT(*) as count
		FROM events 
		WHERE created_at >= ?
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`, startDate).Scan(&results).Error

	return results, err
}

func (s *AnalyticsService) GetTopPages(limit int) ([]TopPage, error) {
	var results []TopPage

	err := s.db.Model(&models.Event{}).
		Select("page_url, COUNT(*) as count").
		Where("page_url IS NOT NULL AND page_url != ''").
		Group("page_url").
		Order("count DESC").
		Limit(limit).
		Scan(&results).Error

	return results, err
}

func (s *AnalyticsService) GetTopCountries(limit int) ([]CountryStats, error) {
	var results []CountryStats

	err := s.db.Model(&models.Event{}).
		Select("country, COUNT(*) as count").
		Where("country IS NOT NULL AND country != ''").
		Group("country").
		Order("count DESC").
		Limit(limit).
		Scan(&results).Error

	return results, err
}

func (s *AnalyticsService) GetTopEventTypes(limit int) ([]struct {
	EventType string `json:"event_type"`
	Count     int64  `json:"count"`
}, error) {
	var results []struct {
		EventType string `json:"event_type"`
		Count     int64  `json:"count"`
	}

	err := s.db.Model(&models.Event{}).
		Select("event_type, COUNT(*) as count").
		Group("event_type").
		Order("count DESC").
		Limit(limit).
		Scan(&results).Error

	return results, err
}
