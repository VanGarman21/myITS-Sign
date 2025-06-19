package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"bitbucket.org/dptsi/go-modules/auth/internal/presentation/responses"

	commonErrors "github.com/dptsi/its-go/app/errors"
	"github.com/dptsi/its-go/contracts"
	"github.com/dptsi/its-go/oidc"
	"github.com/dptsi/its-go/sso"
	"github.com/dptsi/its-go/web"
)

type AuthController struct {
	sessionsService contracts.SessionService
	authService     contracts.AuthService
	oidcClient      *oidc.Client
	sso             *sso.Sso
}

func NewAuthController(
	sessionsService contracts.SessionService,
	authService contracts.AuthService,
	oidcClient *oidc.Client,
	sso *sso.Sso,
) *AuthController {
	return &AuthController{
		sessionsService: sessionsService,
		authService:     authService,
		oidcClient:      oidcClient,
		sso:             sso,
	}
}

// @Summary		Rute untuk mendapatkan link login melalui OpenID Connect
// @Router		/auth/login [post]
// @Tags		Authentication & Authorization
// @Produce		json
// @Security 	CSRF Token
// @Success		200 {object} responses.GeneralResponse "Link login berhasil didapatkan"
// @Failure		500 {object} responses.GeneralResponse "Terjadi kesalahan saat menghubungi provider OpenID Connect"
func (c *AuthController) Login(ctx *web.Context) {
	url, err := c.oidcClient.RedirectURL(ctx)
	if err != nil {
		ctx.Error(fmt.Errorf("unable to get login url: %w", err))
		return
	}
	ctx.JSON(http.StatusOK, &responses.GeneralResponse{
		Code:    statusCode[successMessage],
		Message: successMessage,
		Data:    url,
	})
}

func (c *AuthController) Callback(ctx *web.Context) {
	var queryParams struct {
		Code  string `form:"code" binding:"required"`
		State string `form:"state" binding:"required"`
	}

	if err := ctx.ShouldBindQuery(&queryParams); err != nil {
		ctx.Error(err)
		return
	}

	user, err := c.sso.GetUserFromAuthorizationCode(
		ctx,
		queryParams.Code,
		queryParams.State,
	)

	isBadRequest := errors.Is(err, oidc.ErrInvalidState) || errors.Is(err, oidc.ErrInvalidNonce) || errors.Is(err, oidc.ErrInvalidCodeChallenge)
	var message string
	if errors.Is(err, oidc.ErrInvalidState) {
		message = invalidState
	} else if errors.Is(err, oidc.ErrInvalidNonce) {
		message = invalidNonce
	} else if errors.Is(err, oidc.ErrInvalidCodeChallenge) {
		message = invalidCodeChallenge
	}
	if isBadRequest {
		data := map[string]interface{}{}
		if os.Getenv("APP_DEBUG") == "true" {
			data["hint"] = "Jika anda menggunakan Postman saat memanggil endpoint /auth/login, maka copy URL dari halaman ini dan buat request ke URL ini melalui Postman. Jika masih gagal, ulangi sekali lagi."
		}
		ctx.Error(commonErrors.NewBadRequest(commonErrors.BadRequestParam{
			Code:    statusCode[message],
			Message: message,
			Data:    data,
		}))
		return
	}

	if err != nil {
		ctx.Error(err)
		return
	}

	if err := c.authService.Login(ctx, user); err != nil {
		ctx.Error(err)
		return
	}

	if err := c.sessionsService.Regenerate(ctx); err != nil {
		ctx.Error(err)
		return
	}

	frontendUrl := os.Getenv("APP_FRONTEND_URL")
	if frontendUrl != "" {
		ctx.Redirect(http.StatusFound, frontendUrl)
		return
	}

	ctx.JSON(http.StatusOK, web.H{
		"code":    statusCode[successMessage],
		"message": successMessage,
		"data":    nil,
	})
}

// @Summary		Rute untuk mendapatkan data user yang sedang login
// @Router		/auth/user [get]
// @Tags		Authentication & Authorization
// @Security	Session
// @Produce		json
// @Success		200 {object} responses.GeneralResponse{code=int,message=string,data=responses.User{roles=[]responses.Role}} "Data user berhasil didapatkan"
func (c *AuthController) User(ctx *web.Context) {
	user, err := c.authService.User(ctx)
	if err != nil {
		ctx.Error(err)
		return
	}
	roles := make([]web.H, 0)
	for _, r := range user.Roles() {
		roles = append(roles, web.H{
			"id":          r.Id,
			"name":        r.Name,
			"permissions": r.Permissions,
		})
	}

	data := make(map[string]interface{})
	data["sso_user_id"] = strings.ToUpper(user.Id())
	data["name"] = nil
	data["email"] = nil
	data["phone"] = nil
	data["preferred_username"] = nil
	data["picture"] = nil
	if user.Name() != "" {
		data["name"] = user.Name()
	}
	if user.Email() != "" {
		data["email"] = user.Email()
	}
	if user.Phone() != "" {
		data["phone"] = user.Phone()
	}
	if user.PreferredUsername() != "" {
		data["preferred_username"] = user.PreferredUsername()
	}
	if user.Picture() != "" {
		data["picture"] = user.Picture()
	}
	data["roles"] = roles

	ctx.JSON(http.StatusOK, &responses.GeneralResponse{
		Code:    statusCode[successMessage],
		Message: successMessage,
		Data:    data,
	})
}

// @Summary		Rute untuk logout
// @Router		/auth/logout [delete]
// @Tags		Authentication & Authorization
// @Security	Session
// @Security	CSRF Token
// @Produce		json
// @Success		200 {object} responses.GeneralResponse{code=int,message=string,data=string} "Logout berhasil"
func (c *AuthController) Logout(ctx *web.Context) {
	endSessionEndpoint, err := c.oidcClient.RPInitiatedLogout(
		ctx,
		os.Getenv("OIDC_POST_LOGOUT_REDIRECT_URI"),
	)
	if err != nil {
		ctx.Error(err)
		return
	}

	err = c.authService.Logout(ctx)
	if err != nil {
		ctx.Error(err)
		return
	}
	if err := c.sessionsService.Invalidate(ctx); err != nil {
		ctx.Error(err)
		return
	}
	if err := c.sessionsService.RegenerateToken(ctx); err != nil {
		ctx.Error(err)
		return
	}

	ctx.JSON(http.StatusOK, web.H{
		"code":    statusCode[successMessage],
		"message": successMessage,
		"data":    endSessionEndpoint,
	})
}

// LoginRedirect: GET /auth
func (c *AuthController) LoginRedirect(ctx *web.Context) {
	url, err := c.oidcClient.RedirectURL(ctx)
	if err != nil {
		ctx.Error(fmt.Errorf("unable to get login url: %w", err))
		return
	}
	ctx.Redirect(http.StatusFound, url)
}
