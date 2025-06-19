package usecase

import "its.ac.id/base-go/internal/entities"

type versiDBUsecase struct {
	repo entities.VersiDBRepository
}

func NewVersiDBUsecase(repo entities.VersiDBRepository) entities.VersiDBUsecase {
	return &versiDBUsecase{repo: repo}
}

func (u *versiDBUsecase) CreateVersiDB(v *entities.VersiDB) error {
	return u.repo.StoreVersiDB(v)
}

func (u *versiDBUsecase) GetVersiDBByID(id string) (*entities.VersiDB, error) {
	return u.repo.GetVersiDBByID(id)
}

func (u *versiDBUsecase) UpdateVersiDB(v *entities.VersiDB) error {
	return u.repo.UpdateVersiDB(v)
}

func (u *versiDBUsecase) DeleteVersiDB(id string) error {
	return u.repo.DeleteVersiDB(id)
}

func (u *versiDBUsecase) ListVersiDB(page, limit int) ([]*entities.VersiDB, error) {
	offset := (page - 1) * limit
	return u.repo.ListVersiDB(offset, limit)
}
