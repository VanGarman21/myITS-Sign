package sdm

import (
	"github.com/gin-gonic/gin"
	"github.com/samber/do"
	"its.ac.id/base-go/internal/adapters/controller"
)

type Module struct {
	handler *controller.SDMHandler
}

func NewModule(injector *do.Injector) *Module {
	return &Module{
		handler: do.MustInvoke[*controller.SDMHandler](injector),
	}
}

func (m *Module) RegisterRouters(router *gin.RouterGroup) {
	RegisterRoutes(router, m.handler)
} 