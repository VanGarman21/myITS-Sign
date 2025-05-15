package repositories

import (
    "context"
    
    "github.com/dptsi/its-go/database"
    "github.com/dptsi/its-go/models"
    "github.com/google/uuid"
)

type PenandatangananRepository interface {
    FindByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error)
    Create(ctx context.Context, penandatanganan *models.Penandatanganan) error
    Update(ctx context.Context, id uuid.UUID, penandatanganan *models.Penandatanganan) error
    Delete(ctx context.Context, id uuid.UUID) error
    FindAll(ctx context.Context, offset, limit int) ([]models.Penandatanganan, error)
}

type penandatangananRepository struct {
    db *database.DB
}

func NewPenandatangananRepository(db *database.DB) PenandatangananRepository {
    return &penandatangananRepository{db}
}

func (r *penandatangananRepository) FindByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error) {
    var penandatanganan models.Penandatanganan
    if err := r.db.WithContext(ctx).Where("id_penandatanganan = ?", id).First(&penandatanganan).Error; err != nil {
        return nil, err
    }
    return &penandatanganan, nil
}

func (r *penandatangananRepository) Create(ctx context.Context, penandatanganan *models.Penandatanganan) error {
    return r.db.WithContext(ctx).Create(penandatanganan).Error
}

func (r *penandatangananRepository) Update(ctx context.Context, id uuid.UUID, penandatanganan *models.Penandatanganan) error {
    return r.db.WithContext(ctx).Model(&models.Penandatanganan{}).Where("id_penandatanganan = ?", id).Updates(penandatanganan).Error
}

func (r *penandatangananRepository) Delete(ctx context.Context, id uuid.UUID) error {
    return r.db.WithContext(ctx).Where("id_penandatanganan = ?", id).Delete(&models.Penandatanganan{}).Error
}

func (r *penandatangananRepository) FindAll(ctx context.Context, offset, limit int) ([]models.Penandatanganan, error) {
    var penandatanganan []models.Penandatanganan
    result := r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&penandatanganan)
    return penandatanganan, result.Error
}