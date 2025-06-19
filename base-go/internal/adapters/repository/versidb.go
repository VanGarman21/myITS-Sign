package repository

import (
	"its.ac.id/base-go/internal/entities"

	"gorm.io/gorm"
)

type sqlServerVersiDBRepository struct {
	db *gorm.DB
}

func NewSqlServerVersiDBRepository(db *gorm.DB) entities.VersiDBRepository {
	return &sqlServerVersiDBRepository{db: db}
}

func (r *sqlServerVersiDBRepository) StoreVersiDB(v *entities.VersiDB) error {
	return r.db.Create(v).Error
}

func (r *sqlServerVersiDBRepository) GetVersiDBByID(id string) (*entities.VersiDB, error) {
	var v entities.VersiDB
	err := r.db.Where("id_versi = ?", id).First(&v).Error
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (r *sqlServerVersiDBRepository) UpdateVersiDB(v *entities.VersiDB) error {
	return r.db.Save(v).Error
}

func (r *sqlServerVersiDBRepository) DeleteVersiDB(id string) error {
	return r.db.Where("id_versi = ?", id).Delete(&entities.VersiDB{}).Error
}

func (r *sqlServerVersiDBRepository) ListVersiDB(offset, limit int) ([]*entities.VersiDB, error) {
	var versis []*entities.VersiDB
	err := r.db.Offset(offset).Limit(limit).Find(&versis).Error
	if err != nil {
		return nil, err
	}
	return versis, nil
}
