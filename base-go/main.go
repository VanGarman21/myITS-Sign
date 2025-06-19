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

	versidbHttp "its.ac.id/base-go/internal/adapters/controller"
	versidbSqlserver "its.ac.id/base-go/internal/adapters/repository"
	versidbUsecase "its.ac.id/base-go/internal/usecase"

	"github.com/dptsi/its-go/app"
	"github.com/dptsi/its-go/providers"
	"github.com/dptsi/its-go/web"
	"github.com/joho/godotenv"
	"github.com/samber/do"
	swaggerFiles "github.com/swaggo/files" // swagger embed files
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
	"its.ac.id/base-go/config"
	"its.ac.id/base-go/docs"
	infrastructure_external "its.ac.id/base-go/infrastructure/external"
	internal_adapters_controller "its.ac.id/base-go/internal/adapters/controller"
	internal_adapters_repository "its.ac.id/base-go/internal/adapters/repository"
	internal_usecase "its.ac.id/base-go/internal/usecase"
	penandatangananModule "its.ac.id/base-go/modules/penandatanganan"
	sdmModule "its.ac.id/base-go/modules/sdm"
	spesimenModule "its.ac.id/base-go/modules/spesimen"
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
	// Load env
	_ = godotenv.Load()

	// Override env var manual untuk pastikan
	os.Setenv("DB_DRIVER", "sqlserver")
	os.Setenv("DB_USERNAME", "sa")
	os.Setenv("DB_PASSWORD", "123456")
	os.Setenv("DB_HOST", "172.29.160.1")
	os.Setenv("DB_PORT", "1433")
	os.Setenv("DB_DATABASE", "master")
	// dsn := "sqlserver://sa:123456@172.29.160.1:1433?database=master"
	// db, err := gorm.Open(sqlserver.Open(dsn), &gorm.Config{})
	// if err != nil {
	// 	log.Fatal("failed to connect database: ", err)
	// }
	// do.ProvideValue[*gorm.DB](nil, db)
	//  fmt.Println("DB_USERNAME =", os.Getenv("DB_USERNAME"))
	//  fmt.Println("DB_PASSWORD =", os.Getenv("DB_PASSWORD"))

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	var srv *http.Server
	var application *app.Application

	// it won't block the graceful shutdown handling below
	go func() {
		// Inisialisasi koneksi database dan daftarkan ke injector
		dsn := "sqlserver://sa:123456@172.29.160.1:1433?database=myits_sign"
		db, err := gorm.Open(sqlserver.Open(dsn), &gorm.Config{
			NamingStrategy: schema.NamingStrategy{
				TablePrefix:   "dbo.",
				SingularTable: true,
			},
		})
		if err != nil {
			log.Fatal("failed to connect database: ", err)
		}
		sqlDB, err := db.DB()
		if err != nil {
			log.Fatal("failed to get sql.DB: ", err)
		}
		if err := sqlDB.Ping(); err != nil {
			log.Fatal("failed to ping database: ", err)
		}
		log.Println("Database connection OK")
		// Cek nama database yang sedang terkoneksi
		var dbName string
		db.Raw("SELECT DB_NAME() as name").Scan(&dbName)
		log.Println("Connected to database:", dbName)
		// Cek semua tabel yang ada di database
		var tables []string
		db.Raw("SELECT TABLE_SCHEMA + '.' + TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'").Scan(&tables)
		log.Println("Tables in database:", tables)
		do.ProvideValue[*gorm.DB](do.DefaultInjector, db)

		application = app.NewApplication(ctx, do.DefaultInjector, config.Config())

		if err := providers.LoadProviders(application); err != nil {
			panic(err)
		}

		services := application.Services()
		appProviders.LoadAppProviders(application)

		engine := services.WebEngine

		// Tambahkan static route untuk PDF agar file bisa diakses
		engine.Static("/public/pdf", "/mnt/d/KULIAH/SEMESTER 8/TUGAS_AKHIR/myITS_Sign/myITS-Sign/base-go/storage/pdf")

		engine.GET("/csrf-cookie", CSRFCookieRoute)

		// Registrasi router SDM
		sdmMod := do.MustInvoke[*sdmModule.Module](application.Injector())
		sdmMod.RegisterRouters(engine.Group(""))

		// Registrasi provider Spesimen
		spesimenModule.RegisterProviders(application.Injector())

		// Registrasi router Spesimen
		spesimenMod := do.MustInvoke[*spesimenModule.Module](application.Injector())
		spesimenMod.RegisterRouters(engine.Group(""))

		// Registrasi router Penandatanganan
		penandatangananModule.RegisterRouters(engine, db)

		// Registrasi router Signature
		signatureRepo := internal_adapters_repository.NewSqlServerSignatureRepository(db)
		signatureUsecase := internal_usecase.NewSignatureTableUsecase(signatureRepo)
		internal_adapters_controller.NewSignatureTableHandler(engine, signatureUsecase)

		// Registrasi router VersiDB
		versiDBRepo := versidbSqlserver.NewSqlServerVersiDBRepository(db)
		versiDBUsecase := versidbUsecase.NewVersiDBUsecase(versiDBRepo)
		versidbHttp.NewVersiDBHandler(engine, versiDBUsecase)

		// Registrasi handler verifikasi dokumen
		bsreClient := infrastructure_external.NewBsreClient()
		verifyUsecase := internal_usecase.NewVerifyDocumentUsecase(bsreClient)
		internal_adapters_controller.NewVerifyDocumentHandler(engine, verifyUsecase)

		// Inisialisasi dependency untuk handler sign
		penandatangananRepo := internal_adapters_repository.NewSqlServerPenandatangananRepository(db)
		penandatangananUsecase := internal_usecase.NewPenandatangananUsecase(penandatangananRepo)
		sdmRepo := internal_adapters_repository.NewSDMRepository(db)
		signUsecase := internal_usecase.NewSignDocumentUsecase(bsreClient)
		internal_adapters_controller.NewSignDocumentHandler(engine, signUsecase, penandatangananUsecase, sdmRepo)

		// Inisialisasi repository dan service SDM
		sdmService := internal_usecase.NewSDMService(sdmRepo)
		internal_adapters_controller.RegisterSDMBySSOHandler(engine, db, sdmService)

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
