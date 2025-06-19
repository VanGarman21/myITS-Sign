package entities

type SignatureTableRow struct {
	Judul             string `json:"judul"`
	SignatureType     string `json:"signature_type"`
	SignatureDate     string `json:"signature_date"`
	SignatureStatus   string `json:"signature_status"`
	IsBulkSign        *bool  `json:"is_bulk_sign"`
	IDPenandatanganan string `json:"id_penandatanganan"`
	CanDelete         bool   `json:"can_delete"`
}

type SignatureTableResponse struct {
	Draw                 int                 `json:"draw"`
	ITotalRecords        int                 `json:"iTotalRecords"`
	ITotalDisplayRecords int                 `json:"iTotalDisplayRecords"`
	AAData               []SignatureTableRow `json:"aaData"`
}
