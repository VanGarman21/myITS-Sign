import React, { useState, useRef } from "react";
import styles from "../../styles/DocumentUpload.module.css";
import PageTransition from "@/components/PageLayout";

const MAX_FILE_SIZE_MB = 10;

const VerifyPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null); // result dari backend
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError("Ukuran file melebihi 10 MB");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
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
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await fetch(
        "http://localhost:8080/api/verify-document",
        {
          method: "POST",
          body: formData,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        setError("Response dari server tidak valid atau bukan JSON.");
        setIsLoading(false);
        return;
      }
      if (result.success) {
        setResult(result.data);
      } else {
        setError(result.message || "Verifikasi gagal");
      }
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

  // Helper untuk status
  const isValid = result && result.status === "valid";
  const isInvalid = result && result.status === "invalid";

  return (
    <PageTransition pageTitle="Verifikasi Dokumen">
      {/* Judul utama */}
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          margin: "2.5rem auto 1.5rem auto",
          padding: "0 1rem",
        }}
      ></div>
      {/* Panel 1: Form Upload */}
      <div
        className={styles.container}
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "2.5rem 2rem 2rem 2rem",
          borderRadius: 16,
        }}
      >
        <h2
          className={styles.title}
          style={{ fontSize: 20, fontWeight: 600, marginBottom: 18 }}
        >
          Pilih Dokumen Anda
        </h2>
        <div className={styles.flexRow} style={{ gap: 12 }}>
          <div className={styles.inputGroup} style={{ minWidth: 0 }}>
            <input
              type="text"
              value={selectedFile ? selectedFile.name : ""}
              placeholder="Pilih"
              readOnly
              className={styles.inputText}
              style={{ minWidth: 0 }}
            />
            <input
              type="file"
              id="document-upload"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className={styles.hiddenInput}
              accept=".pdf"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={styles.cariButton}
              style={{ borderRadius: "0 8px 8px 0" }}
            >
              Cari
            </button>
          </div>
          <button
            onClick={handleVerification}
            className={styles.submitButton}
            disabled={!selectedFile || isLoading}
            style={{ minWidth: 120 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg
                width="20"
                height="20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 10h10m0 0l-4-4m4 4l-4 4"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isLoading ? "Memproses..." : "Proses"}
            </span>
          </button>
        </div>
        <div
          className={styles.hintText}
          style={{ marginTop: 8, marginLeft: 2 }}
        >
          Hanya dapat mengunggah berkas dengan format <b>.pdf</b>
          <br />
          Ukuran maksimum berkas : 10 MB
        </div>
        {error && !result && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {/* Panel Hasil Verifikasi modern & responsif */}
      {(result || (error && selectedFile)) && (
        <div className={styles.verifyCardContainer}>
          <div
            className={
              result && result.summary === "VALID"
                ? `${styles.verifyCard} ${styles.valid}`
                : `${styles.verifyCard} ${styles.invalid}`
            }
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 32,
              width: "100%",
              maxWidth: 800,
              boxSizing: "border-box",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                minWidth: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={
                  result && result.summary === "VALID"
                    ? "/document-verify.svg"
                    : "/document-not-verify.svg"
                }
                alt={
                  result && result.summary === "VALID" ? "Valid" : "Not Valid"
                }
                style={{ width: 120, height: 120 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div
                className={
                  result && result.summary === "VALID"
                    ? styles.verifyCardTitle + " " + styles.validTitle
                    : styles.verifyCardTitle + " " + styles.invalidTitle
                }
                style={{
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 17,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {result && result.summary === "VALID" ? "✔" : "✖"}
                </span>
                {result?.notes ||
                  (result && result.summary === "VALID"
                    ? "Dokumen valid, Sertifikat yang digunakan terpercaya"
                    : "Dokumen tidak memiliki tandatangan elektronik")}
              </div>
              <div
                className={styles.verifyCardDetail}
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: 16,
                  border: "1px solid #bae6fd",
                }}
              >
                <b style={{ fontSize: 16 }}>Detail Dokumen</b>
                <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7 }}>
                  <div>
                    <b>Nama File :</b>{" "}
                    <span style={{ wordBreak: "break-all" }}>
                      {result?.nama_dokumen}
                    </span>
                  </div>
                  <div>
                    <b>Ukuran :</b>{" "}
                    {result?.size
                      ? `${Math.round(result.size / 1024)} KB`
                      : selectedFile
                      ? `${Math.round(selectedFile.size / 1024)} KB`
                      : "-"}
                  </div>
                  <div>
                    <b>Jumlah Penandatangan :</b>{" "}
                    {result?.jumlah_signature || 0}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <b>Detail Penandatangan :</b>
                  </div>
                  {Array.isArray(result?.details) &&
                  result.details.length > 0 ? (
                    result.details.map((signer: any, idx: number) => (
                      <div
                        className={styles.signerDetail}
                        key={idx}
                        style={{
                          background: "#e0f7fa",
                          borderRadius: 8,
                          padding: "10px 14px",
                          marginTop: 8,
                          fontSize: 14,
                          boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {signer.info_signer?.signer_name}
                        </div>
                        <div
                          style={{ fontSize: 13, color: "#555", marginTop: 2 }}
                        >
                          <b>Info TSA :</b> {signer.info_tsa?.name}
                        </div>
                        <div
                          style={{ fontSize: 13, color: "#555", marginTop: 2 }}
                        >
                          <b>Ditanda tangani pada :</b>{" "}
                          {signer.signature_document?.signed_in}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={styles.signerDetail}
                      style={{ marginTop: 8 }}
                    >
                      Tidak ada penandatangan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default VerifyPage;
