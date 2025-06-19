package spesimen

import (
	"github.com/gin-gonic/gin"

	"its.ac.id/base-go/internal/adapters/controller"
)

// RegisterRoutes mendaftarkan semua routes untuk modul spesimen
func RegisterRoutes(router *gin.RouterGroup, handler *controller.SpesimenHandler) {
	spesimenRoutes := router.Group("/spesimen")
	{
		spesimenRoutes.POST("", handler.Create)
		spesimenRoutes.GET("/:id", handler.GetByID)
		spesimenRoutes.GET("/sdm/:idSdm", handler.GetBySDMID)
		spesimenRoutes.PUT("/:id", handler.Update)
		spesimenRoutes.DELETE("/:id", handler.Delete)
	}
}
