package routes

import (
	"bitbucket.org/dptsi/go-modules/auth/internal/presentation/controllers"
	"github.com/dptsi/its-go/app"
	"github.com/dptsi/its-go/contracts"
)

func RegisterRoutes(mod contracts.Module) {
	engine := mod.App().Services().WebEngine
	middlewareService := mod.App().Services().Middleware

	// Routing
	g := engine.Group("/auth")

	// Controllers
	authController := app.MustMake[*controllers.AuthController](mod.App(), "modules.auth.controllers.auth")

	// Routes
	g.POST("/login", authController.Login)
	g.GET("/callback", authController.Callback)
	g.GET("/user", middlewareService.Use("auth", nil), authController.User)
	g.DELETE("/logout", middlewareService.Use("auth", nil), authController.Logout)
}
