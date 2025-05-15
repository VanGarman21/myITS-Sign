package services

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/samber/do"
	"its.ac.id/base-go/contracts"
	"its.ac.id/base-go/modules/penandatanganan/models"
	"its.ac.id/base-go/modules/penandatanganan/repositories"
)

type PenandatangananService interface {
	GetByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error)
	Create(ctx context.Context, input *CreatePenandatangananRequest) (*models.Penandatanganan, error)
	// Implementasi method lainnya (Update, Delete, GetList)
}

type penandatangananService struct {
	repo repositories.PenandatangananRepository
}

func NewPenandatangananService(i *do.Injector) (PenandatangananService, error) {
	repo, err := repositories.NewPenandatangananRepository(do.MustInvoke[*database.DB](i))
	if err != nil {
		return nil, err
	}
	return &penandatangananService{repo: repo}, nil
}

type CreatePenandatangananRequest struct {
	IDSdm         uuid.UUID `json:"id_sdm" validate:"required"`
	Judul         string    `json:"judul" validate:"required,max=1024"`
	Type          int       `json:"type" validate:"required"`
	IsFooterExist *bool     `json:"is_footer_exist"`
	Tag           string    `json:"tag" validate:"max=1"`
	IsBulkSign    *bool     `json:"is_bulk_sign"`
}

type UpdatePenandatangananRequest struct {
	Judul         string `json:"judul" validate:"max=1024"`
	Type          int    `json:"type"`
	IsFooterExist *bool  `json:"is_footer_exist"`
	Tag           string `json:"tag" validate:"max=1"`
	IsBulkSign    *bool  `json:"is_bulk_sign"`
}

func (s *penandatangananService) GetByID(ctx context.Context, id uuid.UUID) (*models.Penandatanganan, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *penandatangananService) Create(ctx context.Context, input *CreatePenandatangananRequest) (*models.Penandatanganan, error) {
	penandatanganan := &models.Penandatanganan{
		IDSdm:         input.IDSdm,
		Judul:         input.Judul,
		Type:          input.Type,
		IsFooterExist: input.IsFooterExist,
		Tag:           input.Tag,
		IsBulkSign:    input.IsBulkSign,
	}

	if err := s.repo.Create(ctx, penandatanganan); err != nil {
		return nil, err
	}
	return penandatanganan, nil
}


