package usecase

import (
	"fmt"
	"mime/multipart"

	"its.ac.id/base-go/infrastructure/external"
	"its.ac.id/base-go/internal/adapters/request"
)

type SignDocumentUsecase interface {
	Sign(req *request.SignDocumentRequest) (map[string]interface{}, error)
	RelaySignDocument(file multipart.File, filename string, req *request.SignDocumentRequest, imageTTD multipart.File, imageTTDFilename string) (*external.RelayResponse, error)
	DownloadSignedPdf(idDokumen string) (*external.RelayResponse, error)
}

type signDocumentUsecase struct {
	bsre *external.BsreClient
}

func NewSignDocumentUsecase(bsre *external.BsreClient) SignDocumentUsecase {
	return &signDocumentUsecase{bsre: bsre}
}

func (u *signDocumentUsecase) Sign(req *request.SignDocumentRequest) (map[string]interface{}, error) {
	file, err := req.File.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()
	imageTTD, err := req.ImageTTD.Open()
	if err != nil {
		return nil, err
	}
	defer imageTTD.Close()
	resultMap, err := u.bsre.SignDocument(file, req.File.Filename, req, imageTTD, req.ImageTTD.Filename)
	if err != nil {
		return nil, err
	}
	if errMsg, ok := resultMap["error"]; ok {
		return nil, fmt.Errorf("%v", errMsg)
	}
	return resultMap, nil
}

func (u *signDocumentUsecase) RelaySignDocument(file multipart.File, filename string, req *request.SignDocumentRequest, imageTTD multipart.File, imageTTDFilename string) (*external.RelayResponse, error) {
	return u.bsre.RelaySignDocument(file, filename, req, imageTTD, imageTTDFilename)
}

func (u *signDocumentUsecase) DownloadSignedPdf(idDokumen string) (*external.RelayResponse, error) {
	return u.bsre.DownloadSignedPdf(idDokumen)
}
