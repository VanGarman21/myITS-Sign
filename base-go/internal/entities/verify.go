package entities

type VerifyDocumentResult struct {
	Status  string      `json:"status"`
	Notes   string      `json:"notes"`
	Summary string      `json:"summary"`
	Signers interface{} `json:"signers"`
}
