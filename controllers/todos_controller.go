package controllers

import (
	"context"
	"fmt"
	"time"

	"github.com/Kalpesh-Vala/go-project/config"
	"github.com/Kalpesh-Vala/go-project/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetTodos fetches all todos for a specific user
func GetTodos(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No todos found for this user"})
	}

	return c.JSON(todoList)
}

// CreateTodo adds a new todo item to the user's todo list
// http://localhost:5000/api/todolist/?user_id=678b657880fb3d4f06c6f29f
func CreateTodo(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var newTodo models.Todo
	if err := c.BodyParser(&newTodo); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Set default values for the new todo
	newTodo.Completed = false
	newTodo.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	// Check if a TodoList exists for the user
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		// Create a new TodoList if it doesn't exist
		newTodoList := models.TodoList{
			ID:        primitive.NewObjectID(),
			UserID:    objID,
			Todos:     []models.Todo{newTodo},
			CreatedAt: primitive.NewDateTimeFromTime(time.Now()),
		}

		_, insertErr := config.TodoCollection.InsertOne(context.Background(), newTodoList)
		if insertErr != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create new todo list"})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Todo list created successfully"})
	}

	// Append the new todo to the existing TodoList
	todoList.Todos = append(todoList.Todos, newTodo)
	_, updateErr := config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if updateErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update todo list"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Todo added successfully"})
}

// UpdateTask updates a specific task within a todo
func UpdateTask(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var taskUpdate struct {
		TodoTitle string             `json:"todo_title"`
		TaskTitle string             `json:"task_title"`
		Completed bool               `json:"completed"`
		DueDate   primitive.DateTime `json:"due_date"`
	}
	if err := c.BodyParser(&taskUpdate); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Fetch the user's TodoList
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

	// Find the Todo and Task to update
	for i, todo := range todoList.Todos {
		if todo.Title == taskUpdate.TodoTitle {
			for j, task := range todo.Tasks {
				if task.Title == taskUpdate.TaskTitle {
					// Update task properties
					todoList.Todos[i].Tasks[j].Completed = taskUpdate.Completed
					todoList.Todos[i].Tasks[j].DueDate = taskUpdate.DueDate
					todoList.Todos[i].UpdatedAt = primitive.NewDateTimeFromTime(time.Now())
					break
				}
			}
		}
	}

	// Update the TodoList in the database
	_, updateErr := config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if updateErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update task"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Task updated successfully"})
}

// DeleteTodo removes a todo from the user's todo list
func DeleteTodo(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	todoTitle := c.Params("title") // This gets the title of the todo from the URL path

	// Log the title for debugging purposes
	fmt.Println("Title from URL:", todoTitle)

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Check if a TodoList exists for the user
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found for user"})
	}

	// Log the entire todos list for debugging purposes
	fmt.Println("Todos list:", todoList.Todos)

	// Find the todo by title and remove it from the todos array
	var todoIndex int
	todoFound := false
	for i, todo := range todoList.Todos {
		if todo.Title == todoTitle {
			todoIndex = i
			todoFound = true
			break
		}
	}

	if !todoFound {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo not found"})
	}

	// Remove the todo from the list
	todoList.Todos = append(todoList.Todos[:todoIndex], todoList.Todos[todoIndex+1:]...)

	// Update the todo list in the database
	_, updateErr := config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if updateErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete todo"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Todo deleted successfully"})
}

// DeleteTask removes a task from a todo
func DeleteTask(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	todoTitle := c.Params("todo_title")
	taskTitle := c.Params("task_title")

	// Fetch the user's TodoList
	var todoList models.TodoList
	err = config.TodoCollection.FindOne(context.Background(), bson.M{"user_id": objID}).Decode(&todoList)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

	// Find the Todo and Task to remove
	for i, todo := range todoList.Todos {
		if todo.Title == todoTitle {
			for j, task := range todo.Tasks {
				if task.Title == taskTitle {
					todoList.Todos[i].Tasks = append(todoList.Todos[i].Tasks[:j], todoList.Todos[i].Tasks[j+1:]...)
					break
				}
			}
		}
	}

	// Update the TodoList in the database
	_, updateErr := config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": objID},
		bson.M{"$set": bson.M{"todos": todoList.Todos}},
	)
	if updateErr != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete task"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Task deleted successfully"})
}
