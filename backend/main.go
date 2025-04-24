package main

import (
	"log"
	"net/http"
	
	

	"backend/config"
	"backend/routes"
)

func main() {


	config.ConnectDB()
	config.InitCloudinary()
	config.ConnectTwilio()

	router := routes.SetupRoutes()

	log.Println("Servidor corriendo en http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
