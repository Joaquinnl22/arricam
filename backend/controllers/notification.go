package controllers

import (
	"encoding/json"
	"log"

	webpush "github.com/SherClockHolmes/webpush-go"
)

var vapidPublicKey = "AQUI_TU_PUBLIC_KEY"
var vapidPrivateKey = "AQUI_TU_PRIVATE_KEY"

type Subscription struct {
	Endpoint       string `json:"endpoint"`
	ExpirationTime *int   `json:"expirationTime"`
	Keys           struct {
		P256dh string `json:"p256dh"`
		Auth   string `json:"auth"`
	} `json:"keys"`
}package controllers

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"backend/config"
	"backend/models"

	webpush "github.com/SherClockHolmes/webpush-go"
)

var vapidPublicKey = "TU_PUBLIC_KEY"
var vapidPrivateKey = "TU_PRIVATE_KEY"

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
