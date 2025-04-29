package models

type Subscription struct {
	Endpoint string `bson:"endpoint"`
	Keys     struct {
		P256dh string `bson:"p256dh"`
		Auth   string `bson:"auth"`
	} `bson:"keys"`
}
