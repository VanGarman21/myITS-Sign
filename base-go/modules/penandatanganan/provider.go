package penandatanganan

import (
	"github.com/samber/do"
	"its.ac.id/base-go/modules/penandatanganan/repositories"
	"its.ac.id/base-go/modules/penandatanganan/services"
)

func NewService(i *do.Injector) (services.PenandatangananService, error) {
	db := do.MustInvoke[*database.DB](i)
	repo := repositories.NewPenandatangananRepository(db)
	return services.NewPenandatangananService(repo), nil
}

func NewRepository(i *do.Injector) (repositories.PenandatangananRepository, error) {
	db := do.MustInvoke[*database.DB](i)
	return repositories.NewPenandatangananRepository(db), nil
}
