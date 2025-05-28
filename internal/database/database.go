package database

import (
	"analytic-app/internal/models"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type DB struct {
	*gorm.DB
}

func NewConnection(databaseURL string) (*DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&models.Event{},
		&models.Session{},
		&models.User{},
		&models.Project{},
	)
	if err != nil {
		return nil, err
	}

	log.Println("Database connected and migrated successfully")
	return &DB{db}, nil
}

func (db *DB) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
