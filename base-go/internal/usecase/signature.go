// Placeholder untuk usecase Signature
package usecase

import "its.ac.id/base-go/internal/entities"

// SignatureTableUsecase interface
//go:generate mockery --name=SignatureTableUsecase
//
type SignatureTableUsecase interface {
	GetSignatureTable(idSdm string, search string, status int, offset int, limit int) ([]entities.SignatureTableRow, int, error)
}

type signatureTableUsecase struct {
	repo interface {
		GetSignatureTable(idSdm string, search string, status int, offset int, limit int) ([]entities.SignatureTableRow, int, error)
	}
}

func NewSignatureTableUsecase(repo interface {
	GetSignatureTable(idSdm string, search string, status int, offset int, limit int) ([]entities.SignatureTableRow, int, error)
}) SignatureTableUsecase {
	return &signatureTableUsecase{repo: repo}
}

func (u *signatureTableUsecase) GetSignatureTable(idSdm string, search string, status int, offset int, limit int) ([]entities.SignatureTableRow, int, error) {
	return u.repo.GetSignatureTable(idSdm, search, status, offset, limit)
}
