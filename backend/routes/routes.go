package routes

import (
	"net/http"
	"github.com/gorilla/mux"
	"backend/config"
	"backend/controllers"
	
)

// ⬇️ Middleware de CORS
func enableCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*") 
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Si es una solicitud preflight, respondemos de inmediato
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRoutes() *mux.Router {
	router := mux.NewRouter()

	// ⬅️ Aplica CORS
	router.Use(enableCors)

	config.ConnectDB()

	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/items", controllers.GetItems).Methods("GET")
	api.HandleFunc("/items", controllers.AddItem).Methods("POST")
	api.HandleFunc("/items", controllers.UpdateItem).Methods("PUT")
	api.HandleFunc("/items/cantidad", controllers.DeleteItemCantidad).Methods("PUT")
	api.HandleFunc("/items/changes", controllers.GetLastChanges).Methods("GET")
	api.HandleFunc("/subscribe", controllers.Subscribe).Methods("POST")
	api.HandleFunc("/resumenes/generar", controllers.GenerarResumenDiario).Methods("POST")
	api.HandleFunc("/resumenes", controllers.ObtenerResumenes).Methods("GET")



	return router
}
