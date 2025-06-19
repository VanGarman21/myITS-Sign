package entities

import (
	"time"
)

// SDM merepresentasikan tabel sdm di database
type SDM struct {
	IDSDM                  string     `json:"id_sdm" gorm:"column:id_sdm"`
	IDSpesimen             *string    `json:"id_spesimen" gorm:"column:id_spesimen"`
	IDJenisSDM             int        `json:"id_jenis_sdm" gorm:"column:id_jenis_sdm"`
	SSOUserID              string     `json:"sso_user_id" gorm:"column:sso_user_id"`
	NIK                    string     `json:"nik" gorm:"column:nik"`
	GelarDepan             *string    `json:"gelar_depan" gorm:"column:gelar_depan"`
	Nama                   string     `json:"nama" gorm:"column:nama"`
	GelarBelakang          *string    `json:"gelar_belakang" gorm:"column:gelar_belakang"`
	JenisKelamin           *string    `json:"jenis_kelamin" gorm:"column:jenis_kelamin"`
	TempatLahir            *string    `json:"tempat_lahir" gorm:"column:tempat_lahir"`
	TglLahir               *time.Time `json:"tgl_lahir" gorm:"column:tgl_lahir"`
	NoReg                  *string    `json:"no_reg" gorm:"column:no_reg"`
	PrimaryEmail           *string    `json:"primary_email" gorm:"column:primary_email"`
	PrimaryEmailVerified   *bool      `json:"primary_email_verified" gorm:"column:primary_email_verified"`
	AlternateEmail         *string    `json:"alternate_email" gorm:"column:alternate_email"`
	AlternateEmailVerified *bool      `json:"alternate_email_verified" gorm:"column:alternate_email_verified"`
	Phone                  *string    `json:"phone" gorm:"column:phone"`
	PhoneVerified          *bool      `json:"phone_verified" gorm:"column:phone_verified"`
	IsConfirmed            *bool      `json:"is_confirmed" gorm:"column:is_confirmed"`
	IsTerdaftarBSRE        *bool      `json:"is_terdaftar_bsre" gorm:"column:is_terdaftar_bsre"`
	Enabled                bool       `json:"enabled" gorm:"column:enabled"`
	CreatedAt              time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt              time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt              *time.Time `json:"deleted_at" gorm:"column:deleted_at"`
	Updater                *string    `json:"updater" gorm:"column:updater"`
}

func (SDM) TableName() string {
	return "sdm"
}
