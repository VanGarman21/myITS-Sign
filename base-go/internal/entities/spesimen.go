package entities

import (
	"time"
)

// SpesimenTandaTangan merepresentasikan model untuk tabel spesimen_tanda_tangan
type SpesimenTandaTangan struct {
	IDSpesimen string     `json:"id_spesimen" gorm:"column:id_spesimen;primary_key;type:uniqueidentifier"`
	IDSDM      string     `json:"id_sdm" gorm:"column:id_sdm;type:uniqueidentifier"`
	Data       string     `json:"data" gorm:"column:data;type:varchar(max)"`
	CreatedAt  time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt  time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt  *time.Time `json:"deleted_at" gorm:"column:deleted_at"`
	Updater    *string    `json:"updater" gorm:"column:updater;type:uniqueidentifier"`
}

// TableName mengembalikan nama tabel untuk model ini
func (SpesimenTandaTangan) TableName() string {
	return "spesimen_tanda_tangan"
}

// SpesimenTandaTanganCreate merepresentasikan struct untuk membuat spesimen baru
type SpesimenTandaTanganCreate struct {
	IDSDM   string `json:"id_sdm" binding:"required"`
	Data    string `json:"data" binding:"required"`
	Updater string `json:"updater"`
}

// SpesimenTandaTanganUpdate merepresentasikan struct untuk memperbarui spesimen
type SpesimenTandaTanganUpdate struct {
	Data    string `json:"data"`
	Updater string `json:"updater"`
}
