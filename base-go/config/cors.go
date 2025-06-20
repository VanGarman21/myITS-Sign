package config

import "github.com/dptsi/its-go/http"

func corsConfig() http.CorsConfig {
	return http.CorsConfig{
		AllowedOrigins:   []string{"https://my-its-sign.vercel.app/"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"content-type", "x-csrf-token"},
		ExposedHeaders:   []string{"Id_dokumen"},
		MaxAge:           0,
		AllowCredentials: true,
	}
}
