// Placeholder untuk controller Spesimen
package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"its.ac.id/base-go/internal/adapters/request"
	"its.ac.id/base-go/internal/entities"
	sdmServices "its.ac.id/base-go/internal/usecase"
	spesimenServices "its.ac.id/base-go/internal/usecase"
)

// SpesimenHandler adalah struct yang menangani request HTTP untuk spesimen
type SpesimenHandler struct {
	spesimenService spesimenServices.SpesimenService
	sdmService      sdmServices.SDMService
}

// NewSpesimenHandler membuat instance baru dari SpesimenHandler
func NewSpesimenHandler(spesimenService spesimenServices.SpesimenService, sdmService sdmServices.SDMService) *SpesimenHandler {
	return &SpesimenHandler{
		spesimenService: spesimenService,
		sdmService:      sdmService,
	}
}

// Create menangani request untuk membuat spesimen tanda tangan baru
// @Summary Membuat spesimen tanda tangan baru
// @Description Membuat spesimen tanda tangan baru untuk SDM
// @Tags Spesimen
// @Accept json
// @Produce json
// @Param request body requests.CreateSpesimenRequest true "Data spesimen"
// @Success 201 {object} models.SpesimenTandaTangan
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /spesimen [post]
func (h *SpesimenHandler) Create(c *gin.Context) {
	var request request.CreateSpesimenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Untuk testing: ambil id_sdm dan updater langsung dari body, tidak perlu login/session
	if request.IDSDM == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id_sdm wajib diisi"})
		return
	}

	createData := entities.SpesimenTandaTanganCreate{
		IDSDM:   request.IDSDM,
		Data:    request.Data,
		Updater: request.Updater,
	}

	result, err := h.spesimenService.Create(createData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

// GetByID menangani request untuk mendapatkan spesimen tanda tangan berdasarkan ID
// @Summary Mendapatkan spesimen tanda tangan berdasarkan ID
// @Description Mendapatkan spesimen tanda tangan berdasarkan ID
// @Tags Spesimen
// @Accept json
// @Produce json
// @Param id path string true "ID Spesimen"
// @Success 200 {object} models.SpesimenTandaTangan
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /spesimen/{id} [get]
func (h *SpesimenHandler) GetByID(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak boleh kosong"})
		return
	}
	result, err := h.spesimenService.GetByID(idStr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Spesimen tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// GetBySDMID menangani request untuk mendapatkan spesimen tanda tangan berdasarkan ID SDM
// @Summary Mendapatkan spesimen tanda tangan berdasarkan ID SDM
// @Description Mendapatkan spesimen tanda tangan berdasarkan ID SDM
// @Tags Spesimen
// @Accept json
// @Produce json
// @Param idSdm path string true "ID SDM"
// @Success 200 {object} models.SpesimenTandaTangan
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /spesimen/sdm/{idSdm} [get]
func (h *SpesimenHandler) GetBySDMID(c *gin.Context) {
	idStr := c.Param("idSdm")
	fmt.Println("DEBUG id_sdm dari path:", idStr)
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID SDM tidak boleh kosong"})
		return
	}
	sdm, err := h.sdmService.GetByIDSDM(idStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal cek SDM"})
		return
	}
	if sdm == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "SDM tidak ditemukan"})
		return
	}
	result, err := h.spesimenService.GetBySDMID(idStr)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Spesimen tidak ditemukan untuk SDM tersebut"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// Update menangani request untuk memperbarui spesimen tanda tangan
// @Summary Memperbarui spesimen tanda tangan
// @Description Memperbarui spesimen tanda tangan berdasarkan ID
// @Tags Spesimen
// @Accept json
// @Produce json
// @Param id path string true "ID Spesimen"
// @Param request body requests.UpdateSpesimenRequest true "Data update spesimen"
// @Success 200 {object} models.SpesimenTandaTangan
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /spesimen/{id} [put]
func (h *SpesimenHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak boleh kosong"})
		return
	}
	var request request.UpdateSpesimenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updateData := entities.SpesimenTandaTanganUpdate{
		Data:    request.Data,
		Updater: request.Updater,
	}
	result, err := h.spesimenService.Update(idStr, updateData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

// Delete menangani request untuk menghapus spesimen tanda tangan
// @Summary Menghapus spesimen tanda tangan
// @Description Menghapus spesimen tanda tangan berdasarkan ID
// @Tags Spesimen
// @Accept json
// @Produce json
// @Param id path string true "ID Spesimen"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /spesimen/{id} [delete]
func (h *SpesimenHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak boleh kosong"})
		return
	}
	if err := h.spesimenService.Delete(idStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Spesimen berhasil dihapus"})
}
