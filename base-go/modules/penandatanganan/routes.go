package penandatanganan

import (
	"its.ac.id/base-go/middleware"
	"its.ac.id/base-go/modules/penandatanganan/handlers"
	"its.ac.id/base-go/modules/penandatanganan/services"
	"its.ac.id/base-go/web"
)

func SetupRoutes(router web.Router, service services.PenandatangananService) {
	h := handlers.NewPenandatangananHandler(service)

	router.Group("/penandatanganan", func(r web.Router) {
		r.Use(middleware.StartSession, middleware.VerifyCSRFToken)

		r.Get("/", h.GetList)
		r.Get("/:id", h.GetByID)
		r.Post("/", h.Create)
		r.Put("/:id", h.Update)
		r.Delete("/:id", h.Delete)
	})
}
