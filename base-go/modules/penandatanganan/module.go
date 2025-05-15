package penandatanganan

import (
	"github.com/samber/do"
	"its.ac.id/base-go/contracts"
)

type Module struct {
	app contracts.Application
}

func (m *Module) SetupRoutes() {
	router := m.app.Router()
	service := do.MustInvoke[services.PenandatangananService](m.app.Container())
	SetupRoutes(router, service)
}

func SetupModule(app contracts.Application) {
	m := &Module{app}
	app.Container().Provide(NewService)
	app.Container().Provide(NewRepository)
	m.SetupRoutes()
}
