package spesimen

import (
	"github.com/gin-gonic/gin"
	"github.com/samber/do"

	"its.ac.id/base-go/modules/spesimen/handlers"
)

// Module merepresentasikan sebuah modul spesimen
type Module struct {
	handler *handlers.SpesimenHandler
}

// NewModule membuat instance baru dari Module
func NewModule(injector *do.Injector) *Module {
	return &Module{
		handler: do.MustInvoke[*handlers.SpesimenHandler](injector),
	}
}

// RegisterRouters mendaftarkan semua routes untuk modul ini
func (m *Module) RegisterRouters(router *gin.RouterGroup) {
	RegisterRoutes(router, m.handler)
}
