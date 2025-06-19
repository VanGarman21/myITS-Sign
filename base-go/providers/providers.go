package providers

import (
	"github.com/dptsi/its-go/contracts"
	sdmModule "its.ac.id/base-go/modules/sdm"
)

func LoadAppProviders(application contracts.Application) {
	services := application.Services()

	extendAuth(application)
	registerEvents(application)
	registerMiddlewares(application)
	registerModules(services.Module)
	sdmModule.RegisterProviders(application.Injector())
}
