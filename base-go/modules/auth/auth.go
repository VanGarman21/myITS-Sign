package auth

import (
	"bitbucket.org/dptsi/go-modules/auth/internal/app/providers"
	"bitbucket.org/dptsi/go-modules/auth/internal/presentation/routes"
	"github.com/dptsi/its-go/contracts"
)

func SetupModule(mod contracts.Module) {
	providers.RegisterDependencies(mod)
	routes.RegisterRoutes(mod)
}
