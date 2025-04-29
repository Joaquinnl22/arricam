package controllers

import (
	"context"
	"encoding/json"
	"log"
	"time"
	"os"
	"net/http"

	"backend/config"
	"backend/models"
	"go.mongodb.org/mongo-driver/bson"
	

	webpush "github.com/SherClockHolmes/webpush-go"
)



type Subscription struct {
	Endpoint       string `json:"endpoint"`
	ExpirationTime *int   `json:"expirationTime"`
	Keys           struct {
		P256dh string `json:"p256dh"`
		Auth   string `json:"auth"`
	} `json:"keys"`
}

// Enviar notificación a una sola suscripción
func EnviarNotificacion(subscription models.Subscription, titulo, mensaje string) {
	
	vapidPrivateKey := os.Getenv("VAPID_PRIVATE_KEY")
	vapidPublicKey := os.Getenv("VAPID_PUBLIC_KEY")

	sub := &webpush.Subscription{
		Endpoint: subscription.Endpoint,
		Keys: webpush.Keys{
			P256dh: subscription.Keys.P256dh,
			Auth:   subscription.Keys.Auth,
		},
	}

	payload := map[string]string{
		"title": titulo,
		"body":  mensaje,
	}
	payloadBytes, _ := json.Marshal(payload)

	resp, err := webpush.SendNotification(payloadBytes, sub, &webpush.Options{
		Subscriber:      "mailto:tu-correo@correo.com",
		VAPIDPublicKey:  vapidPublicKey,
		VAPIDPrivateKey: vapidPrivateKey,
		TTL:             30,
	})
	if err != nil {
		log.Println("❌ Error enviando notificación:", err)
		return
	}
	defer resp.Body.Close()

	log.Println("✅ Notificación enviada:", resp.Status)
}

// Obtener todas las suscripciones
func GetAllSubscriptions() ([]models.Subscription, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("subscriptions")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var subscriptions []models.Subscription
	if err := cursor.All(ctx, &subscriptions); err != nil {
		return nil, err
	}

	return subscriptions, nil
}


func Subscribe(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var sub models.Subscription
	if err := json.NewDecoder(r.Body).Decode(&sub); err != nil {
		http.Error(w, "Error al decodificar suscripción", http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("subscriptions")
	_, err := collection.InsertOne(ctx, sub)
	if err != nil {
		http.Error(w, "Error guardando suscripción", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Suscripción guardada",
	})
}
