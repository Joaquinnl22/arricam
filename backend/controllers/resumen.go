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

func contarCantidadPorEstado(ctx context.Context, collection *mongo.Collection, estado string) (int64, error) {
	matchStage := bson.D{{"$match", bson.D{{"estado", estado}}}}
	groupStage := bson.D{{"$group", bson.D{{"_id", nil}, {"total", bson.D{{"$sum", "$cantidad"}}}}}}

	cursor, err := collection.Aggregate(ctx, mongo.Pipeline{matchStage, groupStage})
	if err != nil {
		return 0, err
	}
	defer cursor.Close(ctx)

	var result []bson.M
	if err = cursor.All(ctx, &result); err != nil || len(result) == 0 {
		return 0, nil
	}

	return result[0]["total"].(int64), nil
}

func GenerarResumenDiario(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("items")
	resumenCollection := config.DB.Collection("resumenes")

	var disponible, arriendo, ocupado, total int64
	var err error

	// Sumar la cantidad total por estado
	disponible, _ = contarCantidadPorEstado(ctx, collection, "disponible")
	arriendo, _ = contarCantidadPorEstado(ctx, collection, "arriendo")
	ocupado, _ = contarCantidadPorEstado(ctx, collection, "ocupado")

	// Sumar el total general de todos los estados
	cursor, err := collection.Aggregate(ctx, mongo.Pipeline{
		bson.D{{"$group", bson.D{{"_id", nil}, {"total", bson.D{{"$sum", "$cantidad"}}}}}},
	})
	if err == nil {
		var result []bson.M
		if cursor.All(ctx, &result) == nil && len(result) > 0 {
			total = result[0]["total"].(int64)
		}
	}

	// Crear el resumen con arriendo y ocupado juntos
	resumen := models.ResumenDiario{
		Fecha:                   time.Now().AddDate(0, 0, -1), // Día anterior
		Disponible:              int(disponible),
		Arriendado:              int(arriendo + ocupado),
		StockTotal:              int(total),
		GeneradoAutomaticamente: true,
	}

	_, err = resumenCollection.InsertOne(ctx, resumen)
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
