package controllers

import (
	"context"
	"net/url"
	"time"

	"github.com/Kalpesh-Vala/go-project/config"
	"github.com/Kalpesh-Vala/go-project/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
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

func CreateTodo(c *fiber.Ctx) error {
	// Parse user ID from route params
	userID := c.Params("user_id")

	// Validate and convert the user ID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Parse request body
	var input struct {
		Title string `json:"title"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Check if the title is not blank
	if input.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Title cannot be blank"})
	}

	// Fetch the TodoList for the user
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)

	if err != nil {
		// If no TodoList exists, create a new one
		if err.Error() == "mongo: no documents in result" {
			todoList = models.TodoList{
				ID:        primitive.NewObjectID(),
				UserID:    objID,
				Todos:     []models.Todo{},
				CreatedAt: primitive.NewDateTimeFromTime(time.Now()),
			}
		} else {
			// Return other errors
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch or create TodoList"})
		}
	}

	// Create the new Todo
	newTodo := models.Todo{
		Title:     input.Title,
		Completed: false,
		UpdatedAt: primitive.NewDateTimeFromTime(time.Now()),
		Tasks:     []models.Task{},
	}

	// Add the new Todo to the TodoList
	todoList.Todos = append(todoList.Todos, newTodo)

	// Upsert the TodoList back into the database
	_, err = config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": todoList},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update TodoList"})
	}

	// Respond with success
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Todo created successfully",
		"todo":    newTodo,
	})
}

func DeleteTodo(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	todoTitle := c.Params("todo_title")

	// Decode the todoTitle to handle URL-encoded characters
	decodedTitle, err := url.QueryUnescape(todoTitle)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid todo title"})
	}

	// Convert userID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Fetch the TodoList for the user
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

	// Find and remove the todo by title
	found := false
	for i, todo := range todoList.Todos {
		if todo.Title == decodedTitle {
			todoList.Todos = append(todoList.Todos[:i], todoList.Todos[i+1:]...)
			found = true
			break
		}
	}

	if !found {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo not found"})
	}

	// Update the TodoList in the database
	_, err = config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update TodoList"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Todo deleted successfully"})
}

func UpdateTodo(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	todoTitle := c.Params("todo_title")

	// Decode the todoTitle to handle URL-encoded characters
	decodedTitle, err := url.QueryUnescape(todoTitle)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid todo title"})
	}

	// Parse request body
	var input struct {
		NewTitle string `json:"new_title"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Check if the new title is not blank
	if input.NewTitle == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "New title cannot be blank"})
	}

	// Convert userID to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Fetch the TodoList for the user
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

	// Find and update the todo by title
	found := false
	for i, todo := range todoList.Todos {
		if todo.Title == decodedTitle {
			todoList.Todos[i].Title = input.NewTitle
			todoList.Todos[i].UpdatedAt = primitive.NewDateTimeFromTime(time.Now())
			found = true
			break
		}
	}

	if !found {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo not found"})
	}

	// Update the TodoList in the database
	_, err = config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update TodoList"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Todo updated successfully"})
}
