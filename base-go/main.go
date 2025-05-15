package main

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dptsi/its-go/app"
	"github.com/dptsi/its-go/providers"
	"github.com/dptsi/its-go/web"
	"github.com/joho/godotenv"
	"github.com/samber/do"
	swaggerFiles "github.com/swaggo/files" // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger"
	"its.ac.id/base-go/config"
	"its.ac.id/base-go/docs"
	appProviders "its.ac.id/base-go/providers"
)

// @contact.name   Direktorat Pengembangan Teknologi dan Sistem Informasi (DPTSI) - ITS
// @contact.url    http://its.ac.id/dptsi
// @contact.email  dptsi@its.ac.id

// @securityDefinitions.apikey	CSRF Token
// @in							header
// @name						x-csrf-token
// @description 				CSRF token yang didapatkan dari browser -> inspect element -> application -> storage -> cookies -> CSRF-TOKEN (Untuk firefox, storage berada pada tab tersendiri)

// @externalDocs.description  Dokumentasi Base Project
// @externalDocs.url          http://localhost:8080/doc/project
func main() {
	godotenv.Load()

	// Create context that listens for the interrupt signal from the OS.
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	var srv *http.Server
	var application *app.Application

	// Initializing the server in a goroutine so that
	// it won't block the graceful shutdown handling below
	go func() {
		application = app.NewApplication(ctx, do.DefaultInjector, config.Config())

		if err := providers.LoadProviders(application); err != nil {
			panic(err)
		}

		services := application.Services()
		appProviders.LoadAppProviders(application)

		engine := services.WebEngine
		engine.GET("/csrf-cookie", CSRFCookieRoute)

		// signatureHandler := signature.NewSignatureHandler()
    	// r.POST("/verify-document", signatureHandler.VerifyDocument)
    

		// programmatically set swagger info
		if os.Getenv("APP_ENV") == "local" {
			appUrlEnv := os.Getenv("APP_URL")
			appURL, err := url.Parse(appUrlEnv)
			if err != nil {
				appURL, _ = url.Parse("http://localhost:8080")
			}
			docs.SwaggerInfo.Title = os.Getenv("APP_NAME")
			docs.SwaggerInfo.Host = appURL.Host
			docs.SwaggerInfo.BasePath = ""
			docs.SwaggerInfo.Schemes = []string{"http", "https"}
			engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
		}

		webConfig := config.Config()["web"].(web.Config)
		srv = &http.Server{
			Addr:    ":" + webConfig.Port,
			Handler: engine,
		}

		log.Println("Server started at port " + webConfig.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Listen for the interrupt signal.
	<-ctx.Done()

	// Restore default behavior on the interrupt signal and notify user of shutdown.
	stop()
	log.Println("shutting down gracefully, press Ctrl+C again to force")

	// The context is used to inform the server it has 5 seconds to finish
	// the request it is currently handling
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if srv != nil {
		if err := srv.Shutdown(ctx); err != nil {
			log.Fatal("Server forced to shutdown: ", err)
		}
	}
	if application != nil {
		if err := application.Shutdown(); err != nil {
			log.Fatal("Application forced to shutdown: ", err)
		}
	}

	log.Println("Server exiting")
}

// CSRF cookie godoc
// @Summary		Rute dummy untuk set CSRF-TOKEN cookie
// @Router		/csrf-cookie [get]
// @Tags		CSRF Protection
// @Produce		json
// @Success		200 {object} responses.GeneralResponse{code=int,message=string} "Cookie berhasil diset"
// @Header      default {string} Set-Cookie "CSRF-TOKEN=00000000-0000-0000-0000-000000000000; Path=/"
func CSRFCookieRoute(ctx *web.Context) {
	ctx.JSON(http.StatusOK, web.H{
		"code":    0,
		"message": "success",
		"data":    nil,
	})
}

// // CheckDocumentBSRE implementasi contoh verifikasi dokumen
// func CheckDocumentBSRE(fileContent []byte, filename string) (*DocumentVerificationResponse, error) {
// 	// Implementasi sebenarnya menggunakan BSRE API
// 	// Contoh menggunakan environment variables dari .env
// 	bsreUsername := os.Getenv("test")
// 	bsrePassword := os.Getenv("Test1234")
// 	bsreHost := os.Getenv("10.199.16.195")

// 	// Contoh logika verifikasi
// 	if bsreUsername == "" || bsrePassword == "" || bsreHost == "" {
// 		return nil, fmt.Errorf("konfigurasi BSRE tidak lengkap")
// 	}

// 	return &DocumentVerificationResponse{
// 		Status:     "success",
// 		Message:    "Dokumen valid",
// 		DocumentID: fmt.Sprintf("%s-%d", filename, time.Now().Unix()),
// 		Timestamp:  time.Now().Format(time.RFC3339),
// 	}, nil
// }