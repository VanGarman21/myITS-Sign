package contracts

import (
	"github.com/dptsi/its-go/web"
	"github.com/samber/do"
)

type Application interface {
	Router() web.Router
	Container() *do.Injector
}

type Module interface {
	SetupRoutes()
}
