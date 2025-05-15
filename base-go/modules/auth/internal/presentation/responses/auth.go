package responses

type User struct {
	Sub               string `json:"sub" example:"00000000-0000-0000-0000-000000000000"`
	Name              string `json:"name" example:"Mahasiswa ITS"`
	Email             string `json:"email" example:"5025201000@student.its.ac.id"`
	PreferredUsername string `json:"preferred_username" example:"5025201000@student.its.ac.id"`
	Picture           string `json:"picture" example:"https://my.its.ac.id/picture/00000000-0000-0000-0000-000000000000"`
	Roles             []Role `json:"roles"`
}

type Role struct {
	Id          string   `json:"id" example:"mahasiswa"`
	Name        string   `json:"name" example:"Mahasiswa"`
	Permissions []string `json:"permissions"`
}
