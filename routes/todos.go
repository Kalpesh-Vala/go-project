package routes

import (
	"github.com/Kalpesh-Vala/go-project/controllers"
	"github.com/gofiber/fiber/v2"
)

// TodoRoutes defines all the routes related to the Todo feature
func TodoRoutes(app *fiber.App) {
	api := app.Group("/api/todolist")

	// Fetch all todos for a specific user
	api.Get("/:user_id", controllers.GetTodos)

	// Add a new todo to the user's list
	api.Post("/", controllers.CreateTodo)

	// Update a specific task within a todo
	api.Put("/task", controllers.UpdateTask)

	// Delete a specific todo from the user's list
	api.Delete("/:todo_title", controllers.DeleteTodo)

	// Delete a specific task from a todo
	api.Delete("/task/:todo_title/:task_title", controllers.DeleteTask)
}
