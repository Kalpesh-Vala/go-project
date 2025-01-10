package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/golang-jwt/jwt"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	ID       string `json:"id," bson:"_id,omitempty"`
	Email    string `json:"email" bson:"email"`
	Password string `json:"password" bson:"password"`
}

var userCollection *mongo.Collection
var jwtSecret = "thisismysecurekey"

func main() {

	// Load environment variables
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Connect to MongoDB
	MONGODB_URI := os.Getenv("MONGODB_URI")
	clientContext := options.Client().ApplyURI(MONGODB_URI)
	client, err := mongo.Connect(context.Background(), clientContext)

	if err != nil {
		log.Fatal("Error connecting to MongoDB: " + err.Error())
	}

	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Error connecting to MongoDB: " + err.Error())
	}

	fmt.Println("Connected to MongoDB")

	userCollection = client.Database("login-register").Collection("users")

	// Create a new Fiber app
	app := fiber.New()

	// Apply CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Allow all origins, adjust this for production
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Post("/register", Register)
	app.Post("/login", Login)
	app.Get("/users", GetUser)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Fatal(app.Listen("0.0.0.0:" + port))
}

func GetUser(c *fiber.Ctx) error {
	var users []User
	cursor, err := userCollection.Find(context.Background(), bson.M{})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in fetching users"})
	}

	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var user User
		if err := cursor.Decode(&user); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error in fetching users"})
		}
		users = append(users, user)
	}

	return c.JSON(users)
}

func Register(c *fiber.Ctx) error {
	var data User

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Input"})
	}

	if data.Email == "" || data.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Email and Password Required"})
	}

	var user User
	err := userCollection.FindOne(context.Background(), bson.M{"email": data.Email}).Decode(&user)

	if err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "User already exists"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to hash password"})
	}

	data.Password = string(hashedPassword)

	_, err = userCollection.InsertOne(context.Background(), data)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to insert data"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User Created Successfully"})
}

func Login(c *fiber.Ctx) error {
	var data User

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Input"})
	}

	var user User
	err := userCollection.FindOne(context.Background(), bson.M{"email": data.Email}).Decode(&user)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid Password"})
	}

	// JWT token
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["email"] = user.Email
	claims["exp"] = time.Now().Add(time.Hour * 72).Unix()

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to generate token"})
	}

	return c.JSON(fiber.Map{"token": tokenString})
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
