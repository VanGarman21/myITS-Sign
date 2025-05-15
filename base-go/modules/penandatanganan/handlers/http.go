package handlers

import (
    "net/http"
    
    "github.com/dptsi/its-go/web"
    "github.com/dptsi/its-go/services"
)

type PenandatangananHandler struct {
    service services.PenandatangananService
}

func NewPenandatangananHandler(service services.PenandatangananService) *PenandatangananHandler {
    return &PenandatangananHandler{service}
}

func (h *PenandatangananHandler) Create(ctx *web.Context) {
    var req CreatePenandatangananRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, web.GeneralResponse{
            Code:    http.StatusBadRequest,
            Message: err.Error(),
        })
        return
    }
    
    // Panggil service dan handle response
    penandatanganan, err := h.service.Create(ctx, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, web.GeneralResponse{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusCreated, web.GeneralResponse{
		Code:    http.StatusCreated,
		Message: "Penandatanganan created successfully",
		Data:    penandatanganan,
	})


}

func (h *PenandatangananHandler) Update(ctx *web.Context) {
    var req UpdatePenandatangananRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, web.GeneralResponse{
            Code:    http.StatusBadRequest,
            Message: err.Error(),
        })
        return
    }
    

	penandatanganan, err := h.service.Update(ctx, req.IDPenandatanganan, &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, web.GeneralResponse{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})	
		return
	}

	ctx.JSON(http.StatusOK, web.GeneralResponse{
		Code:    http.StatusOK,
		Message: "Penandatanganan updated successfully",	
		Data:    penandatanganan,
	})
}

func (h *PenandatangananHandler) Delete(ctx *web.Context) {
    id := ctx.Param("id")	

	err := h.service.Delete(ctx, uuid.MustParse(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, web.GeneralResponse{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),	
		})
		return
	}

	ctx.JSON(http.StatusOK, web.GeneralResponse{
		Code:    http.StatusOK,
		Message: "Penandatanganan deleted successfully",	
	})
}

func (h *PenandatangananHandler) GetList(ctx *web.Context) {
    offset := ctx.Query("offset")
    limit := ctx.Query("limit")	

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		offsetInt = 0
	}	
	
	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		limitInt = 10
	}
	
	penandatanganan, err := h.service.GetList(ctx, offsetInt, limitInt)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, web.GeneralResponse{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, web.GeneralResponse{
		Code:    http.StatusOK,
		Message: "Penandatanganan list retrieved successfully",
		Data:    penandatanganan,
	})	
}
