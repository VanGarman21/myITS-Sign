package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"its.ac.id/base-go/internal/adapters/request"
	"its.ac.id/base-go/internal/usecase"
)

type VerifyDocumentHandler struct {
	Usecase usecase.VerifyDocumentUsecase
}

func NewVerifyDocumentHandler(r *gin.Engine, usecase usecase.VerifyDocumentUsecase) {
	h := &VerifyDocumentHandler{Usecase: usecase}
	r.POST("/api/verify-document", h.Verify)
}

func (h *VerifyDocumentHandler) Verify(c *gin.Context) {
	var req request.VerifyDocumentRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Dokumen wajib diupload"})
		return
	}
	result, err := h.Usecase.Verify(req.Document)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "data": nil, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": result, "message": "Success getting response from BSRE"})
}
