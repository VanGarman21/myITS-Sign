package sdm

import (
	"github.com/gin-gonic/gin"
	"its.ac.id/base-go/internal/adapters/controller"
)

func RegisterRoutes(router *gin.RouterGroup, handler *controller.SDMHandler) {
	r := router.Group("/sdm")
	r.GET("", handler.GetAll)
	r.GET(":nik", handler.GetByNIK)
	r.GET("sso/:sso_user_id", handler.GetBySSOUserID)
	r.GET("id/:id_sdm", handler.GetByIDSDM)
	r.POST("", handler.Create)
	r.PUT(":nik", handler.Update)
	r.DELETE(":nik", handler.Delete)
}
