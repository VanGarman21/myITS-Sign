package spesimen

import (
	"github.com/samber/do"
	"gorm.io/gorm"

	sdmServices "its.ac.id/base-go/internal/usecase"
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/adapters/controller"
	spesimenServices "its.ac.id/base-go/internal/usecase"
)

// RegisterProviders mendaftarkan semua provider untuk modul spesimen
func RegisterProviders(injector *do.Injector) {
	// Registrasi repository
	do.Provide(injector, func(i *do.Injector) (repository.SpesimenRepository, error) {
		db := do.MustInvoke[*gorm.DB](i)
		return repository.NewSpesimenRepository(db), nil
	})

	// Registrasi service
	do.Provide(injector, func(i *do.Injector) (spesimenServices.SpesimenService, error) {
		repo := do.MustInvoke[repository.SpesimenRepository](i)
		return spesimenServices.NewSpesimenService(repo), nil
	})

	// Registrasi handler
	do.Provide(injector, func(i *do.Injector) (*controller.SpesimenHandler, error) {
		service := do.MustInvoke[spesimenServices.SpesimenService](i)
		sdmService := do.MustInvoke[sdmServices.SDMService](i)
		return controller.NewSpesimenHandler(service, sdmService), nil
	})

	// Registrasi modul
	do.Provide(injector, func(i *do.Injector) (*Module, error) {
		return NewModule(i), nil
	})
}
