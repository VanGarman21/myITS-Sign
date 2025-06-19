// Placeholder untuk usecase SDM
package usecase

import (
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/entities"
)

type SDMService interface {
	GetAll() ([]entities.SDM, error)
	GetByNIK(nik string) (*entities.SDM, error)
	Create(sdm *entities.SDM) (*entities.SDM, error)
	Update(nik string, sdm *entities.SDM) (*entities.SDM, error)
	Delete(nik string) error
	GetBySSOUserID(ssoUserID string) (*entities.SDM, error)
	GetByIDSDM(idSDM string) (*entities.SDM, error)
	SearchByNama(nama string) ([]entities.SDM, error)
}

type sdmService struct {
	repo repository.SDMRepository
}

func NewSDMService(repo repository.SDMRepository) SDMService {
	return &sdmService{repo: repo}
}

func (s *sdmService) GetAll() ([]entities.SDM, error) {
	return s.repo.GetAll()
}

func (s *sdmService) GetByNIK(nik string) (*entities.SDM, error) {
	return s.repo.GetByNIK(nik)
}

func (s *sdmService) Create(sdm *entities.SDM) (*entities.SDM, error) {
	return s.repo.Create(sdm)
}

func (s *sdmService) Update(nik string, sdm *entities.SDM) (*entities.SDM, error) {
	return s.repo.Update(nik, sdm)
}

func (s *sdmService) Delete(nik string) error {
	return s.repo.Delete(nik)
}

func (s *sdmService) GetBySSOUserID(ssoUserID string) (*entities.SDM, error) {
	return s.repo.GetBySSOUserID(ssoUserID)
}

func (s *sdmService) GetByIDSDM(idSDM string) (*entities.SDM, error) {
	return s.repo.GetByIDSDM(idSDM)
}

func (s *sdmService) SearchByNama(nama string) ([]entities.SDM, error) {
	return s.repo.SearchByNama(nama)
}
