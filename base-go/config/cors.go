package config

import "github.com/dptsi/its-go/http"

func corsConfig() http.CorsConfig {
	return http.CorsConfig{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"content-type", "x-csrf-token"},
		ExposedHeaders:   []string{},
		MaxAge:           0,
		AllowCredentials: true,
	}
}
