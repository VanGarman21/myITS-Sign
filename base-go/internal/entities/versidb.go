package entities

import "time"

type VersiDB struct {
	IDVersi string    `json:"id_versi" gorm:"column:id_versi;type:varchar(10);primaryKey"`
	Tanggal time.Time `json:"tanggal" gorm:"column:tanggal;type:datetime;not null;default:GETDATE()"`
}

func (VersiDB) TableName() string {
	return "versi_db"
}

// VersiDBRepository defines the repository interface for versi_db
//go:generate mockery --name=VersiDBRepository
//
type VersiDBRepository interface {
	StoreVersiDB(v *VersiDB) error
	GetVersiDBByID(id string) (*VersiDB, error)
	UpdateVersiDB(v *VersiDB) error
	DeleteVersiDB(id string) error
	ListVersiDB(offset, limit int) ([]*VersiDB, error)
}

type VersiDBUsecase interface {
	CreateVersiDB(v *VersiDB) error
	GetVersiDBByID(id string) (*VersiDB, error)
	UpdateVersiDB(v *VersiDB) error
	DeleteVersiDB(id string) error
	ListVersiDB(page, limit int) ([]*VersiDB, error)
}