package contracts

type Application interface {
	Router() web.Router
	Container() *do.Injector
}

type Module interface {
	SetupRoutes()
}
