package entities

import "time"

// Penandatanganan merepresentasikan tabel penandatanganan
//
type Penandatanganan struct {
	IDPenandatanganan string     `json:"id_penandatanganan" gorm:"column:id_penandatanganan;type:uniqueidentifier;primaryKey"`
	IDSDM             string     `json:"id_sdm" gorm:"column:id_sdm;type:uniqueidentifier"`
	Judul             string     `json:"judul" gorm:"column:judul;type:varchar(1024)"`
	Type              *int       `json:"type,omitempty" gorm:"column:type"`
	IsFooterExist     *bool      `json:"is_footer_exist,omitempty" gorm:"column:is_footer_exist;type:numeric(1)"`
	Tag               *string    `json:"tag,omitempty" gorm:"column:tag;type:char(1)"`
	IsBulkSign        *bool      `json:"is_bulk_sign,omitempty" gorm:"column:is_bulk_sign;type:numeric(1)"`
	InsertFooterPage  *string    `json:"insert_footer_page,omitempty" gorm:"column:insert_footer_page;type:varchar(50)"`
	CreatedAt         time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt         time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty" gorm:"column:deleted_at"`
	Updater           *string    `json:"updater,omitempty" gorm:"column:updater;type:uniqueidentifier"`
}

func (Penandatanganan) TableName() string {
	return "penandatanganan"
}

// AnggotaTandatangan merepresentasikan tabel anggota_tandatangan
//
type AnggotaTandatangan struct {
	IDAnggotaPenandatangan int        `json:"id_anggota_penandatangan" gorm:"column:id_anggota_penandatangan;primaryKey;autoIncrement"`
	IDSDM                  string     `json:"id_sdm" gorm:"column:id_sdm;type:uniqueidentifier"`
	IDPenandatanganan      string     `json:"id_penandatanganan" gorm:"column:id_penandatanganan;type:uniqueidentifier"`
	IsSign                 *bool      `json:"is_sign,omitempty" gorm:"column:is_sign;type:numeric(1)"`
	Urutan                 *int       `json:"urutan,omitempty" gorm:"column:urutan"`
	Tag                    *string    `json:"tag,omitempty" gorm:"column:tag;type:char(1)"`
	CreatedAt              time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt              time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt              *time.Time `json:"deleted_at,omitempty" gorm:"column:deleted_at"`
	Updater                *string    `json:"updater,omitempty" gorm:"column:updater;type:uniqueidentifier"`
}

func (AnggotaTandatangan) TableName() string {
	return "anggota_tandatangan"
}

// Dokumen merepresentasikan tabel dokumen
//
type Dokumen struct {
	IDDokumen         string     `json:"id_dokumen" gorm:"column:id_dokumen;type:uniqueidentifier;primaryKey"`
	IDPenandatanganan *string    `json:"id_penandatanganan,omitempty" gorm:"column:id_penandatanganan;type:uniqueidentifier"`
	IDDokumenBSRE     *string    `json:"id_dokumen_bsre,omitempty" gorm:"column:id_dokumen_bsre;type:varchar(255)"`
	NamaDokumen       *string    `json:"nama_dokumen,omitempty" gorm:"column:nama_dokumen;type:varchar(255)"`
	NamaFile          *string    `json:"nama_file,omitempty" gorm:"column:nama_file;type:varchar(255)"` // Nama file di storage
	Mime              *string    `json:"mime,omitempty" gorm:"column:mime;type:varchar(150)"`           // Tipe file (MIME)
	Ekstensi          *string    `json:"ekstensi,omitempty" gorm:"column:ekstensi;type:varchar(20)"`    // Ekstensi file
	Keterangan        *string    `json:"keterangan,omitempty" gorm:"column:keterangan;type:varchar(512)"`
	Ukuran            *int64     `json:"ukuran,omitempty" gorm:"column:ukuran;type:bigint"` // Ukuran file (byte)
	FileID            *string    `json:"file_id,omitempty" gorm:"column:file_id;type:varchar(512)"`
	PublicURI         *string    `json:"public_uri,omitempty" gorm:"column:public_uri;type:varchar(512)"` // Path/URL file di storage
	BucketName        *string    `json:"bucket_name,omitempty" gorm:"column:bucket_name;type:varchar(100)"`
	ProjectID         *string    `json:"project_id,omitempty" gorm:"column:project_id;type:varchar(100)"`
	CreatedAt         time.Time  `json:"created_at" gorm:"column:created_at"`
	UpdatedAt         time.Time  `json:"updated_at" gorm:"column:updated_at"`
	DeletedAt         *time.Time `json:"deleted_at,omitempty" gorm:"column:deleted_at"`
	Updater           *string    `json:"updater,omitempty" gorm:"column:updater;type:uniqueidentifier"`
}

func (Dokumen) TableName() string {
	return "dokumen"
}

// LogTandaTangan merepresentasikan tabel log_tanda_tangan
//
type LogTandaTangan struct {
	ID         int64     `json:"id" gorm:"column:id;primaryKey;autoIncrement"`
	IDSDM      string    `json:"id_sdm" gorm:"column:id_sdm;type:uniqueidentifier"`
	Method     string    `json:"method" gorm:"column:method;type:varchar(10)"`
	URL        string    `json:"url" gorm:"column:url;type:varchar(255)"`
	ClientInfo string    `json:"client_info" gorm:"column:client_info;type:varchar(255)"`
	IpAddress  string    `json:"ip_address" gorm:"column:ip_address;type:varchar(50)"`
	System     string    `json:"system" gorm:"column:system;type:varchar(50)"`
	NamaFile   string    `json:"nama_file" gorm:"column:nama_file;type:varchar(255)"`
	Response   string    `json:"response" gorm:"column:response;type:text"`
	CreatedAt  time.Time `json:"created_at" gorm:"column:created_at"`
}

func (LogTandaTangan) TableName() string {
	return "log_tanda_tangan"
}

// Interface repository dan usecase

type PenandatangananRepository interface {
	StorePenandatanganan(p *Penandatanganan) error
	GetPenandatangananByID(id string) (*Penandatanganan, error)
	UpdatePenandatanganan(p *Penandatanganan) error
	DeletePenandatanganan(id string) error
	ListPenandatanganan(offset, limit int) ([]*Penandatanganan, error)

	// Anggota
	StoreAnggota(a *AnggotaTandatangan) error
	GetAnggotaByID(id int) (*AnggotaTandatangan, error)
	UpdateAnggota(a *AnggotaTandatangan) error
	DeleteAnggota(id int) error
	ListAnggotaByPenandatangananID(penandatangananID string) ([]*AnggotaTandatangan, error)

	// Dokumen
	StoreDokumen(d *Dokumen) error
	GetDokumenByID(id string) (*Dokumen, error)
	UpdateDokumen(d *Dokumen) error
	DeleteDokumen(id string) error
	ListDokumenByPenandatangananID(penandatangananID string) ([]*Dokumen, error)

	// Log
	StoreLog(l *LogTandaTangan) error
	GetLogByID(id int64) (*LogTandaTangan, error)
	ListLogBySDMID(sdmID string, offset, limit int) ([]*LogTandaTangan, error)
}

type PenandatangananUsecase interface {
	CreatePenandatanganan(p *Penandatanganan) error
	GetPenandatangananByID(id string) (*Penandatanganan, error)
	UpdatePenandatanganan(p *Penandatanganan) error
	DeletePenandatanganan(id string) error
	ListPenandatanganan(page, limit int) ([]*Penandatanganan, error)

	// Anggota
	AddAnggota(a *AnggotaTandatangan) error
	GetAnggotaByID(id int) (*AnggotaTandatangan, error)
	UpdateAnggota(a *AnggotaTandatangan) error
	DeleteAnggota(id int) error
	ListAnggotaByPenandatangananID(penandatangananID string) ([]*AnggotaTandatangan, error)

	// Dokumen
	UploadDokumen(d *Dokumen) error
	GetDokumenByID(id string) (*Dokumen, error)
	UpdateDokumen(d *Dokumen) error
	DeleteDokumen(id string) error
	ListDokumenByPenandatangananID(penandatangananID string) ([]*Dokumen, error)

	// Log
	CreateLog(l *LogTandaTangan) error
	GetLogByID(id int64) (*LogTandaTangan, error)
	ListLogBySDMID(sdmID string, page, limit int) ([]*LogTandaTangan, error)
}
