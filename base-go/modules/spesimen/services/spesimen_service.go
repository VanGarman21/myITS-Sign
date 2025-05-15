package services

import (
	"time"

	"github.com/google/uuid"

	"its.ac.id/base-go/modules/spesimen/models"
	"its.ac.id/base-go/modules/spesimen/repositories"
)

// SpesimenService adalah interface yang mendefinisikan operasi bisnis untuk spesimen tanda tangan
type SpesimenService interface {
	Create(data models.SpesimenTandaTanganCreate) (*models.SpesimenTandaTangan, error)
	GetByID(id uuid.UUID) (*models.SpesimenTandaTangan, error)
	GetBySDMID(sdmID uuid.UUID) (*models.SpesimenTandaTangan, error)
	Update(id uuid.UUID, data models.SpesimenTandaTanganUpdate) (*models.SpesimenTandaTangan, error)
	Delete(id uuid.UUID) error
}

type spesimenService struct {
	repo repositories.SpesimenRepository
}

// NewSpesimenService membuat instance baru dari SpesimenService
func NewSpesimenService(repo repositories.SpesimenRepository) SpesimenService {
	return &spesimenService{
		repo: repo,
	}
}

func (s *spesimenService) Create(data models.SpesimenTandaTanganCreate) (*models.SpesimenTandaTangan, error) {
	now := time.Now()

	spesimen := models.SpesimenTandaTangan{
		IDSDM:     data.IDSDM,
		Data:      data.Data,
		CreatedAt: now,
		UpdatedAt: now,
		Updater:   &data.Updater,
	}

	return s.repo.Create(spesimen)
}

func (s *spesimenService) GetByID(id uuid.UUID) (*models.SpesimenTandaTangan, error) {
	return s.repo.GetByID(id)
}

func (s *spesimenService) GetBySDMID(sdmID uuid.UUID) (*models.SpesimenTandaTangan, error) {
	return s.repo.GetBySDMID(sdmID)
}

func (s *spesimenService) Update(id uuid.UUID, data models.SpesimenTandaTanganUpdate) (*models.SpesimenTandaTangan, error) {
	return s.repo.Update(id, data)
}

func (s *spesimenService) Delete(id uuid.UUID) error {
	return s.repo.Delete(id)
}
