import React, { useState } from "react";
import styles from "../styles/DocumentUpload.module.css";

const VerifyPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setMessage("");
    }
  };

  const getCsrfToken = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/csrf-cookie`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil CSRF token");
      return true;
    } catch (err) {
      setError("Gagal mempersiapkan verifikasi");
      return false;
    }
  };

  const handleVerification = async () => {
    if (!selectedFile) {
      setError("Silakan pilih dokumen terlebih dahulu");
      return;
    }

    const csrfReady = await getCsrfToken();
    if (!csrfReady) return;

    setIsLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-document`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
          headers: {
            "X-CSRF-Token": getCsrfTokenFromCookie(),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memverifikasi dokumen");
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat verifikasi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getCsrfTokenFromCookie = () => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "CSRF-TOKEN") {
        return decodeURIComponent(value);
      }
    }
    return "";
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Verifikasi Dokumen</h1>

      <div className={styles.dropzone}>
        <div className={styles.uploadContent}>
          <input
            type="file"
            id="document-upload"
            onChange={handleFileSelect}
            className={styles.hiddenInput}
            accept=".pdf"
          />
          <label htmlFor="document-upload" className={styles.browseButton}>
            Pilih Dokumen
          </label>
          {selectedFile && (
            <div className={styles.filePreview}>
              <span className={styles.fileName}>{selectedFile.name}</span>
            </div>
          )}
          <p className={styles.hintText}>Format yang didukung: PDF</p>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {message && <div className={styles.successMessage}>{message}</div>}

      <button
        onClick={handleVerification}
        className={styles.submitButton}
        disabled={!selectedFile || isLoading}
      >
        {isLoading ? "Memproses..." : "Verifikasi Dokumen"}
      </button>
    </div>
  );
};

export default VerifyPage;
