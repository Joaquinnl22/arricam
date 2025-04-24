package config

import (
	"context"
	"log"
	"os"
	"time"

	// "github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectDB() {
	// // Cargar variables del archivo .env.local
	// err := godotenv.Load(".env.local")

	// if err != nil {
	// 	log.Fatal("Error cargando .env.local:", err)
	// }

	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI no está definido en el .env.local")
	}
	log.Println("🔌 Conectando a Mongo URI:", mongoURI)

	clientOptions := options.Client().ApplyURI(mongoURI)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Error conectando a MongoDB:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("No se pudo hacer ping a MongoDB:", err)
	}

	DB = client.Database("test") 
	log.Println("✅ Conectado a MongoDB")
}
