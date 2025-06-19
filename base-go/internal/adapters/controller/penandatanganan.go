// Placeholder untuk controller Penandatanganan
package controller

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"log"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/entities"
	"its.ac.id/base-go/internal/utils"
)

type PenandatangananHandler struct {
	PenandatangananUsecase entities.PenandatangananUsecase
	SDMRepo                repository.SDMRepository
}

type CreatePenandatangananRequest struct {
	Judul            string                  `form:"judul" json:"judul"`
	Type             int                     `form:"type" json:"type"`
	IsFooterExist    *bool                   `form:"is_footer_exist" json:"is_footer_exist"`
	Tag              *string                 `form:"tag" json:"tag"`
	IsBulkSign       *bool                   `form:"is_bulk_sign" json:"is_bulk_sign"`
	InsertFooterPage *string                 `form:"insert_footer_page" json:"insert_footer_page"`
	Updater          *string                 `form:"updater" json:"updater"`
	IDSDM            string                  `form:"id_sdm" json:"id_sdm"`
	SignatureType    string                  `form:"signature_type" json:"signature_type"`
	FooterBahasa     string                  `form:"footer_bahasa" json:"footer_bahasa"`
	FooterColor      string                  `form:"footer_color" json:"footer_color"`
	Dokumen          []*multipart.FileHeader `form:"dokumen" binding:"required"`
}

func NewPenandatangananHandler(router *gin.Engine, usecase entities.PenandatangananUsecase, sdmRepo repository.SDMRepository) {
	h := &PenandatangananHandler{PenandatangananUsecase: usecase, SDMRepo: sdmRepo}
	r := router.Group("/api/penandatanganan")
	{
		// Penandatanganan
		r.POST("", h.Create)
		r.GET("/:id", h.GetByID)
		r.PUT("/:id", h.Update)
		r.DELETE("/:id", h.Delete)
		r.GET("", h.List)

		// Anggota
		r.POST("/:id/anggota", h.AddAnggota)
		r.GET("/:id/anggota", h.ListAnggota)
		r.GET("/anggota/:anggota_id", h.GetAnggotaByID)
		r.PUT("/anggota/:anggota_id", h.UpdateAnggota)
		r.DELETE("/anggota/:anggota_id", h.DeleteAnggota)

		// Dokumen
		r.POST("/:id/dokumen", h.UploadDokumen)
		r.GET("/:id/dokumen", h.ListDokumen)
		r.GET("/dokumen/:dokumen_id", h.GetDokumenByID)
		r.PUT("/dokumen/:dokumen_id", h.UpdateDokumen)
		r.DELETE("/dokumen/:dokumen_id", h.DeleteDokumen)

		// Log
		r.POST("/:id/log", h.CreateLog)
		r.GET("/:id/log", h.ListLogBySDM)
		r.GET("/log/:log_id", h.GetLogByID)

		// Detail
		r.GET("/:id/detail", h.DetailPenandatanganan)
	}
}

// ===================== Penandatanganan =====================
// CreatePenandatanganan godoc
// @Summary Create penandatanganan
// @Tags Penandatanganan
// @Accept json
// @Produce json
// @Param data body domain.Penandatanganan true "Penandatanganan data"
// @Success 201 {object} domain.Penandatanganan
// @Router /api/penandatanganan [post]
func (h *PenandatangananHandler) Create(c *gin.Context) {
	var req CreatePenandatangananRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Dokumen) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dokumen wajib diupload"})
		return
	}
	idPenandatanganan := uuid.New().String()
	waktuSekarang := time.Now()
	// Simpan ke tabel penandatanganan
	p := entities.Penandatanganan{
		IDPenandatanganan: idPenandatanganan,
		IDSDM:             req.IDSDM,
		Judul:             req.Judul,
		Type:              &req.Type,
		IsFooterExist:     req.IsFooterExist,
		Tag:               req.Tag,
		IsBulkSign:        req.IsBulkSign,
		InsertFooterPage:  req.InsertFooterPage,
		Updater:           req.Updater,
		CreatedAt:         waktuSekarang,
		UpdatedAt:         waktuSekarang,
	}
	if err := h.PenandatangananUsecase.CreatePenandatanganan(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Simpan semua dokumen
	dokumens := []entities.Dokumen{}
	for _, file := range req.Dokumen {
		idDokumen := uuid.New().String()
		fileExt := strings.ToLower(filepath.Ext(file.Filename))
		fileName := idDokumen + fileExt
		storagePath := filepath.Join("storage", "pdf", fileName)
		if err := os.MkdirAll(filepath.Dir(storagePath), 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat folder storage"})
			return
		}
		src, err := file.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuka file dokumen"})
			return
		}
		defer src.Close()
		dst, err := os.Create(storagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file dokumen"})
			return
		}
		if _, err := io.Copy(dst, src); err != nil {
			dst.Close()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menulis file dokumen"})
			return
		}
		dst.Close()
		// Proses footer & QR code
		log.Printf("[PDF] Proses footer+QR: %s", storagePath)
		insertFooterPage := "all"
		if req.InsertFooterPage != nil && *req.InsertFooterPage != "" {
			insertFooterPage = *req.InsertFooterPage
		}
		errFooter := utils.AddFooterAndQrToPdf(storagePath, storagePath, req.FooterBahasa, req.FooterColor == "hitam", insertFooterPage)
		if errFooter != nil {
			log.Printf("[PDF][ERROR] Gagal proses footer+QR: %s, error: %v", storagePath, errFooter)
		} else {
			log.Printf("[PDF] Sukses proses footer+QR: %s", storagePath)
		}
		fileSize := file.Size
		mimeType := file.Header.Get("Content-Type")
		dok := entities.Dokumen{
			IDDokumen:         idDokumen,
			IDPenandatanganan: &idPenandatanganan,
			NamaFile:          &fileName,
			Mime:              &mimeType,
			Ekstensi:          &fileExt,
			Ukuran:            &fileSize,
			PublicURI:         &storagePath,
			CreatedAt:         waktuSekarang,
			UpdatedAt:         waktuSekarang,
			Updater:           &req.IDSDM,
		}
		if err := h.PenandatangananUsecase.UploadDokumen(&dok); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal simpan dokumen: " + err.Error()})
			return
		}
		dokumens = append(dokumens, dok)
	}
	c.JSON(http.StatusCreated, gin.H{
		"penandatanganan":    p,
		"id_penandatanganan": idPenandatanganan,
		"dokumen":            dokumens,
		"signature_type":     req.SignatureType,
		"footer_bahasa":      req.FooterBahasa,
		"footer_color":       req.FooterColor,
		"warning":            "Belum ada anggota penandatanganan, silakan tambahkan minimal satu anggota.",
	})
}

// GetPenandatangananByID godoc
// @Summary Get penandatanganan by ID
// @Tags Penandatanganan
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Success 200 {object} domain.Penandatanganan
// @Router /api/penandatanganan/{id} [get]
func (h *PenandatangananHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	p, err := h.PenandatangananUsecase.GetPenandatangananByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	// Ambil semua dokumen untuk penandatanganan ini
	dokumens, _ := h.PenandatangananUsecase.ListDokumenByPenandatangananID(p.IDPenandatanganan)
	dokumenList := []map[string]interface{}{}
	// Ambil anggota penandatanganan (sekali saja)
	agg, _ := h.PenandatangananUsecase.ListAnggotaByPenandatangananID(p.IDPenandatanganan)
	aggList := []map[string]interface{}{}
	for _, a := range agg {
		namaAnggota := a.IDSDM
		sdm, _ := h.SDMRepo.GetByIDSDM(a.IDSDM)
		if sdm != nil && sdm.Nama != "" {
			namaAnggota = sdm.Nama
		}
		aggList = append(aggList, map[string]interface{}{
			"id_anggota_penandatangan": a.IDAnggotaPenandatangan,
			"id_sdm":                   a.IDSDM,
			"nama":                     namaAnggota,
			"is_sign":                  a.IsSign != nil && *a.IsSign,
			"urutan":                   a.Urutan,
		})
	}
	// Ambil data pembuat (SDM)
	namaPembuat := ""
	sdmPembuat, _ := h.SDMRepo.GetByIDSDM(p.IDSDM)
	if sdmPembuat != nil && sdmPembuat.Nama != "" {
		namaPembuat = sdmPembuat.Nama
	}
	for _, dok := range dokumens {
		isSigned := true
		for _, a := range agg {
			if a.IsSign == nil || !*a.IsSign {
				isSigned = false
				break
			}
		}
		dokumenList = append(dokumenList, map[string]interface{}{
			"id_dokumen": dok.IDDokumen,
			"nama_file":  dok.NamaFile,
			"ukuran":     dok.Ukuran,
			"mime":       dok.Mime,
			"public_uri": dok.PublicURI,
			"is_signed":  isSigned,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"id_penandatanganan": p.IDPenandatanganan,
		"judul":              p.Judul,
		"type":               p.Type,
		"is_footer_exist":    p.IsFooterExist,
		"tag":                p.Tag,
		"is_bulk_sign":       p.IsBulkSign,
		"insert_footer_page": p.InsertFooterPage,
		"created_at":         p.CreatedAt,
		"updated_at":         p.UpdatedAt,
		"updater":            p.Updater,
		"id_sdm":             p.IDSDM,
		"pembuat": map[string]interface{}{
			"id_sdm": p.IDSDM,
			"nama":   namaPembuat,
		},
		"dokumen": dokumenList,
		"anggota": aggList,
	})
}

// UpdatePenandatanganan godoc
// @Summary Update penandatanganan
// @Tags Penandatanganan
// @Accept json
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Param data body domain.Penandatanganan true "Penandatanganan data"
// @Success 200 {object} domain.Penandatanganan
// @Router /api/penandatanganan/{id} [put]
func (h *PenandatangananHandler) Update(c *gin.Context) {
	var p entities.Penandatanganan
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p.IDPenandatanganan = c.Param("id")
	if err := h.PenandatangananUsecase.UpdatePenandatanganan(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

// DeletePenandatanganan godoc
// @Summary Delete penandatanganan
// @Tags Penandatanganan
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Success 200 {object} map[string]string
// @Router /api/penandatanganan/{id} [delete]
func (h *PenandatangananHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.PenandatangananUsecase.DeletePenandatanganan(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// ListPenandatanganan godoc
// @Summary List penandatanganan
// @Tags Penandatanganan
// @Produce json
// @Param page query int false "Page"
// @Param limit query int false "Limit"
// @Success 200 {array} domain.Penandatanganan
// @Router /api/penandatanganan [get]
func (h *PenandatangananHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	list, err := h.PenandatangananUsecase.ListPenandatanganan(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

// ===================== Anggota =====================
// AddAnggota godoc
// @Summary Add anggota penandatanganan
// @Tags AnggotaTandatangan
// @Accept json
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Param data body domain.AnggotaTandatangan true "Anggota data"
// @Success 201 {object} domain.AnggotaTandatangan
// @Router /api/penandatanganan/{id}/anggota [post]
func (h *PenandatangananHandler) AddAnggota(c *gin.Context) {
	var a entities.AnggotaTandatangan
	if err := c.ShouldBindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	a.IDPenandatanganan = c.Param("id")
	a.CreatedAt = time.Now()
	a.UpdatedAt = time.Now()
	fmt.Println("Insert anggota:", a.IDSDM, a.IDPenandatanganan, a.Urutan)
	if err := h.PenandatangananUsecase.AddAnggota(&a); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, a)
}

// ListAnggota godoc
// @Summary List anggota penandatanganan
// @Tags AnggotaTandatangan
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Success 200 {array} domain.AnggotaTandatangan
// @Router /api/penandatanganan/{id}/anggota [get]
func (h *PenandatangananHandler) ListAnggota(c *gin.Context) {
	id := c.Param("id")
	anggota, err := h.PenandatangananUsecase.ListAnggotaByPenandatangananID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, anggota)
}

// GetAnggotaByID godoc
// @Summary Get anggota by ID
// @Tags AnggotaTandatangan
// @Produce json
// @Param anggota_id path int true "ID Anggota"
// @Success 200 {object} domain.AnggotaTandatangan
// @Router /api/penandatanganan/anggota/{anggota_id} [get]
func (h *PenandatangananHandler) GetAnggotaByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("anggota_id"))
	a, err := h.PenandatangananUsecase.GetAnggotaByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	c.JSON(http.StatusOK, a)
}

// UpdateAnggota godoc
// @Summary Update anggota
// @Tags AnggotaTandatangan
// @Accept json
// @Produce json
// @Param anggota_id path int true "ID Anggota"
// @Param data body domain.AnggotaTandatangan true "Anggota data"
// @Success 200 {object} domain.AnggotaTandatangan
// @Router /api/penandatanganan/anggota/{anggota_id} [put]
func (h *PenandatangananHandler) UpdateAnggota(c *gin.Context) {
	var a entities.AnggotaTandatangan
	if err := c.ShouldBindJSON(&a); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id, _ := strconv.Atoi(c.Param("anggota_id"))
	a.IDAnggotaPenandatangan = id
	if err := h.PenandatangananUsecase.UpdateAnggota(&a); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, a)
}

// DeleteAnggota godoc
// @Summary Delete anggota
// @Tags AnggotaTandatangan
// @Produce json
// @Param anggota_id path int true "ID Anggota"
// @Success 200 {object} map[string]string
// @Router /api/penandatanganan/anggota/{anggota_id} [delete]
func (h *PenandatangananHandler) DeleteAnggota(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("anggota_id"))
	if err := h.PenandatangananUsecase.DeleteAnggota(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// ===================== Dokumen =====================
// UploadDokumen godoc
// @Summary Upload dokumen
// @Tags Dokumen
// @Accept json
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Param data body domain.Dokumen true "Dokumen data"
// @Success 201 {object} domain.Dokumen
// @Router /api/penandatanganan/{id}/dokumen [post]
func (h *PenandatangananHandler) UploadDokumen(c *gin.Context) {
	var d entities.Dokumen
	if err := c.ShouldBindJSON(&d); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	id := c.Param("id")
	d.IDPenandatanganan = &id
	if err := h.PenandatangananUsecase.UploadDokumen(&d); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, d)
}

// ListDokumen godoc
// @Summary List dokumen by penandatanganan
// @Tags Dokumen
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Success 200 {array} domain.Dokumen
// @Router /api/penandatanganan/{id}/dokumen [get]
func (h *PenandatangananHandler) ListDokumen(c *gin.Context) {
	id := c.Param("id")
	doks, err := h.PenandatangananUsecase.ListDokumenByPenandatangananID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, doks)
}

// GetDokumenByID godoc
// @Summary Get dokumen by ID
// @Tags Dokumen
// @Produce json
// @Param dokumen_id path string true "ID Dokumen"
// @Success 200 {object} domain.Dokumen
// @Router /api/penandatanganan/dokumen/{dokumen_id} [get]
func (h *PenandatangananHandler) GetDokumenByID(c *gin.Context) {
	id := c.Param("dokumen_id")
	d, err := h.PenandatangananUsecase.GetDokumenByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	c.JSON(http.StatusOK, d)
}

// UpdateDokumen godoc
// @Summary Update dokumen
// @Tags Dokumen
// @Accept json
// @Produce json
// @Param dokumen_id path string true "ID Dokumen"
// @Param data body domain.Dokumen true "Dokumen data"
// @Success 200 {object} domain.Dokumen
// @Router /api/penandatanganan/dokumen/{dokumen_id} [put]
func (h *PenandatangananHandler) UpdateDokumen(c *gin.Context) {
	var d entities.Dokumen
	if err := c.ShouldBindJSON(&d); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	d.IDDokumen = c.Param("dokumen_id")
	if err := h.PenandatangananUsecase.UpdateDokumen(&d); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, d)
}

// DeleteDokumen godoc
// @Summary Delete dokumen
// @Tags Dokumen
// @Produce json
// @Param dokumen_id path string true "ID Dokumen"
// @Success 200 {object} map[string]string
// @Router /api/penandatanganan/dokumen/{dokumen_id} [delete]
func (h *PenandatangananHandler) DeleteDokumen(c *gin.Context) {
	id := c.Param("dokumen_id")
	if err := h.PenandatangananUsecase.DeleteDokumen(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// ===================== Log =====================
// CreateLog godoc
// @Summary Create log tanda tangan
// @Tags LogTandaTangan
// @Accept json
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Param data body domain.LogTandaTangan true "Log data"
// @Success 201 {object} domain.LogTandaTangan
// @Router /api/penandatanganan/{id}/log [post]
func (h *PenandatangananHandler) CreateLog(c *gin.Context) {
	var l entities.LogTandaTangan
	if err := c.ShouldBindJSON(&l); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.PenandatangananUsecase.CreateLog(&l); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, l)
}

// ListLogBySDM godoc
// @Summary List log tanda tangan by SDM
// @Tags LogTandaTangan
// @Produce json
// @Param id path string true "ID Penandatanganan (SDM)"
// @Param page query int false "Page"
// @Param limit query int false "Limit"
// @Success 200 {array} domain.LogTandaTangan
// @Router /api/penandatanganan/{id}/log [get]
func (h *PenandatangananHandler) ListLogBySDM(c *gin.Context) {
	id := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	logs, err := h.PenandatangananUsecase.ListLogBySDMID(id, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, logs)
}

// GetLogByID godoc
// @Summary Get log tanda tangan by ID
// @Tags LogTandaTangan
// @Produce json
// @Param log_id path int true "ID Log"
// @Success 200 {object} domain.LogTandaTangan
// @Router /api/penandatanganan/log/{log_id} [get]
func (h *PenandatangananHandler) GetLogByID(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("log_id"), 10, 64)
	l, err := h.PenandatangananUsecase.GetLogByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}
	c.JSON(http.StatusOK, l)
}

// DetailPenandatanganan godoc
// @Summary Get detail penandatanganan
// @Tags Penandatanganan
// @Produce json
// @Param id path string true "ID Penandatanganan"
// @Success 200 {object} map[string]interface{}
// @Router /api/penandatanganan/{id}/detail [get]
func (h *PenandatangananHandler) DetailPenandatanganan(c *gin.Context) {
	id := c.Param("id")
	// Ambil data penandatanganan
	p, err := h.PenandatangananUsecase.GetPenandatangananByID(id)
	if err != nil || p == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Penandatanganan tidak ditemukan"})
		return
	}
	// Ambil data pembuat (SDM) dengan repository SDM
	namaPembuat := ""
	sdmPembuat, _ := h.SDMRepo.GetByIDSDM(p.IDSDM)
	if sdmPembuat != nil && sdmPembuat.Nama != "" {
		namaPembuat = sdmPembuat.Nama
	}
	// Format anggota dengan nama SDM
	agg, _ := h.PenandatangananUsecase.ListAnggotaByPenandatangananID(p.IDPenandatanganan)
	aggList := []map[string]interface{}{}
	for _, a := range agg {
		namaAnggota := a.IDSDM
		sdm, _ := h.SDMRepo.GetByIDSDM(a.IDSDM)
		if sdm != nil && sdm.Nama != "" {
			namaAnggota = sdm.Nama
		}
		aggList = append(aggList, map[string]interface{}{
			"id_anggota_penandatangan": a.IDAnggotaPenandatangan,
			"id_sdm":                   a.IDSDM,
			"nama":                     namaAnggota,
			"is_sign":                  a.IsSign != nil && *a.IsSign,
			"urutan":                   a.Urutan,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"id_penandatanganan": p.IDPenandatanganan,
		"judul":              p.Judul,
		"type":               p.Type,
		"is_footer_exist":    p.IsFooterExist,
		"tag":                p.Tag,
		"is_bulk_sign":       p.IsBulkSign,
		"insert_footer_page": p.InsertFooterPage,
		"created_at":         p.CreatedAt,
		"updated_at":         p.UpdatedAt,
		"updater":            p.Updater,
		"id_sdm":             p.IDSDM,
		"pembuat": map[string]interface{}{
			"id_sdm": p.IDSDM,
			"nama":   namaPembuat,
		},
		"dokumen": aggList,
		"anggota": aggList,
	})
}

func NewRouter() *gin.Engine {
	r := gin.Default()
	// ... existing route setup ...

	// Expose PDF storage as public static files
	r.Static("/public/pdf", "/mnt/d/KULIAH/SEMESTER 8/TUGAS_AKHIR/myITS_Sign/myITS-Sign/base-go/storage/pdf")

	// ... existing code ...
	return r
}
