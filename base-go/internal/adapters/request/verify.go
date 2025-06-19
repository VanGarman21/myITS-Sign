package request

import (
	"mime/multipart"
)

type VerifyDocumentRequest struct {
	Document *multipart.FileHeader `form:"document" binding:"required"`
}
