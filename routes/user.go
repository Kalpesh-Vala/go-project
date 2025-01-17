// routes/user.go
package routes

import (
	"github.com/Kalpesh-Vala/go-project/controllers"

	"github.com/gofiber/fiber/v2"
)

func UserRoutes(app *fiber.App) {
	userGroup := app.Group("/users")
	userGroup.Get("/", controllers.GetUser)
}
