package config

import (
	"os"

	"github.com/dptsi/its-go/http"
)

func corsConfig() http.CorsConfig {
	appFrontendUrl := os.Getenv("APP_FRONTEND_URL")
	return http.CorsConfig{
		AllowedOrigins:   []string{appFrontendUrl},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"content-type", "x-csrf-token"},
		ExposedHeaders:   []string{"Id_dokumen"},
		MaxAge:           0,
		AllowCredentials: true,
	}
}
