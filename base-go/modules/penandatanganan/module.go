package penandatanganan

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"its.ac.id/base-go/internal/adapters/controller"
	"its.ac.id/base-go/internal/adapters/repository"
	"its.ac.id/base-go/internal/usecase"
)

func RegisterRouters(engine *gin.Engine, db *gorm.DB) {
	repo := repository.NewSqlServerPenandatangananRepository(db)
	usecase := usecase.NewPenandatangananUsecase(repo)
	sdmRepo := repository.NewSDMRepository(db)
	controller.NewPenandatangananHandler(engine, usecase, sdmRepo)
}
