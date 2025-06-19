// Placeholder untuk usecase Spesimen
package usecase

import (
	"time"

	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/entities"
)

// SpesimenService adalah interface yang mendefinisikan operasi bisnis untuk spesimen tanda tangan
type SpesimenService interface {
	Create(data entities.SpesimenTandaTanganCreate) (*entities.SpesimenTandaTangan, error)
	GetByID(id string) (*entities.SpesimenTandaTangan, error)
	GetBySDMID(sdmID string) (*entities.SpesimenTandaTangan, error)
	Update(id string, data entities.SpesimenTandaTanganUpdate) (*entities.SpesimenTandaTangan, error)
	Delete(id string) error
}

type spesimenService struct {
	repo repository.SpesimenRepository
}

// NewSpesimenService membuat instance baru dari SpesimenService
func NewSpesimenService(repo repository.SpesimenRepository) SpesimenService {
	return &spesimenService{
		repo: repo,
	}
}

func (s *spesimenService) Create(data entities.SpesimenTandaTanganCreate) (*entities.SpesimenTandaTangan, error) {
	now := time.Now()
	// Cek apakah sudah ada spesimen untuk id_sdm
	existing, _ := s.repo.GetBySDMID(data.IDSDM)
	if existing != nil {
		// Update spesimen existing
		updateData := entities.SpesimenTandaTanganUpdate{
			Data:    data.Data,
			Updater: data.Updater,
		}
		return s.repo.Update(existing.IDSpesimen, updateData)
	}
	// Jika belum ada, insert baru
	spesimen := entities.SpesimenTandaTangan{
		IDSDM:     data.IDSDM,
		Data:      data.Data,
		CreatedAt: now,
		UpdatedAt: now,
		Updater:   &data.Updater,
	}
	return s.repo.Create(spesimen)
}

func (s *spesimenService) GetByID(id string) (*entities.SpesimenTandaTangan, error) {
	return s.repo.GetByID(id)
}

func (s *spesimenService) GetBySDMID(sdmID string) (*entities.SpesimenTandaTangan, error) {
	return s.repo.GetBySDMID(sdmID)
}

func (s *spesimenService) Update(id string, data entities.SpesimenTandaTanganUpdate) (*entities.SpesimenTandaTangan, error) {
	return s.repo.Update(id, data)
}

func (s *spesimenService) Delete(id string) error {
	return s.repo.Delete(id)
}
