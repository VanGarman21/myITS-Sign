// Placeholder untuk usecase Penandatanganan
package usecase

import "its.ac.id/base-go/internal/entities"

type penandatangananUsecase struct {
	repo entities.PenandatangananRepository
}

func NewPenandatangananUsecase(repo entities.PenandatangananRepository) entities.PenandatangananUsecase {
	return &penandatangananUsecase{repo: repo}
}

// Penandatanganan
func (u *penandatangananUsecase) CreatePenandatanganan(p *entities.Penandatanganan) error {
	return u.repo.StorePenandatanganan(p)
}
func (u *penandatangananUsecase) GetPenandatangananByID(id string) (*entities.Penandatanganan, error) {
	return u.repo.GetPenandatangananByID(id)
}
func (u *penandatangananUsecase) UpdatePenandatanganan(p *entities.Penandatanganan) error {
	return u.repo.UpdatePenandatanganan(p)
}
func (u *penandatangananUsecase) DeletePenandatanganan(id string) error {
	// Hapus semua anggota terlebih dahulu
	if err := u.repo.DeleteAllAnggotaByPenandatangananID(id); err != nil {
		return err
	}
	// Hapus semua dokumen terkait
	if err := u.repo.DeleteAllDokumenByPenandatangananID(id); err != nil {
		return err
	}
	return u.repo.DeletePenandatanganan(id)
}
func (u *penandatangananUsecase) ListPenandatanganan(page, limit int) ([]*entities.Penandatanganan, error) {
	offset := (page - 1) * limit
	return u.repo.ListPenandatanganan(offset, limit)
}

// Anggota
func (u *penandatangananUsecase) AddAnggota(a *entities.AnggotaTandatangan) error {
	return u.repo.StoreAnggota(a)
}
func (u *penandatangananUsecase) GetAnggotaByID(id int) (*entities.AnggotaTandatangan, error) {
	return u.repo.GetAnggotaByID(id)
}
func (u *penandatangananUsecase) UpdateAnggota(a *entities.AnggotaTandatangan) error {
	return u.repo.UpdateAnggota(a)
}
func (u *penandatangananUsecase) DeleteAnggota(id int) error {
	return u.repo.DeleteAnggota(id)
}
func (u *penandatangananUsecase) ListAnggotaByPenandatangananID(penandatangananID string) ([]*entities.AnggotaTandatangan, error) {
	return u.repo.ListAnggotaByPenandatangananID(penandatangananID)
}

// Dokumen
func (u *penandatangananUsecase) UploadDokumen(d *entities.Dokumen) error {
	return u.repo.StoreDokumen(d)
}
func (u *penandatangananUsecase) GetDokumenByID(id string) (*entities.Dokumen, error) {
	return u.repo.GetDokumenByID(id)
}
func (u *penandatangananUsecase) UpdateDokumen(d *entities.Dokumen) error {
	return u.repo.UpdateDokumen(d)
}
func (u *penandatangananUsecase) DeleteDokumen(id string) error {
	return u.repo.DeleteDokumen(id)
}
func (u *penandatangananUsecase) ListDokumenByPenandatangananID(penandatangananID string) ([]*entities.Dokumen, error) {
	return u.repo.ListDokumenByPenandatangananID(penandatangananID)
}

// Log
func (u *penandatangananUsecase) CreateLog(l *entities.LogTandaTangan) error {
	return u.repo.StoreLog(l)
}
func (u *penandatangananUsecase) GetLogByID(id int64) (*entities.LogTandaTangan, error) {
	return u.repo.GetLogByID(id)
}
func (u *penandatangananUsecase) ListLogBySDMID(sdmID string, page, limit int) ([]*entities.LogTandaTangan, error) {
	offset := (page - 1) * limit
	return u.repo.ListLogBySDMID(sdmID, offset, limit)
}
