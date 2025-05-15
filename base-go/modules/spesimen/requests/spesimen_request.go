package requests

import (
	"github.com/google/uuid"
)

// CreateSpesimenRequest adalah struct untuk request pembuatan spesimen
type CreateSpesimenRequest struct {
	IDSDM   uuid.UUID `json:"id_sdm" binding:"required"`
	Data    string    `json:"data" binding:"required"`
	Updater uuid.UUID `json:"updater"`
}

// UpdateSpesimenRequest adalah struct untuk request pembaruan spesimen
type UpdateSpesimenRequest struct {
	Data    string    `json:"data" binding:"required"`
	Updater uuid.UUID `json:"updater" binding:"required"`
}
