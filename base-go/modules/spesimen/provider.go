package spesimen

import (
	"github.com/samber/do"
	"gorm.io/gorm"

	"its.ac.id/base-go/modules/spesimen/handlers"
	"its.ac.id/base-go/modules/spesimen/repositories"
	"its.ac.id/base-go/modules/spesimen/services"
)

// RegisterProviders mendaftarkan semua provider untuk modul spesimen
func RegisterProviders(injector *do.Injector) {
	// Registrasi repository
	do.Provide(injector, func(i *do.Injector) (repositories.SpesimenRepository, error) {
		db := do.MustInvoke[*gorm.DB](i)
		return repositories.NewSpesimenRepository(db), nil
	})

	// Registrasi service
	do.Provide(injector, func(i *do.Injector) (services.SpesimenService, error) {
		repo := do.MustInvoke[repositories.SpesimenRepository](i)
		return services.NewSpesimenService(repo), nil
	})

	// Registrasi handler
	do.Provide(injector, func(i *do.Injector) (*handlers.SpesimenHandler, error) {
		service := do.MustInvoke[services.SpesimenService](i)
		return handlers.NewSpesimenHandler(service), nil
	})

	// Registrasi modul
	do.Provide(injector, func(i *do.Injector) (*Module, error) {
		return NewModule(i), nil
	})
}
