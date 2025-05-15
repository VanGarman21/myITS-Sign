package requests

type CreatePenandatangananRequest struct {
	IDSdm         string `json:"id_sdm" validate:"required,uuid4"`
	Judul         string `json:"judul" validate:"required,max=1024"`
	Type          int    `json:"type" validate:"required"`
	IsFooterExist *bool  `json:"is_footer_exist"`
	Tag           string `json:"tag" validate:"max=1"`
	IsBulkSign    *bool  `json:"is_bulk_sign"`
}

type UpdatePenandatangananRequest struct {
	Judul         string `json:"judul" validate:"max=1024"`
	Type          int    `json:"type"`
	IsFooterExist *bool  `json:"is_footer_exist"`
	Tag           string `json:"tag" validate:"max=1"`
	IsBulkSign    *bool  `json:"is_bulk_sign"`
}
