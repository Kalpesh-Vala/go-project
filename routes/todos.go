package routes

import (
	"github.com/Kalpesh-Vala/go-project/controllers"
	"github.com/gofiber/fiber/v2"
)

func TodoRoutes(app *fiber.App) {
	api := app.Group("/api/todolist")

	// Fetch all todos for a specific user
	api.Get("/:user_id", controllers.GetTodos)

	// Create a new todo
	api.Post("/:user_id", controllers.CreateTodo)

	//Update a todo
	api.Put("/:user_id/:todo_title", controllers.UpdateTodo)

	// Update a specific task in a todo
	// api.Put("/task", controllers.UpdateTask)

	// Delete a specific todo by title
	api.Delete("/:user_id/:todo_title", controllers.DeleteTodo)

	// Delete a specific task within a todo
	// api.Delete("/task/:todo_title/:task_title", controllers.DeleteTask)
}
