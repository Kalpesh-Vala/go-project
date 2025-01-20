package routes

import (
	"github.com/Kalpesh-Vala/go-project/controllers"
	"github.com/gofiber/fiber/v2"
)

func TodoRoutes(app *fiber.App) {
	api := app.Group("/api/todolist")

	api.Get("/:user_id", controllers.GetTodos)
	api.Post("/", controllers.CreateTodo)
	api.Put("/task", controllers.UpdateTask)
	api.Delete("/:todo_title", controllers.DeleteTodo)
	api.Delete("/task/:todo_title/:task_title", controllers.DeleteTask)
}
