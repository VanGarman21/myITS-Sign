// Placeholder untuk controller SDM
package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"its.ac.id/base-go/internal/entities"
	"its.ac.id/base-go/internal/usecase"
)

type SDMHandler struct {
	service usecase.SDMService
	DB      *gorm.DB
}

// Fungsi lama untuk kebutuhan module sdm
func NewSDMHandler(service usecase.SDMService) *SDMHandler {
	return &SDMHandler{service: service}
}

// Fungsi baru khusus endpoint by-sso-id
func RegisterSDMBySSOHandler(router *gin.Engine, db *gorm.DB, service usecase.SDMService) {
	h := &SDMHandler{DB: db, service: service}
	r := router.Group("/sdm")
	{
		r.GET("/by-sso-id/:sso_user_id", h.GetBySSOUserID)
		r.GET("/search", h.SearchByNama)
	}
}

// GetAll godoc
// @Summary List semua SDM
// @Tags SDM
// @Produce json
// @Success 200 {array} entities.SDM
// @Router /sdm [get]
func (h *SDMHandler) GetAll(c *gin.Context) {
	sdms, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sdms)
}

// GetByNIK godoc
// @Summary Get SDM by NIK
// @Tags SDM
// @Produce json
// @Param nik path string true "NIK"
// @Success 200 {object} entities.SDM
// @Failure 404 {object} map[string]string
// @Router /sdm/{nik} [get]
func (h *SDMHandler) GetByNIK(c *gin.Context) {
	nik := c.Param("nik")
	sdm, err := h.service.GetByNIK(nik)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if sdm == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SDM tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, sdm)
}

// Create godoc
// @Summary Tambah SDM
// @Tags SDM
// @Accept json
// @Produce json
// @Param sdm body entities.SDM true "Data SDM"
// @Success 201 {object} entities.SDM
// @Router /sdm [post]
func (h *SDMHandler) Create(c *gin.Context) {
	var sdm entities.SDM
	if err := c.ShouldBindJSON(&sdm); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created, err := h.service.Create(&sdm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, created)
}

// Update godoc
// @Summary Update SDM by NIK
// @Tags SDM
// @Accept json
// @Produce json
// @Param nik path string true "NIK"
// @Param sdm body entities.SDM true "Data SDM"
// @Success 200 {object} entities.SDM
// @Router /sdm/{nik} [put]
func (h *SDMHandler) Update(c *gin.Context) {
	nik := c.Param("nik")
	var sdm entities.SDM
	if err := c.ShouldBindJSON(&sdm); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updated, err := h.service.Update(nik, &sdm)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

// Delete godoc
// @Summary Hapus SDM by NIK
// @Tags SDM
// @Produce json
// @Param nik path string true "NIK"
// @Success 200 {object} map[string]string
// @Router /sdm/{nik} [delete]
func (h *SDMHandler) Delete(c *gin.Context) {
	nik := c.Param("nik")
	err := h.service.Delete(nik)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "SDM berhasil dihapus"})
}

// GetBySSOUserID godoc
// @Summary Get SDM by SSO User ID
// @Tags SDM
// @Produce json
// @Param sso_user_id path string true "SSO User ID"
// @Success 200 {object} entities.SDM
// @Failure 404 {object} map[string]string
// @Router /sdm/sso/{sso_user_id} [get]
func (h *SDMHandler) GetBySSOUserID(c *gin.Context) {
	ssoUserID := c.Param("sso_user_id")
	fmt.Println("DEBUG sso_user_id dari path:", ssoUserID)
	sdm, err := h.service.GetBySSOUserID(ssoUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if sdm == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SDM tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, sdm)
}

// GetByIDSDM godoc
// @Summary Get SDM by ID SDM
// @Tags SDM
// @Produce json
// @Param id_sdm path string true "ID SDM"
// @Success 200 {object} entities.SDM
// @Failure 404 {object} map[string]string
// @Router /sdm/id/{id_sdm} [get]
func (h *SDMHandler) GetByIDSDM(c *gin.Context) {
	idSDM := c.Param("id_sdm")
	sdm, err := h.service.GetByIDSDM(idSDM)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if sdm == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SDM tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, sdm)
}

// SearchByNama godoc
// @Summary Search SDM by nama
// @Tags SDM
// @Produce json
// @Param nama query string true "Nama SDM"
// @Success 200 {array} entities.SDM
// @Router /sdm/search [get]
func (h *SDMHandler) SearchByNama(c *gin.Context) {
	nama := c.Query("nama")
	sdms, err := h.service.SearchByNama(nama)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, sdms)
}
