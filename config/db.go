package config

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var UserCollection *mongo.Collection

func ConnectDB() {
	MONGODB_URI := os.Getenv("MONGODB_URI")
	clientContext := options.Client().ApplyURI(MONGODB_URI)
	var err error
	Client, err = mongo.Connect(context.Background(), clientContext)
	if err != nil {
		log.Fatal("Error connecting to MongoDB: " + err.Error())
	}

	err = Client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Error connecting to MongoDB: " + err.Error())
	}

	log.Println("Connected to MongoDB")
	UserCollection = Client.Database("login-register").Collection("users")
}
