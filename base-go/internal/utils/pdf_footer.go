package utils

import (
	"fmt"
	"log"
	"os/exec"
)

// AddFooterAndQrToPdf memanggil script Python untuk overlay footer dan QR code ke PDF
func AddFooterAndQrToPdf(inputPath, outputPath, footerBahasa string, isFooterBlack bool, insertFooterPage string) error {
	footerText := footerTextByLang(footerBahasa)
	footerColor := "hitam"
	if !isFooterBlack {
		footerColor = "putih"
	}
	qrUrl := "https://bsre.bssn.go.id"
	pages := insertFooterPage
	if pages == "" {
		pages = "all"
	}

	cmd := exec.Command("python3", "internal/utils/pdf_footer_overlay.py", inputPath, outputPath, footerText, footerColor, qrUrl, pages, footerBahasa)
	log.Printf("[PY] Jalankan script Python overlay: %v", cmd.Args)
	output, err := cmd.CombinedOutput()
	log.Printf("[PY] Output: %s", string(output))
	if err != nil {
		log.Printf("[PY][ERROR] Gagal overlay PDF: %v", err)
		return fmt.Errorf("gagal overlay PDF: %w", err)
	}
	return nil
}

func footerTextByLang(lang string) string {
	if lang == "en" {
		return "This document has been digitally signed and legalized by BSrE BSSN. The authenticity of this document can be verified at https://bsre.bssn.go.id."
	}
	return "Dokumen ini telah ditandatangani dan dilegalisasi secara elektronik oleh BSrE BSSN. Keaslian dokumen dapat dicek di https://bsre.bssn.go.id."
}
