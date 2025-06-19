// Placeholder untuk controller Signature
package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"its.ac.id/base-go/internal/entities"
	"its.ac.id/base-go/internal/usecase"
)

type SignatureTableHandler struct {
	Usecase usecase.SignatureTableUsecase
}

func NewSignatureTableHandler(router *gin.Engine, usecase usecase.SignatureTableUsecase) {
	h := &SignatureTableHandler{Usecase: usecase}
	r := router.Group("/signature")
	{
		r.GET("/table", h.GetTable)
	}
}

func (h *SignatureTableHandler) GetTable(c *gin.Context) {
	idSdm := c.Query("id_sdm")
	search := c.DefaultQuery("search", "")
	status, _ := strconv.Atoi(c.DefaultQuery("status", "1"))
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	rows, total, err := h.Usecase.GetSignatureTable(idSdm, search, status, offset, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	resp := entities.SignatureTableResponse{
		Draw:                 page,
		ITotalRecords:        total,
		ITotalDisplayRecords: total,
		AAData:               rows,
	}
	c.JSON(http.StatusOK, resp)
}
