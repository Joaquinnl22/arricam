package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ResumenDiario struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Fecha             time.Time          `bson:"fecha" json:"fecha"`
	Disponible        int                `bson:"disponible" json:"disponible"`
	Arriendado        int                `bson:"arriendado" json:"arriendado"`
	StockTotal        int                `bson:"stockTotal" json:"stockTotal"`
	GeneradoAutomaticamente bool         `bson:"generadoAutomaticamente" json:"generadoAutomaticamente"`
}
