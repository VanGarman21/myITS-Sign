package usecase

import (
	"mime/multipart"

	"fmt"

	"its.ac.id/base-go/infrastructure/external"
)

type VerifyDocumentUsecase interface {
	Verify(document *multipart.FileHeader) (map[string]interface{}, error)
}

type verifyDocumentUsecase struct {
	bsre *external.BsreClient
}

func NewVerifyDocumentUsecase(bsre *external.BsreClient) VerifyDocumentUsecase {
	return &verifyDocumentUsecase{bsre: bsre}
}

func toString(val interface{}) string {
	switch v := val.(type) {
	case string:
		return v
	case float64:
		return fmt.Sprintf("%.0f", v)
	case nil:
		return ""
	default:
		return fmt.Sprintf("%v", v)
	}
}

func (u *verifyDocumentUsecase) Verify(document *multipart.FileHeader) (map[string]interface{}, error) {
	file, err := document.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	resultMap, err := u.bsre.VerifyDocument(file, document.Filename)
	if err != nil {
		return nil, err
	}

	if errMsg, ok := resultMap["error"]; ok {
		return nil, fmt.Errorf("%v", errMsg)
	}

	return resultMap, nil
}
