package config

import (
	"log"
	"os"

	twilio "github.com/twilio/twilio-go"
)

var TwilioClient *twilio.RestClient
var TwilioFrom string
var TwilioTo string

func ConnectTwilio() {
	TwilioClient = twilio.NewRestClient()
	TwilioFrom = "whatsapp:+14155238886"
	TwilioTo = os.Getenv("TWILIO_WHATSAPP_TO")
	if TwilioTo == "" {
		log.Println("⚠️ TWILIO_WHATSAPP_TO no está definido")
	}
	log.Println("✅ Conectado a Twilio")
}
