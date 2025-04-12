package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Item struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Tipo         string             `bson:"tipo" json:"tipo"`
	Title        string             `bson:"title" json:"title"`
	Descripcion  string             `bson:"descripcion" json:"descripcion"`
	Estado       string             `bson:"estado" json:"estado"`
	Cantidad     int                `bson:"cantidad" json:"cantidad"`
	Imagen       string             `bson:"imagen,omitempty" json:"imagen,omitempty"` // aún útil si quieres mantener una sola imagen principal
	Imagenes     []string           `bson:"imagenes,omitempty" json:"imagenes,omitempty"`
	ArrendadoPor string             `bson:"arrendadoPor" json:"arrendadoPor"`
}
