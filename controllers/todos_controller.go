package controllers

import (
	"context"

	"github.com/Kalpesh-Vala/go-project/config"
	"github.com/Kalpesh-Vala/go-project/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Helper: Fetch TodoList by user ID
func fetchTodoList(userID primitive.ObjectID) (models.TodoList, error) {
	var todoList models.TodoList
	err := config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": userID}).Decode(&todoList)
	return todoList, err
}

// GetTodos fetches all todos for a specific user
func GetTodos(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	// Validate and convert the user ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Fetch the TodoList for the user
	todoList, err := fetchTodoList(objID)
	if err != nil {
		if err.Error() == "mongo: no documents in result" {
			// If no todos are found for the user, return a 404
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No todos found for this user"})
		}
		// If there is any other error, return a 500
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch todos"})
	}

	// Return the fetched TodoList (only todos part)
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"todos": todoList.Todos})
}
