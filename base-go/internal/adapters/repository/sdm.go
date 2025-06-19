// Placeholder untuk repository SDM
package repository

import (
	"fmt"
	"time"

	"gorm.io/gorm"
	"its.ac.id/base-go/internal/entities"
)

type SDMRepository interface {
	GetAll() ([]entities.SDM, error)
	GetByNIK(nik string) (*entities.SDM, error)
	GetBySSOUserID(ssoUserID string) (*entities.SDM, error)
	GetByIDSDM(idSDM string) (*entities.SDM, error)
	Create(sdm *entities.SDM) (*entities.SDM, error)
	Update(nik string, sdm *entities.SDM) (*entities.SDM, error)
	Delete(nik string) error
	SearchByNama(nama string) ([]entities.SDM, error)
}

type sdmRepository struct {
	DB *gorm.DB
}

func NewSDMRepository(db *gorm.DB) SDMRepository {
	return &sdmRepository{DB: db}
}

func (r *sdmRepository) GetAll() ([]entities.SDM, error) {
	var sdms []entities.SDM
	err := r.DB.Raw(`SELECT * FROM [dbo].[sdm] WHERE deleted_at IS NULL`).Scan(&sdms).Error
	fmt.Println("SDM dari DB:", sdms)
	return sdms, err
}

func (r *sdmRepository) GetByNIK(nik string) (*entities.SDM, error) {
	var sdm entities.SDM
	err := r.DB.Raw(`SELECT TOP 1 CONVERT(VARCHAR(36), id_sdm) as id_sdm, id_spesimen, id_jenis_sdm, CONVERT(VARCHAR(36), sso_user_id) as sso_user_id, nik, gelar_depan, nama, gelar_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, no_reg, primary_email, primary_email_verified, alternate_email, alternate_email_verified, phone, phone_verified, is_confirmed, is_terdaftar_bsre, enabled, created_at, updated_at, deleted_at, updater FROM [dbo].[sdm] WHERE nik = ? AND deleted_at IS NULL`, nik).Scan(&sdm).Error
	if err != nil {
		return nil, err
	}
	if sdm.IDSDM == "" {
		return nil, nil
	}
	return &sdm, nil
}

func (r *sdmRepository) GetBySSOUserID(ssoUserID string) (*entities.SDM, error) {
	var sdm entities.SDM
	err := r.DB.Raw(`SELECT TOP 1 CONVERT(VARCHAR(36), id_sdm) as id_sdm, id_spesimen, id_jenis_sdm, CONVERT(VARCHAR(36), sso_user_id) as sso_user_id, nik, gelar_depan, nama, gelar_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, no_reg, primary_email, primary_email_verified, alternate_email, alternate_email_verified, phone, phone_verified, is_confirmed, is_terdaftar_bsre, enabled, created_at, updated_at, deleted_at, updater FROM [dbo].[sdm] WHERE sso_user_id = CONVERT(uniqueidentifier, ?) AND deleted_at IS NULL`, ssoUserID).Scan(&sdm).Error
	if err != nil {
		return nil, err
	}
	if sdm.IDSDM == "" {
		return nil, nil
	}
	return &sdm, nil
}

func (r *sdmRepository) GetByIDSDM(idSDM string) (*entities.SDM, error) {
	var sdm entities.SDM
	err := r.DB.Raw(`SELECT TOP 1 CONVERT(VARCHAR(36), id_sdm) as id_sdm, id_spesimen, id_jenis_sdm, CONVERT(VARCHAR(36), sso_user_id) as sso_user_id, nik, gelar_depan, nama, gelar_belakang, jenis_kelamin, tempat_lahir, tgl_lahir, no_reg, primary_email, primary_email_verified, alternate_email, alternate_email_verified, phone, phone_verified, is_confirmed, is_terdaftar_bsre, enabled, created_at, updated_at, deleted_at, updater FROM [dbo].[sdm] WHERE id_sdm = CONVERT(uniqueidentifier, ?) AND deleted_at IS NULL`, idSDM).Scan(&sdm).Error
	if err != nil {
		return nil, err
	}
	if sdm.IDSDM == "" {
		return nil, nil
	}
	return &sdm, nil
}

func (r *sdmRepository) Create(sdm *entities.SDM) (*entities.SDM, error) {
	sdm.CreatedAt = time.Now()
	sdm.UpdatedAt = time.Now()
	err := r.DB.Exec(`INSERT INTO [dbo].[sdm] (id_sdm, nik, nama, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
		sdm.IDSDM, sdm.NIK, sdm.Nama, sdm.Enabled, sdm.CreatedAt, sdm.UpdatedAt).Error
	if err != nil {
		return nil, err
	}
	return sdm, nil
}

func (r *sdmRepository) Update(nik string, sdm *entities.SDM) (*entities.SDM, error) {
	sdm.UpdatedAt = time.Now()
	err := r.DB.Exec(`UPDATE [dbo].[sdm] SET nama = ?, enabled = ?, updated_at = ? WHERE nik = ? AND deleted_at IS NULL`,
		sdm.Nama, sdm.Enabled, sdm.UpdatedAt, nik).Error
	if err != nil {
		return nil, err
	}
	return sdm, nil
}

func (r *sdmRepository) Delete(nik string) error {
	deletedAt := time.Now()
	return r.DB.Exec(`UPDATE [dbo].[sdm] SET deleted_at = ? WHERE nik = ? AND deleted_at IS NULL`, deletedAt, nik).Error
}

func (r *sdmRepository) SearchByNama(nama string) ([]entities.SDM, error) {
	var sdms []entities.SDM
	err := r.DB.Raw(`SELECT CONVERT(VARCHAR(36), id_sdm) as id_sdm, nama FROM [dbo].[sdm] WHERE deleted_at IS NULL AND LOWER(nama) LIKE LOWER(?)`, "%"+nama+"%").Scan(&sdms).Error
	return sdms, err
}
