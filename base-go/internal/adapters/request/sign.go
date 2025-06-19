package request

import (
	"mime/multipart"
)

type SignDocumentRequest struct {
	File              *multipart.FileHeader `form:"file" binding:"required"`
	Nik               string                `form:"nik" binding:"required"`
	Passphrase        string                `form:"passphrase" binding:"required"`
	Tampilan          string                `form:"tampilan" binding:"required"`
	Image             string                `form:"image"`
	ImageTTD          *multipart.FileHeader `form:"imageTTD"`
	LinkQR            string                `form:"linkQR"`
	Halaman           string                `form:"halaman"`
	Page              int                   `form:"page"`
	XAxis             int                   `form:"xAxis"`
	YAxis             int                   `form:"yAxis"`
	Width             int                   `form:"width"`
	Height            int                   `form:"height"`
	TagKoordinat      string                `form:"tag_koordinat"`
	Reason            string                `form:"reason"`
	Location          string                `form:"location"`
	IDPenandatanganan string                `form:"id_penandatanganan"`
}
