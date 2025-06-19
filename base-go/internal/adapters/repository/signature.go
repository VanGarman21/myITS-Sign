// Placeholder untuk repository Signature
package repository

import (
	"gorm.io/gorm"
	"its.ac.id/base-go/internal/entities"
)

type SqlServerSignatureRepository struct {
	db *gorm.DB
}

func NewSqlServerSignatureRepository(db *gorm.DB) *SqlServerSignatureRepository {
	return &SqlServerSignatureRepository{db: db}
}

func (r *SqlServerSignatureRepository) GetSignatureTable(idSdm string, search string, status int, offset int, limit int) ([]entities.SignatureTableRow, int, error) {
	var rows []entities.SignatureTableRow
	var total int64

	// Query tanpa d.is_sign
	query := r.db.Table("penandatanganan as p").
		Select(`p.judul, p.created_at as signature_date, CONVERT(VARCHAR(36), p.id_penandatanganan) as id_penandatanganan, p.type, p.is_bulk_sign, MAX(at.is_sign) as anggota_is_sign, CASE WHEN p.id_sdm = ? THEN 1 ELSE 0 END as can_delete`, idSdm).
		Joins("LEFT JOIN anggota_tandatangan at ON at.id_penandatanganan = p.id_penandatanganan").
		Where("p.deleted_at IS NULL")

	if status == 1 {
		query = query.Where("at.id_sdm = ?", idSdm)
	} else if status == 2 {
		query = query.Where("at.id_sdm = ? AND at.is_sign = 1", idSdm)
	} else if status == 3 {
		query = query.Where("at.id_sdm = ? AND (at.is_sign = 0 OR at.is_sign IS NULL)", idSdm)
	} else if status == 4 {
		query = query.Where("p.id_sdm = ?", idSdm)
	}

	if search != "" {
		query = query.Where("p.judul LIKE ?", "%"+search+"%")
	}

	query = query.Group("p.judul, p.created_at, p.id_penandatanganan, p.type, p.is_bulk_sign, p.id_sdm").
		Order("p.created_at DESC")

	// Hitung total
	totalQuery := *query
	totalQuery.Count(&total)

	// Pagination
	query = query.Offset(offset).Limit(limit)

	type resultRow struct {
		Judul             string
		SignatureDate     string
		IDPenandatanganan string
		Type              int
		IsBulkSign        *bool
		AnggotaIsSign     *bool
		CanDelete         bool
	}
	var results []resultRow
	if err := query.Scan(&results).Error; err != nil {
		return nil, 0, err
	}

	for _, r := range results {
		status := "perlu_ttd"
		if r.AnggotaIsSign != nil && *r.AnggotaIsSign {
			status = "sudah_ttd"
		}
		rows = append(rows, entities.SignatureTableRow{
			Judul:             r.Judul,
			SignatureType:     getSignatureTypeString(r.Type),
			SignatureDate:     r.SignatureDate,
			SignatureStatus:   status,
			IsBulkSign:        r.IsBulkSign,
			IDPenandatanganan: r.IDPenandatanganan,
			CanDelete:         r.CanDelete,
		})
	}

	return rows, int(total), nil
}

func getSignatureTypeString(t int) string {
	switch t {
	case 1:
		return "Invisible"
	case 2:
		return "SpecimenWithTag"
	default:
		return "Unknown"
	}
}
