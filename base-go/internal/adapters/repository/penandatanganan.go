// Placeholder untuk repository Penandatanganan
package repository

import (
	"gorm.io/gorm"
	"its.ac.id/base-go/internal/entities"
)

type sqlServerPenandatangananRepository struct {
	db *gorm.DB
}

func NewSqlServerPenandatangananRepository(db *gorm.DB) entities.PenandatangananRepository {
	return &sqlServerPenandatangananRepository{db: db}
}

// Penandatanganan CRUD
func (r *sqlServerPenandatangananRepository) StorePenandatanganan(p *entities.Penandatanganan) error {
	return r.db.Create(p).Error
}
func (r *sqlServerPenandatangananRepository) GetPenandatangananByID(id string) (*entities.Penandatanganan, error) {
	var p entities.Penandatanganan
	err := r.db.Raw(`SELECT CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, CONVERT(VARCHAR(36), id_sdm) as id_sdm, judul, type, is_footer_exist, tag, is_bulk_sign, insert_footer_page, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[penandatanganan] WHERE id_penandatanganan = CONVERT(uniqueidentifier, ?)`, id).Scan(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}
func (r *sqlServerPenandatangananRepository) UpdatePenandatanganan(p *entities.Penandatanganan) error {
	return r.db.Save(p).Error
}
func (r *sqlServerPenandatangananRepository) DeletePenandatanganan(id string) error {
	return r.db.Where("id_penandatanganan = ?", id).Delete(&entities.Penandatanganan{}).Error
}
func (r *sqlServerPenandatangananRepository) ListPenandatanganan(offset, limit int) ([]*entities.Penandatanganan, error) {
	var list []*entities.Penandatanganan
	err := r.db.Raw(`SELECT CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, CONVERT(VARCHAR(36), id_sdm) as id_sdm, judul, type, is_footer_exist, tag, is_bulk_sign, insert_footer_page, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[penandatanganan] ORDER BY created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`, offset, limit).Scan(&list).Error
	if err != nil {
		return nil, err
	}
	return list, nil
}

// Anggota CRUD
func (r *sqlServerPenandatangananRepository) StoreAnggota(a *entities.AnggotaTandatangan) error {
	return r.db.Exec(`INSERT INTO [dbo].[anggota_tandatangan] (id_sdm, id_penandatanganan, is_sign, urutan, tag, created_at, updated_at, updater) VALUES (CONVERT(uniqueidentifier, ?), CONVERT(uniqueidentifier, ?), ?, ?, ?, ?, ?, CONVERT(uniqueidentifier, ?))`,
		a.IDSDM,
		a.IDPenandatanganan,
		a.IsSign,
		a.Urutan,
		a.Tag,
		a.CreatedAt,
		a.UpdatedAt,
		a.Updater,
	).Error
}
func (r *sqlServerPenandatangananRepository) GetAnggotaByID(id int) (*entities.AnggotaTandatangan, error) {
	var a entities.AnggotaTandatangan
	err := r.db.Raw(`SELECT id_anggota_penandatangan, CONVERT(VARCHAR(36), id_sdm) as id_sdm, CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, is_sign, urutan, tag, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[anggota_tandatangan] WHERE id_anggota_penandatangan = ?`, id).Scan(&a).Error
	if err != nil {
		return nil, err
	}
	return &a, nil
}
func (r *sqlServerPenandatangananRepository) UpdateAnggota(a *entities.AnggotaTandatangan) error {
	return r.db.Save(a).Error
}
func (r *sqlServerPenandatangananRepository) DeleteAnggota(id int) error {
	return r.db.Where("id_anggota_penandatangan = ?", id).Delete(&entities.AnggotaTandatangan{}).Error
}
func (r *sqlServerPenandatangananRepository) ListAnggotaByPenandatangananID(penandatangananID string) ([]*entities.AnggotaTandatangan, error) {
	var anggota []*entities.AnggotaTandatangan
	err := r.db.Raw(`SELECT id_anggota_penandatangan, CONVERT(VARCHAR(36), id_sdm) as id_sdm, CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, is_sign, urutan, tag, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[anggota_tandatangan] WHERE id_penandatanganan = CONVERT(uniqueidentifier, ?)`, penandatangananID).Scan(&anggota).Error
	if err != nil {
		return nil, err
	}
	return anggota, nil
}
func (r *sqlServerPenandatangananRepository) DeleteAllAnggotaByPenandatangananID(penandatangananID string) error {
	return r.db.Where("id_penandatanganan = ?", penandatangananID).Delete(&entities.AnggotaTandatangan{}).Error
}

// Dokumen CRUD
func (r *sqlServerPenandatangananRepository) StoreDokumen(d *entities.Dokumen) error {
	return r.db.Create(d).Error
}
func (r *sqlServerPenandatangananRepository) GetDokumenByID(id string) (*entities.Dokumen, error) {
	var d entities.Dokumen
	err := r.db.Raw(`SELECT CONVERT(VARCHAR(36), id_dokumen) as id_dokumen, CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, id_dokumen_bsre, nama_dokumen, nama_file, mime, ekstensi, keterangan, ukuran, file_id, public_uri, bucket_name, project_id, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[dokumen] WHERE id_dokumen = CONVERT(uniqueidentifier, ?)`, id).Scan(&d).Error
	if err != nil {
		return nil, err
	}
	return &d, nil
}
func (r *sqlServerPenandatangananRepository) UpdateDokumen(d *entities.Dokumen) error {
	return r.db.Save(d).Error
}
func (r *sqlServerPenandatangananRepository) DeleteDokumen(id string) error {
	return r.db.Where("id_dokumen = ?", id).Delete(&entities.Dokumen{}).Error
}
func (r *sqlServerPenandatangananRepository) ListDokumenByPenandatangananID(penandatangananID string) ([]*entities.Dokumen, error) {
	var dokumen []*entities.Dokumen
	err := r.db.Raw(`SELECT CONVERT(VARCHAR(36), id_dokumen) as id_dokumen, CONVERT(VARCHAR(36), id_penandatanganan) as id_penandatanganan, id_dokumen_bsre, nama_dokumen, nama_file, mime, ekstensi, keterangan, ukuran, file_id, public_uri, bucket_name, project_id, created_at, updated_at, deleted_at, CONVERT(VARCHAR(36), updater) as updater FROM [dbo].[dokumen] WHERE id_penandatanganan = CONVERT(uniqueidentifier, ?)`, penandatangananID).Scan(&dokumen).Error
	if err != nil {
		return nil, err
	}
	return dokumen, nil
}
func (r *sqlServerPenandatangananRepository) DeleteAllDokumenByPenandatangananID(penandatangananID string) error {
	return r.db.Where("id_penandatanganan = ?", penandatangananID).Delete(&entities.Dokumen{}).Error
}

// Log CRUD
func (r *sqlServerPenandatangananRepository) StoreLog(l *entities.LogTandaTangan) error {
	return r.db.Create(l).Error
}
func (r *sqlServerPenandatangananRepository) GetLogByID(id int64) (*entities.LogTandaTangan, error) {
	var l entities.LogTandaTangan
	err := r.db.Where("id = ?", id).First(&l).Error
	if err != nil {
		return nil, err
	}
	return &l, nil
}
func (r *sqlServerPenandatangananRepository) ListLogBySDMID(sdmID string, offset, limit int) ([]*entities.LogTandaTangan, error) {
	var logs []*entities.LogTandaTangan
	err := r.db.Where("id_sdm = ?", sdmID).Offset(offset).Limit(limit).Find(&logs).Error
	if err != nil {
		return nil, err
	}
	return logs, nil
}
