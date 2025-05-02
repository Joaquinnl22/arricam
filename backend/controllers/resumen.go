package controllers

import (
	"context"
	"net/http"
	"time"
	"encoding/json"
	

	"backend/config"
	"backend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

)

func GenerarResumenDiario(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("items")
	resumenCollection := config.DB.Collection("resumenes")

	var disponible, arriendo, total int64

	disponible, _ = collection.CountDocuments(ctx, bson.M{"estado": "disponible"})
	arriendo, _ = collection.CountDocuments(ctx, bson.M{"estado": "arriendo"})
	total, _ = collection.CountDocuments(ctx, bson.M{})

	resumen := models.ResumenDiario{
		Fecha:                time.Now().AddDate(0, 0, -1), // Día anterior
		Disponible:           int(disponible),
		Arriendado:           int(arriendo),
		StockTotal:           int(total),
		GeneradoAutomaticamente: true,
	}

	_, err := resumenCollection.InsertOne(ctx, resumen)
	if err != nil {
		http.Error(w, "Error al guardar resumen", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resumen)
}
func ObtenerResumenes(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("resumenes")

	opts := options.Find()
	opts.SetSort(bson.D{{"fecha", -1}}) // del más reciente al más antiguo
	opts.SetLimit(1)                    // solo el resumen del día anterior

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		http.Error(w, "Error al obtener resumen", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var resumenes []models.ResumenDiario
	if err := cursor.All(ctx, &resumenes); err != nil {
		http.Error(w, "Error al procesar datos", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resumenes)
}
