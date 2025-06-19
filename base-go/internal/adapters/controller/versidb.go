// Placeholder untuk controller VersiDB
package controller

import (
	"net/http"
	"strconv"

	"its.ac.id/base-go/internal/entities"

	"github.com/gin-gonic/gin"
)

type VersiDBHandler struct {
	VersiDBUsecase entities.VersiDBUsecase
}

func NewVersiDBHandler(router *gin.Engine, usecase entities.VersiDBUsecase) {
	h := &VersiDBHandler{VersiDBUsecase: usecase}
	r := router.Group("/api/versidb")
	{
		r.GET("", h.List)
		r.GET(":id", h.GetByID)
		r.POST("", h.Create)
		r.PUT(":id", h.Update)
		r.DELETE(":id", h.Delete)
	}
}

func (h *VersiDBHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	versis, err := h.VersiDBUsecase.ListVersiDB(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, versis)
}

func (h *VersiDBHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	versi, err := h.VersiDBUsecase.GetVersiDBByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "VersiDB not found"})
		return
	}
	c.JSON(http.StatusOK, versi)
}

func (h *VersiDBHandler) Create(c *gin.Context) {
	var versi entities.VersiDB
	if err := c.ShouldBindJSON(&versi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.VersiDBUsecase.CreateVersiDB(&versi); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, versi)
}

func (h *VersiDBHandler) Update(c *gin.Context) {
	var versi entities.VersiDB
	if err := c.ShouldBindJSON(&versi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	versi.IDVersi = c.Param("id")
	if err := h.VersiDBUsecase.UpdateVersiDB(&versi); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, versi)
}

func (h *VersiDBHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.VersiDBUsecase.DeleteVersiDB(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "VersiDB deleted successfully"})
}
