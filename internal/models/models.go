package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Event represents a user event like Google Analytics
type Event struct {
	ID         uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	ProjectID  *uuid.UUID `json:"project_id,omitempty" gorm:"type:uuid;index"`
	SessionID  string     `json:"session_id" gorm:"not null;index"`
	UserID     *string    `json:"user_id,omitempty" gorm:"index"`
	EventType  string     `json:"event_type" gorm:"not null;index"`
	EventName  string     `json:"event_name" gorm:"not null"`
	Properties string     `json:"properties" gorm:"type:jsonb"`

	// Page/Screen info
	PageURL   *string `json:"page_url,omitempty"`
	PageTitle *string `json:"page_title,omitempty"`
	Referrer  *string `json:"referrer,omitempty"`

	// Device/Browser info
	UserAgent *string `json:"user_agent,omitempty"`
	IPAddress string  `json:"ip_address" gorm:"not null"`
	Country   *string `json:"country,omitempty"`
	City      *string `json:"city,omitempty"`

	// Technical info
	ScreenWidth  *int    `json:"screen_width,omitempty"`
	ScreenHeight *int    `json:"screen_height,omitempty"`
	Language     *string `json:"language,omitempty"`
	Platform     *string `json:"platform,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Session represents a user session
type Session struct {
	ID         string     `json:"id" gorm:"primaryKey"`
	UserID     *string    `json:"user_id,omitempty" gorm:"index"`
	StartTime  time.Time  `json:"start_time" gorm:"not null"`
	EndTime    *time.Time `json:"end_time,omitempty"`
	Duration   *int64     `json:"duration,omitempty"` // in seconds
	EventCount int        `json:"event_count" gorm:"default:0"`

	// First page info
	LandingPage *string `json:"landing_page,omitempty"`
	Referrer    *string `json:"referrer,omitempty"`

	// Device info
	UserAgent *string `json:"user_agent,omitempty"`
	IPAddress string  `json:"ip_address" gorm:"not null"`
	Country   *string `json:"country,omitempty"`
	City      *string `json:"city,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// User represents a tracked user
type User struct {
	ID           string    `json:"id" gorm:"primaryKey"`
	FirstSeen    time.Time `json:"first_seen" gorm:"not null"`
	LastSeen     time.Time `json:"last_seen" gorm:"not null"`
	SessionCount int       `json:"session_count" gorm:"default:0"`
	EventCount   int       `json:"event_count" gorm:"default:0"`

	// Derived info
	Country *string `json:"country,omitempty"`
	City    *string `json:"city,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Project represents a registered project/website for analytics tracking
type Project struct {
	ID            uuid.UUID  `json:"id" gorm:"type:uuid;primaryKey"`
	Name          string     `json:"name" gorm:"not null"`
	Domain        string     `json:"domain" gorm:"not null"`
	APIKey        string     `json:"api_key" gorm:"uniqueIndex;not null"`
	Description   *string    `json:"description,omitempty"`
	OwnerName     string     `json:"owner_name" gorm:"not null"`
	OwnerEmail    string     `json:"owner_email" gorm:"not null"`
	TotalEvents   int        `json:"total_events" gorm:"default:0"`
	TotalSessions int        `json:"total_sessions" gorm:"default:0"`
	TotalUsers    int        `json:"total_users" gorm:"default:0"`
	LastEventTime *time.Time `json:"last_event_time,omitempty"`
	IsActive      bool       `json:"is_active" gorm:"default:true"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// BeforeCreate sets the UUID for events
func (e *Event) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}

// BeforeCreate sets the UUID and generates API key for projects
func (p *Project) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	if p.APIKey == "" {
		p.APIKey = generateAPIKey()
	}
	return nil
}

// generateAPIKey generates a unique API key for projects
func generateAPIKey() string {
	return "ak_" + uuid.New().String()[:8] + uuid.New().String()[:8]
}
