package routes

import (
	"backend/config"
	"backend/controllers"

	"github.com/gorilla/mux"
)

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	config.ConnectDB()

	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/items", controllers.GetItems).Methods("GET")
	api.HandleFunc("/items", controllers.AddItem).Methods("POST")
	api.HandleFunc("/items", controllers.UpdateItem).Methods("PUT")
	api.HandleFunc("/items/cantidad", controllers.DeleteItemCantidad).Methods("PUT")


	return router
}
