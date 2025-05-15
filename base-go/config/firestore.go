package config

import (
	"os"

	"github.com/dptsi/its-go/firestore"
)

func firestoreConfig() firestore.Config {
	return firestore.Config{
		ProjectId: os.Getenv("GOOGLE_PROJECT_ID"),
	}
}
