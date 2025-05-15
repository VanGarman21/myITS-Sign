package providers

import (
	"os"
	"strings"

	"bitbucket.org/dptsi/go-modules/auth/internal/presentation/controllers"
	"github.com/dptsi/its-go/app"
	"github.com/dptsi/its-go/contracts"
	"github.com/dptsi/its-go/oidc"
	"github.com/dptsi/its-go/sso"
)

func RegisterDependencies(mod contracts.Module) {
	// Libraries
	app.Bind[*oidc.Client](mod.App(), "modules.auth.oidc_client", func(application contracts.Application) (*oidc.Client, error) {
		sessionsService := application.Services().Session
		return oidc.NewClient(
			application.Context(),
			sessionsService,
			os.Getenv("OIDC_PROVIDER"),
			os.Getenv("OIDC_CLIENT_ID"),
			os.Getenv("OIDC_CLIENT_SECRET"),
			os.Getenv("OIDC_REDIRECT_URL"),
			strings.Split(os.Getenv("OIDC_SCOPES"), ","),
		)
	})
	app.Bind(mod.App(), "modules.auth.sso", func(application contracts.Application) (*sso.Sso, error) {
		oidcClient := app.MustMake[*oidc.Client](application, "modules.auth.oidc_client")

		return sso.NewSso(application.Config(), oidcClient), nil
	})

	// Queries

	// Repositories

	// Controllers
	app.Bind[*controllers.AuthController](
		mod.App(),
		"modules.auth.controllers.auth",
		func(application contracts.Application) (*controllers.AuthController, error) {
			services := mod.App().Services()
			oidcClient := app.MustMake[*oidc.Client](application, "modules.auth.oidc_client")
			sso := app.MustMake[*sso.Sso](application, "modules.auth.sso")

			return controllers.NewAuthController(
				services.Session,
				services.Auth,
				oidcClient,
				sso,
			), nil
		},
	)
}
