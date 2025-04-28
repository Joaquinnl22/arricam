package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Item struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Tipo         string             `bson:"tipo" json:"tipo"`
	Title        string             `bson:"title" json:"title"`
	Descripcion  string             `bson:"descripcion" json:"descripcion"`
	Estado       string             `bson:"estado" json:"estado"`
	Cantidad     int                `bson:"cantidad" json:"cantidad"`
	Imagen       string             `bson:"imagen,omitempty" json:"imagen,omitempty"`
	Imagenes     []string           `bson:"imagenes,omitempty" json:"imagenes,omitempty"`
	ArrendadoPor string             `bson:"arrendadoPor" json:"arrendadoPor"`
	CreatedAt    time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time          `bson:"updatedAt" json:"updatedAt"`
}
