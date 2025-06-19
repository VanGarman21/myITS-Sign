// Placeholder untuk repository Spesimen
package repository

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"its.ac.id/base-go/internal/entities"
)

// SpesimenRepository adalah interface yang mendefinisikan operasi untuk spesimen tanda tangan
type SpesimenRepository interface {
	Create(spesimen entities.SpesimenTandaTangan) (*entities.SpesimenTandaTangan, error)
	GetByID(id string) (*entities.SpesimenTandaTangan, error)
	GetBySDMID(sdmID string) (*entities.SpesimenTandaTangan, error)
	Update(id string, data entities.SpesimenTandaTanganUpdate) (*entities.SpesimenTandaTangan, error)
	Delete(id string) error
}

type spesimenRepository struct {
	DB *gorm.DB
}

// NewSpesimenRepository membuat instance baru dari SpesimenRepository
func NewSpesimenRepository(db *gorm.DB) SpesimenRepository {
	return &spesimenRepository{
		DB: db,
	}
}

func (r *spesimenRepository) Create(spesimen entities.SpesimenTandaTangan) (*entities.SpesimenTandaTangan, error) {
	// Generate UUID string baru untuk IDSpesimen jika kosong
	if spesimen.IDSpesimen == "" {
		spesimen.IDSpesimen = uuid.New().String()
	}

	if err := r.DB.Create(&spesimen).Error; err != nil {
		return nil, err
	}

	return &spesimen, nil
}

func (r *spesimenRepository) GetByID(id string) (*entities.SpesimenTandaTangan, error) {
	var spesimen entities.SpesimenTandaTangan

	err := r.DB.Raw(`SELECT CAST(id_spesimen AS VARCHAR(36)) as id_spesimen, CAST(id_sdm AS VARCHAR(36)) as id_sdm, data, created_at, updated_at, deleted_at, CAST(updater AS VARCHAR(36)) as updater FROM [dbo].[spesimen_tanda_tangan] WHERE id_spesimen = ? AND deleted_at IS NULL`, id).Scan(&spesimen).Error
	if err != nil {
		return nil, err
	}

	return &spesimen, nil
}

func (r *spesimenRepository) GetBySDMID(sdmID string) (*entities.SpesimenTandaTangan, error) {
	var spesimen entities.SpesimenTandaTangan

	err := r.DB.Raw(`SELECT CAST(id_spesimen AS VARCHAR(36)) as id_spesimen, CAST(id_sdm AS VARCHAR(36)) as id_sdm, data, created_at, updated_at, deleted_at, CAST(updater AS VARCHAR(36)) as updater FROM [dbo].[spesimen_tanda_tangan] WHERE id_sdm = ? AND deleted_at IS NULL`, sdmID).Scan(&spesimen).Error
	if err != nil {
		return nil, err
	}
	// Tambahan: jika tidak ada spesimen, return error
	if spesimen.IDSpesimen == "" {
		return nil, gorm.ErrRecordNotFound
	}
	return &spesimen, nil
}

func (r *spesimenRepository) Update(id string, data entities.SpesimenTandaTanganUpdate) (*entities.SpesimenTandaTangan, error) {
	spesimen, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	updates := map[string]interface{}{
		"data":       data.Data,
		"updater":    data.Updater,
		"updated_at": gorm.Expr("GETDATE()"),
	}

	if err := r.DB.Model(&spesimen).Updates(updates).Error; err != nil {
		return nil, err
	}

	return spesimen, nil
}

func (r *spesimenRepository) Delete(id string) error {
	updates := map[string]interface{}{
		"deleted_at": gorm.Expr("GETDATE()"),
	}

	if err := r.DB.Model(&entities.SpesimenTandaTangan{}).Where("id_spesimen = ?", id).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}
