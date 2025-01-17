package controllers

import (
	"context"

	"github.com/Kalpesh-Vala/go-project/config"
	"github.com/Kalpesh-Vala/go-project/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

func GetUser(c *fiber.Ctx) error {
	var users []models.User
	cursor, err := config.UserCollection.Find(context.Background(), bson.M{})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in fetching users"})
	}

	defer cursor.Close(context.Background())
	for cursor.Next(context.Background()) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in fetching users"})
		}
		users = append(users, user)
	}

	return c.JSON(users)
}
