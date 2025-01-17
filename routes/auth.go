package routes

import (
	"github.com/Kalpesh-Vala/go-project/controllers"
	"github.com/gofiber/fiber/v2"
)

func AuthRoutes(app *fiber.App) {
	authGroup := app.Group("/auth")
	authGroup.Post("/register", controllers.Register)
	authGroup.Post("/login", controllers.Login)
}
