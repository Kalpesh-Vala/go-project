package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Task represents a task within a todo
type Task struct {
	Title     string             `json:"title" bson:"title"`
	Completed bool               `json:"completed" bson:"completed"`
	DueDate   primitive.DateTime `json:"due_date" bson:"due_date"`
}

// Todo represents a todo with tasks
type Todo struct {
	Title     string             `json:"title" bson:"title"`
	Completed bool               `json:"completed" bson:"completed"`
	UpdatedAt primitive.DateTime `json:"updated_at" bson:"updated_at"`
	Tasks     []Task             `json:"tasks" bson:"tasks"`
}

// TodoList represents a list of todos for a user
type TodoList struct {
	ID        primitive.ObjectID `json:"_id" bson:"_id"`
	UserID    primitive.ObjectID `json:"user_id" bson:"user_id"`
	Todos     []Todo             `json:"todos" bson:"todos"`
	CreatedAt primitive.DateTime `json:"created_at" bson:"created_at"`
}
