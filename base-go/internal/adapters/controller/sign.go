package controller

import (
	"fmt"
	"net/http"

	"mime/multipart"

	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/adapters/request"
	"its.ac.id/base-go/internal/entities"
	"its.ac.id/base-go/internal/usecase"
)

type SignDocumentHandler struct {
	Usecase                usecase.SignDocumentUsecase
	PenandatangananUsecase entities.PenandatangananUsecase
	SDMRepo                repository.SDMRepository
}

func NewSignDocumentHandler(r *gin.Engine, usecase usecase.SignDocumentUsecase, penandatangananUsecase entities.PenandatangananUsecase, sdmRepo repository.SDMRepository) {
	h := &SignDocumentHandler{Usecase: usecase, PenandatangananUsecase: penandatangananUsecase, SDMRepo: sdmRepo}
	r.POST("/api/sign/pdf", h.Sign)
	r.GET("/api/sign/download/:id_dokumen", h.Download)
}

func (h *SignDocumentHandler) Sign(c *gin.Context) {
	var req request.SignDocumentRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "data": nil, "message": "Form tidak valid: " + err.Error()})
		return
	}

	// --- LOG DEBUG ---
	fmt.Printf("REQ: %+v\n", req)
	if req.File != nil {
		fmt.Println("File:", req.File.Filename)
	}
	if req.ImageTTD != nil {
		fmt.Println("ImageTTD:", req.ImageTTD.Filename)
	}
	// --- END LOG DEBUG ---

	file, err := req.File.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Gagal open file: " + err.Error()})
		return
	}
	defer file.Close()

	var imageTTD multipart.File
	var imageTTDFilename string
	if req.ImageTTD != nil {
		imageTTD, err = req.ImageTTD.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Gagal open imageTTD: " + err.Error()})
			return
		}
		defer imageTTD.Close()
		imageTTDFilename = req.ImageTTD.Filename
	}
	bsreResp, bsreErr := h.Usecase.RelaySignDocument(file, req.File.Filename, &req, imageTTD, imageTTDFilename)
	if bsreErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": bsreErr.Error()})
		return
	}

	// --- SIMPAN FILE HASIL SIGNED KE STORAGE LOKAL ---
	// Buat nama file unik
	fileName := fmt.Sprintf("signed_%d_%s", time.Now().UnixNano(), req.File.Filename)
	storagePath := filepath.Join("storage", "pdf", fileName)
	if err := os.MkdirAll(filepath.Dir(storagePath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal membuat folder storage"})
		return
	}
	if err := os.WriteFile(storagePath, bsreResp.Body, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Gagal simpan file hasil signed: " + err.Error()})
		return
	}

	// --- UPDATE STATUS DI DATABASE ---
	// 1. Ambil SDM dari NIK
	sdm, err := h.SDMRepo.GetByNIK(req.Nik)
	if err != nil || sdm == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "SDM tidak ditemukan untuk NIK: " + req.Nik})
		return
	}
	idSdm := sdm.IDSDM

	// 2. Ambil dokumen terkait (berdasarkan id_penandatanganan dari request)
	idPenandatanganan := req.IDPenandatanganan
	// Update dokumen: nama_file, public_uri, updated_at
	dokumens, err := h.PenandatangananUsecase.ListDokumenByPenandatangananID(idPenandatanganan)
	if err == nil && len(dokumens) > 0 {
		// Ambil dokumen pertama (atau logic lain jika multi dokumen)
		dok := dokumens[0]
		dok.NamaFile = &fileName
		dok.PublicURI = &storagePath
		dok.UpdatedAt = time.Now()
		h.PenandatangananUsecase.UpdateDokumen(dok)
	}

	// 3. Update anggota_tandatangan (is_sign = true) untuk id_sdm dan id_penandatanganan terkait
	if idPenandatanganan != "" {
		aggList, err := h.PenandatangananUsecase.ListAnggotaByPenandatangananID(idPenandatanganan)
		if err == nil && len(aggList) > 0 {
			for _, agg := range aggList {
				if agg.IDSDM == idSdm {
					agg.IsSign = new(bool)
					*agg.IsSign = true
					agg.UpdatedAt = time.Now()
					h.PenandatangananUsecase.UpdateAnggota(agg)
					break
				}
			}
		}
	}

	for k, v := range bsreResp.Header {
		c.Header(k, v[0])
	}
	c.Header("Access-Control-Expose-Headers", "Id_dokumen")
	c.Data(bsreResp.StatusCode, bsreResp.Header.Get("Content-Type"), bsreResp.Body)
}

// Handler download PDF hasil tanda tangan dari BSrE
func (h *SignDocumentHandler) Download(c *gin.Context) {
	idDokumen := c.Param("id_dokumen")
	if idDokumen == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "id_dokumen wajib diisi"})
		return
	}
	bsreResp, err := h.Usecase.DownloadSignedPdf(idDokumen)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}
	for k, v := range bsreResp.Header {
		c.Header(k, v[0])
	}
	c.Data(bsreResp.StatusCode, bsreResp.Header.Get("Content-Type"), bsreResp.Body)
}
