package config

import (
	//"context"
	"log"
	"os"

	"github.com/cloudinary/cloudinary-go/v2"
)

var CloudinaryClient *cloudinary.Cloudinary

func InitCloudinary() {
	cld, err := cloudinary.NewFromParams(
		os.Getenv("CLOUDINARY_CLOUD_NAME"),
		os.Getenv("CLOUDINARY_API_KEY"),
		os.Getenv("CLOUDINARY_API_SECRET"),
	)
	if err != nil {
		log.Fatal("❌ Error al conectar a Cloudinary:", err)
	}
	CloudinaryClient = cld
	log.Println("✅ Cloudinary configurado correctamente")
}
