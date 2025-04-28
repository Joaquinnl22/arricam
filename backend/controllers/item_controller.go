package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
	"regexp"
	//"mime/multipart"
	"path/filepath"
	"net/url"
	"encoding/csv"
	"bytes"

	"backend/config"
	"backend/models"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	openapi "github.com/twilio/twilio-go/rest/api/v2010"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

)
func UpdateItem(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	var tipo, title, descripcion, estado, nuevoEstado, arrendadoPor string
	var cantidad int
	var imagenes []string

	contentType := r.Header.Get("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		err := r.ParseMultipartForm(20 << 20) // 20 MB
		if err != nil {
			http.Error(w, "Error procesando el formulario", http.StatusBadRequest)
			return
		}

		tipo = r.FormValue("tipo")
		title = r.FormValue("title")
		descripcion = r.FormValue("descripcion")
		estado = r.FormValue("estado")
		nuevoEstado = r.FormValue("nuevoEstado")
		arrendadoPor = r.FormValue("arrendadoPor")
		cantidad, _ = strconv.Atoi(r.FormValue("cantidad"))

		files := r.MultipartForm.File["imagenes"]
		for _, fileHeader := range files {
			file, err := fileHeader.Open()
			if err != nil {
				continue
			}
			defer file.Close()
			data, _ := io.ReadAll(file)

			upload, err := config.CloudinaryClient.Upload.Upload(context.Background(), data, uploader.UploadParams{
				Folder: "items",
			})
			if err == nil {
				imagenes = append(imagenes, upload.SecureURL)
			}
		}
	} else if strings.Contains(contentType, "application/json") {
		var body struct {
			Tipo         string   `json:"tipo"`
			Title        string   `json:"title"`
			Descripcion  string   `json:"descripcion"`
			Estado       string   `json:"estado"`
			NuevoEstado  string   `json:"nuevoEstado"`
			Cantidad     int      `json:"cantidad"`
			ArrendadoPor string   `json:"arrendadoPor"`
			Imagenes     []string `json:"imagenes"`
		}
		err := json.NewDecoder(r.Body).Decode(&body)
		if err != nil {
			http.Error(w, "JSON inválido", http.StatusBadRequest)
			return
		}

		tipo = body.Tipo
		title = body.Title
		descripcion = body.Descripcion
		estado = body.Estado
		nuevoEstado = body.NuevoEstado
		cantidad = body.Cantidad
		arrendadoPor = body.ArrendadoPor
		imagenes = body.Imagenes
	} else {
		http.Error(w, "Formato no soportado", http.StatusUnsupportedMediaType)
		return
	}

	if tipo == "" || title == "" || descripcion == "" || estado == "" || nuevoEstado == "" || cantidad <= 0 {
		http.Error(w, "Faltan campos obligatorios", http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("items")

	// Buscar ítem original
	var currentItem models.Item
	err := collection.FindOne(ctx, bson.M{
		"tipo":        tipo,
		"title":       title,
		"descripcion": descripcion,
		"estado":      estado,
	}).Decode(&currentItem)
	if err != nil {
		http.Error(w, "Ítem original no encontrado", http.StatusNotFound)
		return
	}

	if cantidad > currentItem.Cantidad {
		http.Error(w, "Cantidad excede la disponible", http.StatusBadRequest)
		return
	}

	// Buscar ítem con nuevo estado
	var targetItem models.Item
	err = collection.FindOne(ctx, bson.M{
		"tipo":        tipo,
		"title":       title,
		"descripcion": descripcion,
		"estado":      nuevoEstado,
	}).Decode(&targetItem)

	now := time.Now() // guardamos el tiempo actual

	if err == nil {
		// Ya existe → actualizar cantidad e imágenes
		update := bson.M{
			"$inc": bson.M{"cantidad": cantidad},
			"$addToSet": bson.M{"imagenes": bson.M{
				"$each": imagenes,
			}},
			"$set": bson.M{
				"updatedAt": now,
			},
		}
		if nuevoEstado == "arriendo" && arrendadoPor != "" {
			update["$set"].(bson.M)["arrendadoPor"] = arrendadoPor
		}
		_, _ = collection.UpdateOne(ctx, bson.M{"_id": targetItem.ID}, update)
	} else {
		// No existe → crear nuevo
		newItem := models.Item{
			Tipo:         tipo,
			Title:        title,
			Descripcion:  descripcion,
			Estado:       nuevoEstado,
			Cantidad:     cantidad,
			Imagenes:     imagenes,
			ArrendadoPor: arrendadoPor,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		_, _ = collection.InsertOne(ctx, newItem)
	}

	// Resta del ítem original
	newCantidad := currentItem.Cantidad - cantidad
	if newCantidad <= 0 {
		_, _ = collection.DeleteOne(ctx, bson.M{"_id": currentItem.ID})
	} else {
		_, _ = collection.UpdateOne(ctx, bson.M{"_id": currentItem.ID}, bson.M{
			"$set": bson.M{
				"cantidad":  newCantidad,
				"imagenes":  append(currentItem.Imagenes, imagenes...),
				"updatedAt": now,
			},
		})
	}

	// Enviar WhatsApp vía Twilio
	body := fmt.Sprintf("✏️ Ítem modificado:\n📦 %s\n➡️ De \"%s\" a \"%s\"\n🔢 Cantidad: %d", title, estado, nuevoEstado, cantidad)
	if nuevoEstado == "arriendo" && arrendadoPor != "" {
		body += fmt.Sprintf("\n🙋 Arrendado por: %s", arrendadoPor)
	}

	params := &openapi.CreateMessageParams{}
	params.SetTo("whatsapp:" + config.TwilioTo)
	params.SetFrom(config.TwilioFrom)
	params.SetBody(body)

	_, err = config.TwilioClient.Api.CreateMessage(params)
	if err != nil {
		log.Println("❌ Error Twilio:", err)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ítem actualizado correctamente",
	})
}


func GetItems(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("items")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		http.Error(w, "Error al obtener ítems", http.StatusInternalServerError)
		log.Println("❌ Error en Find():", err)
		return
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err := cursor.All(ctx, &results); err != nil {
		http.Error(w, "Error al decodificar ítems", http.StatusInternalServerError)
		log.Println("❌ Error en cursor.All():", err)
		return
	}

	log.Printf("✅ Se encontraron %d documentos crudos\n", len(results))
	for _, item := range results {
		log.Println("📦 Documento:", item)
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Println("❌ Error al codificar JSON:", err)
		http.Error(w, "Error al codificar la respuesta", http.StatusInternalServerError)
	}
}


func AddItem(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10MB
	if err != nil {
		http.Error(w, "Error procesando el formulario", http.StatusBadRequest)
		return
	}

	item := models.Item{
		Tipo:         r.FormValue("tipo"),
		Title:        r.FormValue("title"),
		Descripcion:  r.FormValue("descripcion"),
		Estado:       r.FormValue("estado"),
		ArrendadoPor: r.FormValue("arrendadoPor"),
	}

	cantidad, _ := strconv.Atoi(r.FormValue("cantidad"))
	item.Cantidad = cantidad

	// Subir imagen (si existe)
	var imagenes []string

	formdata := r.MultipartForm
	files := formdata.File["imagen"]
	
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			log.Println("⚠️ Error abriendo archivo:", err)
			continue
		}
		defer file.Close()
	
		upload, err := config.CloudinaryClient.Upload.Upload(context.Background(), file, uploader.UploadParams{
			Folder:   "items",
			PublicID: strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename)),
		})
		if err != nil {
			log.Println("❌ Error subiendo a Cloudinary:", err)
		} else {
			log.Println("✅ Imagen subida a Cloudinary:", upload.SecureURL)
			imagenes = append(imagenes, upload.SecureURL)
		}
	}
	
	item.Imagenes = imagenes
	
	


	// Guardar en MongoDB
	collection := config.DB.Collection("items")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, item)
	item.CreatedAt = time.Now()
	item.UpdatedAt = time.Now()

	if err != nil {
		http.Error(w, "Error guardando item", http.StatusInternalServerError)
		return
	}

	// Enviar WhatsApp con Twilio
	body := fmt.Sprintf("🆕 Nuevo item agregado:\n📦 %s\n📝 %s\n📍 Estado: %s\n🔢 Cantidad: %d",
		item.Title, item.Descripcion, item.Estado, item.Cantidad)

	params := &openapi.CreateMessageParams{}
	params.SetTo("whatsapp:" + config.TwilioTo)
	params.SetFrom(config.TwilioFrom)
	params.SetBody(body)

	message, err := config.TwilioClient.Api.CreateMessage(params)
	if err != nil {
		log.Println("❌ Error enviando WhatsApp:", err)
	} else {
		log.Printf("✅ Mensaje enviado con SID: %s\n", *message.Sid)
	}
	
	

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Item agregado con éxito",
		"data":    item,
	})
}


func DeleteItemCantidad(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var body struct {
		ID               string `json:"id"`
		CantidadEliminar int    `json:"cantidadEliminar"`
	}

	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if body.ID == "" || body.CantidadEliminar <= 0 {
		http.Error(w, "Se requieren 'id' y 'cantidadEliminar'", http.StatusBadRequest)
		return
	}

	// Convertir ID a ObjectID
	objectID, err := primitive.ObjectIDFromHex(body.ID)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	collection := config.DB.Collection("items")

	// Buscar ítem
	var item models.Item
	err = collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&item)
	if err != nil {
		http.Error(w, "Ítem no encontrado", http.StatusNotFound)
		return
	}
	log.Println("📸 Imagen única:", item.Imagen)
	log.Println("🖼️ Lista de imágenes:", item.Imagenes)

	nuevaCantidad := item.Cantidad - body.CantidadEliminar

	if nuevaCantidad > 0 {
		_, err = collection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{
			"$set": bson.M{"cantidad": nuevaCantidad},
		})
		if err != nil {
			http.Error(w, "Error al actualizar", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":       "Cantidad actualizada",
			"nuevaCantidad": nuevaCantidad,
		})
		return
	}

	// Eliminar imágenes de Cloudinary si existen
	var urlsAEliminar []string
	if len(item.Imagenes) > 0 {
		urlsAEliminar = append(urlsAEliminar, item.Imagenes...)
	}
	if item.Imagen != "" {
		urlsAEliminar = append(urlsAEliminar, item.Imagen)
	}

	if len(urlsAEliminar) > 0 {
		err := eliminarImagenesDeCloudinary(urlsAEliminar)
		if err != nil {
			log.Println("❌ Error eliminando imágenes:", err)
		}
	}

	// Eliminar ítem
	_, err = collection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil {
		http.Error(w, "Error al eliminar ítem", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Ítem eliminado completamente",
	})
}
func eliminarImagenesDeCloudinary(urls []string) error {
	for _, imageURL := range urls { // <- renombramos aquí para evitar conflicto con el paquete "url"
		log.Println("🔗 URL original:", imageURL)

		re := regexp.MustCompile(`/upload/(?:v[0-9]+/)?(.+?)(?:\.[a-zA-Z]{3,4})$`)
		matches := re.FindStringSubmatch(imageURL)

		if len(matches) >= 2 {
			publicID := matches[1]
			publicIDDecoded, err := url.QueryUnescape(publicID) // ahora sí usamos el paquete url correctamente
			if err != nil {
				log.Println("❌ Error decodificando publicID:", err)
				publicIDDecoded = publicID
			}

			resp, err := config.CloudinaryClient.Upload.Destroy(context.Background(), uploader.DestroyParams{
				PublicID: publicIDDecoded,
			})
			if err != nil {
				log.Println("❌ Error eliminando imagen en Cloudinary:", publicIDDecoded, err)
			} else {
				log.Println("✅ Imagen eliminada de Cloudinary:", publicIDDecoded, "→ Resultado:", resp.Result)
			}
		} else {
			log.Println("⚠️ No se pudo extraer publicID de la URL:", imageURL)
		}
	}
	return nil
}

func GetLastChanges(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := config.DB.Collection("items")

	opts := options.Find()
	opts.SetSort(bson.D{{"updatedAt", -1}})
	opts.SetLimit(10)

	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		http.Error(w, "Error al obtener cambios recientes", http.StatusInternalServerError)
		log.Println("❌ Error en Find():", err)
		return
	}
	defer cursor.Close(ctx)

	var changes []models.Item
	if err := cursor.All(ctx, &changes); err != nil {
		http.Error(w, "Error al decodificar cambios", http.StatusInternalServerError)
		log.Println("❌ Error en cursor.All():", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(changes)
}
