package models

import (
    "time"
    
    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Penandatanganan struct {
    IDPenandatanganan uuid.UUID      `gorm:"column:id_penandatanganan;primaryKey;type:uniqueidentifier"`
    IDSdm             uuid.UUID      `gorm:"column:id_sdm;type:uniqueidentifier"`
    Judul             string         `gorm:"column:judul;type:varchar(1024)"`
    Type              int            `gorm:"column:type"`
    IsFooterExist     *bool          `gorm:"column:is_footer_exist"`
    Tag               string         `gorm:"column:tag;type:char(1)"`
    IsBulkSign        *bool          `gorm:"column:is_bulk_sign"`
    CreatedAt         time.Time      `gorm:"column:created_at"`
    UpdatedAt         time.Time      `gorm:"column:updated_at"`
    DeletedAt         gorm.DeletedAt `gorm:"column:deleted_at;index"`
    Updater           *uuid.UUID     `gorm:"column:updater;type:uniqueidentifier"`
}

func (Penandatanganan) TableName() string {
    return "penandatanganan"
}