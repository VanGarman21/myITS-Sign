package sdm

import (
	"github.com/samber/do"
	"gorm.io/gorm"
	"its.ac.id/base-go/internal/adapters/controller"
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/usecase"
)

func RegisterProviders(injector *do.Injector) {
	do.Provide(injector, func(i *do.Injector) (repository.SDMRepository, error) {
		db := do.MustInvoke[*gorm.DB](i)
		return repository.NewSDMRepository(db), nil
	})
	do.Provide(injector, func(i *do.Injector) (usecase.SDMService, error) {
		repo := do.MustInvoke[repository.SDMRepository](i)
		return usecase.NewSDMService(repo), nil
	})
	do.Provide(injector, func(i *do.Injector) (*controller.SDMHandler, error) {
		service := do.MustInvoke[usecase.SDMService](i)
		return controller.NewSDMHandler(service), nil
	})
	do.Provide(injector, func(i *do.Injector) (*Module, error) {
		return NewModule(i), nil
	})
}
