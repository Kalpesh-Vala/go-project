package controllers

import (
	"context"
	"time"

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

// Helper: Update TodoList in database
func updateTodoList(userID primitive.ObjectID, todos []models.Todo) error {
	_, err := config.TodoCollection.UpdateOne(
		context.Background(),
		bson.M{"user_id": userID},
		bson.M{"$set": bson.M{"todos": todos}},
	)
	return err
}

// GetTodos fetches all todos for a specific user
func GetTodos(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	todoList, err := fetchTodoList(objID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "No todos found for this user"})
	}

	return c.JSON(todoList)
}

// CreateTodo adds a new todo item to the user's todo list
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

	newTodo.Completed = false
	newTodo.UpdatedAt = primitive.NewDateTimeFromTime(time.Now())

	todoList, err := fetchTodoList(objID)
	if err != nil {
		// Create a new TodoList if none exists
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

	todoList.Todos = append(todoList.Todos, newTodo)
	if err := updateTodoList(objID, todoList.Todos); err != nil {
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

	todoList, err := fetchTodoList(objID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

	for i, todo := range todoList.Todos {
		if todo.Title == taskUpdate.TodoTitle {
			for j, task := range todo.Tasks {
				if task.Title == taskUpdate.TaskTitle {
					todoList.Todos[i].Tasks[j].Completed = taskUpdate.Completed
					todoList.Todos[i].Tasks[j].DueDate = taskUpdate.DueDate
					todoList.Todos[i].UpdatedAt = primitive.NewDateTimeFromTime(time.Now())
					break
				}
			}
		}
	}

	if err := updateTodoList(objID, todoList.Todos); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update task"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Task updated successfully"})
}

// DeleteTodo removes a todo from the user's todo list
func DeleteTodo(c *fiber.Ctx) error {
	userID := c.Query("user_id")
	todoTitle := c.Params("title")

	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	todoList, err := fetchTodoList(objID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found for user"})
	}

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

	todoList.Todos = append(todoList.Todos[:todoIndex], todoList.Todos[todoIndex+1:]...)
	if err := updateTodoList(objID, todoList.Todos); err != nil {
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

	todoList, err := fetchTodoList(objID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Todo list not found"})
	}

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

	if err := updateTodoList(objID, todoList.Todos); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete task"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Task deleted successfully"})
}
