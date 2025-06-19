package external

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/textproto"
	"os"
	"strings"

	"its.ac.id/base-go/internal/adapters/request"
)

// RelayResponse digunakan untuk relay response PDF dari BSrE
type RelayResponse struct {
	Body       []byte
	Header     http.Header
	StatusCode int
}

type BsreClient struct {
	BaseURL  string
	Username string
	Password string
}

func NewBsreClient() *BsreClient {
	return &BsreClient{
		BaseURL:  os.Getenv("BSRE_HOST_URI"),
		Username: os.Getenv("BSRE_USERNAME"),
		Password: os.Getenv("BSRE_PASSWORD"),
	}
}

func (c *BsreClient) VerifyDocument(file multipart.File, filename string) (map[string]interface{}, error) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	fw, err := writer.CreateFormFile("signed_file", filename)
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(fw, file)
	if err != nil {
		return nil, err
	}
	writer.Close()

	// Log ukuran multipart body
	fmt.Println("Multipart body size:", buf.Len())
	// Simpan multipart body ke file untuk analisis
	os.WriteFile("/tmp/bsre_multipart_body.bin", buf.Bytes(), 0644)

	url := strings.TrimRight(c.BaseURL, "/") + "/api/sign/verify"
	fmt.Printf("[BSRE REQUEST URL] %s\n", url)

	req, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())
	req.SetBasicAuth(c.Username, c.Password)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, err
	}
	fmt.Printf("[BSRE RAW RESPONSE] %#v\n", result)
	return result, nil
}

func (c *BsreClient) SignDocument(file multipart.File, filename string, req interface{}, imageTTD multipart.File, imageTTDFilename string) (map[string]interface{}, error) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	// Reset pointer file ke awal sebelum dikirim ke BSrE
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	// Untuk file PDF
	hdr := textproto.MIMEHeader{}
	hdr.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, filename))
	hdr.Set("Content-Type", "application/pdf")
	fw, err := writer.CreatePart(hdr)
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(fw, file)
	if err != nil {
		return nil, err
	}
	// Untuk imageTTD, deteksi ekstensi file
	imgContentType := "image/png"
	if strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpg") || strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpeg") {
		imgContentType = "image/jpeg"
	}
	hdr2 := textproto.MIMEHeader{}
	hdr2.Set("Content-Disposition", fmt.Sprintf(`form-data; name="imageTTD"; filename="%s"`, imageTTDFilename))
	hdr2.Set("Content-Type", imgContentType)
	fw2, err := writer.CreatePart(hdr2)
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(fw2, imageTTD)
	if err != nil {
		return nil, err
	}
	// Cast req ke *request.SignDocumentRequest
	r, ok := req.(*request.SignDocumentRequest)
	if !ok {
		return nil, fmt.Errorf("invalid request type")
	}
	writer.WriteField("nik", r.Nik)
	writer.WriteField("passphrase", r.Passphrase)
	writer.WriteField("tampilan", r.Tampilan)
	if r.Tampilan != "invisible" {
		if imageTTD != nil && imageTTDFilename != "" {
			imgContentType := "image/png"
			if strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpg") || strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpeg") {
				imgContentType = "image/jpeg"
			}
			hdr2 := textproto.MIMEHeader{}
			hdr2.Set("Content-Disposition", fmt.Sprintf(`form-data; name="imageTTD"; filename="%s"`, imageTTDFilename))
			hdr2.Set("Content-Type", imgContentType)
			fw2, err := writer.CreatePart(hdr2)
			if err != nil {
				return nil, err
			}
			_, err = io.Copy(fw2, imageTTD)
			if err != nil {
				return nil, err
			}
		}
		writer.WriteField("image", r.Image)
		if r.LinkQR != "" {
			writer.WriteField("linkQR", r.LinkQR)
		}
		if r.Halaman != "" {
			writer.WriteField("halaman", r.Halaman)
		}
		writer.WriteField("page", fmt.Sprintf("%d", r.Page))
		writer.WriteField("xAxis", fmt.Sprintf("%d", r.XAxis))
		writer.WriteField("yAxis", fmt.Sprintf("%d", r.YAxis))
		writer.WriteField("width", fmt.Sprintf("%d", r.Width))
		writer.WriteField("height", fmt.Sprintf("%d", r.Height))
		if r.TagKoordinat != "" {
			writer.WriteField("tag_koordinat", r.TagKoordinat)
		}
		if r.Reason != "" {
			writer.WriteField("reason", r.Reason)
		}
		if r.Location != "" {
			writer.WriteField("location", r.Location)
		}
	}
	writer.Close()

	// Log ukuran multipart body
	fmt.Println("Multipart body size:", buf.Len())
	// Simpan multipart body ke file untuk analisis
	os.WriteFile("/tmp/bsre_multipart_body.bin", buf.Bytes(), 0644)

	url := strings.TrimRight(c.BaseURL, "/") + "/api/sign/pdf"
	fmt.Printf("[BSRE REQUEST URL] %s\n", url)

	reqHttp, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		return nil, err
	}
	reqHttp.Header.Set("Content-Type", writer.FormDataContentType())
	reqHttp.SetBasicAuth(c.Username, c.Password)

	client := &http.Client{}
	resp, err := client.Do(reqHttp)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Baca response body asli
	bodyBytes, _ := io.ReadAll(resp.Body)
	fmt.Println("[BSRE RAW RESPONSE]", string(bodyBytes))
	resp.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		return nil, fmt.Errorf("BSRE response is not valid JSON: %s", string(bodyBytes))
	}
	return result, nil
}

// RelaySignDocument: relay response PDF dari BSrE
func (c *BsreClient) RelaySignDocument(file multipart.File, filename string, req *request.SignDocumentRequest, imageTTD multipart.File, imageTTDFilename string) (*RelayResponse, error) {
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	hdr := textproto.MIMEHeader{}
	hdr.Set("Content-Disposition", fmt.Sprintf(`form-data; name="file"; filename="%s"`, filename))
	hdr.Set("Content-Type", "application/pdf")
	fw, err := writer.CreatePart(hdr)
	if err != nil {
		return nil, err
	}
	_, err = io.Copy(fw, file)
	if err != nil {
		return nil, err
	}

	writer.WriteField("nik", req.Nik)
	writer.WriteField("passphrase", req.Passphrase)
	writer.WriteField("tampilan", req.Tampilan)

	if req.Tampilan != "invisible" {
		writer.WriteField("image", req.Image)
		if req.LinkQR != "" {
			writer.WriteField("linkQR", req.LinkQR)
		}
		if req.Halaman != "" {
			writer.WriteField("halaman", req.Halaman)
		}
		writer.WriteField("page", fmt.Sprintf("%d", req.Page))
		writer.WriteField("xAxis", fmt.Sprintf("%d", req.XAxis))
		writer.WriteField("yAxis", fmt.Sprintf("%d", req.YAxis))
		writer.WriteField("width", fmt.Sprintf("%d", req.Width))
		writer.WriteField("height", fmt.Sprintf("%d", req.Height))
		if req.TagKoordinat != "" {
			writer.WriteField("tag_koordinat", req.TagKoordinat)
		}
		if req.Reason != "" {
			writer.WriteField("reason", req.Reason)
		}
		if req.Location != "" {
			writer.WriteField("location", req.Location)
		}
		if imageTTD != nil && imageTTDFilename != "" {
			imgContentType := "image/png"
			if strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpg") || strings.HasSuffix(strings.ToLower(imageTTDFilename), ".jpeg") {
				imgContentType = "image/jpeg"
			}
			hdr2 := textproto.MIMEHeader{}
			hdr2.Set("Content-Disposition", fmt.Sprintf(`form-data; name="imageTTD"; filename="%s"`, imageTTDFilename))
			hdr2.Set("Content-Type", imgContentType)
			fw2, err := writer.CreatePart(hdr2)
			if err != nil {
				return nil, err
			}
			_, err = io.Copy(fw2, imageTTD)
			if err != nil {
				return nil, err
			}
		}
	}
	writer.Close()

	url := strings.TrimRight(c.BaseURL, "/") + "/api/sign/pdf"
	reqHttp, err := http.NewRequest("POST", url, &buf)
	if err != nil {
		return nil, err
	}
	reqHttp.Header.Set("Content-Type", writer.FormDataContentType())
	reqHttp.SetBasicAuth(c.Username, c.Password)

	client := &http.Client{}
	resp, err := client.Do(reqHttp)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return &RelayResponse{
		Body:       bodyBytes,
		Header:     resp.Header,
		StatusCode: resp.StatusCode,
	}, nil
}

// DownloadSignedPdf: download file hasil tanda tangan dari BSrE
func (c *BsreClient) DownloadSignedPdf(idDokumen string) (*RelayResponse, error) {
	url := strings.TrimRight(c.BaseURL, "/") + "/api/sign/download/" + idDokumen
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.SetBasicAuth(c.Username, c.Password)
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	return &RelayResponse{
		Body:       bodyBytes,
		Header:     resp.Header,
		StatusCode: resp.StatusCode,
	}, nil
}
