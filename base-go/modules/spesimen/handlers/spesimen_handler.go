package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"its.ac.id/base-go/modules/spesimen/models"
	"its.ac.id/base-go/modules/spesimen/requests"
	"its.ac.id/base-go/modules/spesimen/services"
)

// SpesimenHandler adalah struct yang menangani request HTTP untuk spesimen
type SpesimenHandler struct {
	spesimenService services.SpesimenService
}

// NewSpesimenHandler membuat instance baru dari SpesimenHandler
func NewSpesimenHandler(spesimenService services.SpesimenService) *SpesimenHandler {
	return &SpesimenHandler{
		spesimenService: spesimenService,
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
	var request requests.CreateSpesimenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Konversi request ke model untuk service
	createData := models.SpesimenTandaTanganCreate{
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
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	result, err := h.spesimenService.GetByID(id)
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
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID SDM tidak valid"})
		return
	}

	result, err := h.spesimenService.GetBySDMID(id)
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
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var request requests.UpdateSpesimenRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updateData := models.SpesimenTandaTanganUpdate{
		Data:    request.Data,
		Updater: request.Updater,
	}

	result, err := h.spesimenService.Update(id, updateData)
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
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	if err := h.spesimenService.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Spesimen berhasil dihapus"})
}
