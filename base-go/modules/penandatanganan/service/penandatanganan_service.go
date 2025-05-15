package services

import (
    "context"
    
    "github.com/dptsi/its-go/models"
    "github.com/dptsi/its-go/repositories"
    "github.com/google/uuid"
)

type PenandatangananService interface {
    GetByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error)
    Create(ctx context.Context, input *CreatePenandatangananRequest) (*models.Penandatanganan, error)
    Update(ctx context.Context, id uuid.UUID, input *UpdatePenandatangananRequest) (*models.Penandatanganan, error)
    Delete(ctx context.Context, id uuid.UUID) error
    GetList(ctx context.Context, offset, limit int) ([]models.Penandatanganan, error)
}

type penandatangananService struct {
    repo repositories.PenandatangananRepository
}

func NewPenandatangananService(repo repositories.PenandatangananRepository) PenandatangananService {
    return &penandatangananService{repo}
}

// Implementasi method service...
func (s *penandatangananService) GetByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error) {
    return s.repo.FindByID(ctx, id)
}

func (s *penandatangananService) Create(ctx context.Context, input *CreatePenandatangananRequest) (*models.Penandatanganan, error) {
	penandatanganan := &models.Penandatanganan{
		IDPenandatanganan: uuid.New(),
		IDSdm: input.IDSdm,
		Judul: input.Judul,
		Type: input.Type,
		IsFooterExist: input.IsFooterExist,
		Tag: input.Tag,
		IsBulkSign: input.IsBulkSign,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.repo.Create(ctx, penandatanganan); err != nil {
		return nil, err
	}

	return penandatanganan, nil
}

func (s *penandatangananService) Update(ctx context.Context, id uuid.UUID, input *UpdatePenandatangananRequest) (*models.Penandatanganan, error) {
	penandatanganan, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	penandatanganan.IDSdm = input.IDSdm
	penandatanganan.Judul = input.Judul
	penandatanganan.Type = input.Type
	penandatanganan.IsFooterExist = input.IsFooterExist
	penandatanganan.Tag = input.Tag
	penandatanganan.IsBulkSign = input.IsBulkSign
	penandatanganan.UpdatedAt = time.Now()

	if err := s.repo.Update(ctx, id, penandatanganan); err != nil {
		return nil, err
	}

	return penandatanganan, nil
}

func (s *penandatangananService) Delete(ctx context.Context, id uuid.UUID) error {
	return s.repo.Delete(ctx, id)
}

func (s *penandatangananService) GetList(ctx context.Context, offset, limit int) ([]models.Penandatanganan, error) {
	return s.repo.FindAll(ctx, offset, limit)
}
