# Project Title

Base Project Go

## Description

Aplikasi web menggunakan framework [ITS Go](https://github.com/dptsi/its-go) yang dapat digunakan sebagai rujukan atau basis pengembangan aplikasi web yang lain.

## Getting Started

### Dependencies

- Disarankan menggunakan WSL2 dengan distro Ubuntu 22.04
- [Go](https://go.dev/doc/install)

### Installing

1. Clone repository

   Repository ini menggunakan git submodules sehingga terdapat sedikit perbedaan pada cara clone pada umumnya. Perbedaan tersebut berupa adanya argumen `--recurse-submodules`:

   ```bash
   git clone --recurse-submodules git@bitbucket.org:dptsi/base-go.git
   ```

### Executing program

1. Copy .env.example ke .env
   ```bash
   cp .env.example .env
   ```
2. Set up environment variable untuk OpenID Connect (Bisa didapatkan dari Secman)
   ```bash
   # Dapat dari Secman
   OIDC_PROVIDER=
   OIDC_CLIENT_ID=
   OIDC_CLIENT_SECRET=
   OIDC_REDIRECT_URL=
   OIDC_POST_LOGOUT_REDIRECT_URI=
   # Scope minimal yang diperlukan adalah "openid email profile resource role"
   OIDC_SCOPES="openid email profile resource role"
   ```
3. Generate key
   ```bash
   go run script/script.go key:generate
   ```
4. Atur konfigurasi koneksi database default
   ```bash
   DB_DRIVER=
   DB_HOST=
   DB_PORT=
   DB_DATABASE=
   DB_USER=
   DB_PASSWORD=
   # Jika belum ada database dan ingin mencoba2 dapat menggunakan driver sqlite
   DB_DRIVER=sqlite
   DB_HOST=
   DB_PORT=
   DB_DATABASE=./db.sqlite # File ini akan dibuat secara otomatis
   DB_USER=
   DB_PASSWORD=
   ```
5. Jalankan server.
   ```bash
   # Menjalankan server pada port 8080 (secara default)
   go run main.go
   # Menjalankan server pada port lain
   PORT=1111 go run main.go
   ```
6. Dokumentasi API dapat diakses melalui `/swagger/index.html` (Pastikan `APP_ENV` bernilai `local`).

## VersiDB API

Endpoint untuk mengelola versi database (`versi_db`).

- **GET /api/versidb**
  - List versi database (pagination: `page`, `limit`)
- **GET /api/versidb/:id**
  - Ambil detail versi database berdasarkan ID
- **POST /api/versidb**
  - Tambah versi database baru
  - Body JSON:
    ```json
    {
      "id_versi": "string",
      "tanggal": "2024-06-01T00:00:00Z"
    }
    ```
- **PUT /api/versidb/:id**
  - Update versi database berdasarkan ID
  - Body JSON sama seperti POST
- **DELETE /api/versidb/:id**
  - Hapus versi database berdasarkan ID

Contoh response sukses:

```json
{
  "id_versi": "v1.0.0",
  "tanggal": "2024-06-01T00:00:00Z"
}
```

## Help

1. Jika mendapatkan error `
