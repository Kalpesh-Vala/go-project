package main

import (
	"log"
	"os"

	"github.com/Kalpesh-Vala/go-project/config"
	"github.com/Kalpesh-Vala/go-project/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

type User struct {
	ID       string `json:"id," bson:"_id,omitempty"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
}

func main() {

	// Load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to MongoDB
	config.ConnectDB()

	// Create a new Fiber app
	app := fiber.New()

	// Apply CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	log.Println("Server started on http://localhost:5000")
	// Initialize routes
	routes.AuthRoutes(app)
	routes.UserRoutes(app)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	log.Fatal(app.Listen("0.0.0.0:" + port))
}

// func Register(c *fiber.Ctx) error {
// 	var data User

// 	if err := c.BodyParser(&data); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Input"})
// 	}

// 	if data.Email == "" || data.Password == "" {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email and Password Required"})
// 	}

// 	for _, user := range users {
// 		if user.Email == data.Email {
// 			return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "User already exists"})
// 		}
// 	}

// 	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
// 	}

// 	data.Password = string(hashedPassword)
// 	users = append(users, data)

// 	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User Created Successfully"})
// }

// func Login(c *fiber.Ctx) error {
// 	var data User

// 	if err := c.BodyParser(&data); err != nil {
// 		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Input"})
// 	}

// 	var user User
// 	for _, u := range users {
// 		if u.Email == data.Email {
// 			user = u
// 			break
// 		}
// 	}

// 	if user.Email == "" {
// 		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
// 	}

// 	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.Password)); err != nil {
// 		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Password"})
// 	}

// 	// JWT token
// 	token := jwt.New(jwt.SigningMethodHS256)
// 	claims := token.Claims.(jwt.MapClaims)
// 	claims["email"] = user.Email
// 	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

// 	tokenString, err := token.SignedString([]byte(jwtSecret))
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
// 	}

// 	return c.JSON(fiber.Map{"token": tokenString})
// }

// func GetUser(c *fiber.Ctx) error {
// 	return c.JSON(users)
// }
