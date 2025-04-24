package main

import (
	"log"
	"net/http"
	// "github.com/joho/godotenv"
	

	"backend/config"
	"backend/routes"
)

func main() {
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Println("⚠️ No se pudo cargar el archivo .env, se usará el entorno actual")
	// }

	config.ConnectDB()
	config.InitCloudinary()
	config.ConnectTwilio()

	router := routes.SetupRoutes()

	log.Println("Servidor corriendo en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
