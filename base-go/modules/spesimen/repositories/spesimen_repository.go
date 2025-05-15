package repositories

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"its.ac.id/base-go/modules/spesimen/models"
)

// SpesimenRepository adalah interface yang mendefinisikan operasi untuk spesimen tanda tangan
type SpesimenRepository interface {
	Create(spesimen models.SpesimenTandaTangan) (*models.SpesimenTandaTangan, error)
	GetByID(id uuid.UUID) (*models.SpesimenTandaTangan, error)
	GetBySDMID(sdmID uuid.UUID) (*models.SpesimenTandaTangan, error)
	Update(id uuid.UUID, data models.SpesimenTandaTanganUpdate) (*models.SpesimenTandaTangan, error)
	Delete(id uuid.UUID) error
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

func (r *spesimenRepository) Create(spesimen models.SpesimenTandaTangan) (*models.SpesimenTandaTangan, error) {
	spesimen.IDSpesimen = uuid.New()

	if err := r.DB.Create(&spesimen).Error; err != nil {
		return nil, err
	}

	return &spesimen, nil
}

func (r *spesimenRepository) GetByID(id uuid.UUID) (*models.SpesimenTandaTangan, error) {
	var spesimen models.SpesimenTandaTangan

	if err := r.DB.Where("id_spesimen = ?", id).Where("deleted_at IS NULL").First(&spesimen).Error; err != nil {
		return nil, err
	}

	return &spesimen, nil
}

func (r *spesimenRepository) GetBySDMID(sdmID uuid.UUID) (*models.SpesimenTandaTangan, error) {
	var spesimen models.SpesimenTandaTangan

	if err := r.DB.Where("id_sdm = ?", sdmID).Where("deleted_at IS NULL").First(&spesimen).Error; err != nil {
		return nil, err
	}

	return &spesimen, nil
}

func (r *spesimenRepository) Update(id uuid.UUID, data models.SpesimenTandaTanganUpdate) (*models.SpesimenTandaTangan, error) {
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

func (r *spesimenRepository) Delete(id uuid.UUID) error {
	updates := map[string]interface{}{
		"deleted_at": gorm.Expr("GETDATE()"),
	}

	if err := r.DB.Model(&models.SpesimenTandaTangan{}).Where("id_spesimen = ?", id).Updates(updates).Error; err != nil {
		return err
	}

	return nil
}
