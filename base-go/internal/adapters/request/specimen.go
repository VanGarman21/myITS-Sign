package request

// CreateSpesimenRequest adalah struct untuk request pembuatan spesimen
type CreateSpesimenRequest struct {
	IDSDM   string `json:"id_sdm" binding:"required"`
	Data    string `json:"data" binding:"required"`
	Updater string `json:"updater"`
}

// UpdateSpesimenRequest adalah struct untuk request pembaruan spesimen
type UpdateSpesimenRequest struct {
	Data    string `json:"data" binding:"required"`
	Updater string `json:"updater" binding:"required"`
}
