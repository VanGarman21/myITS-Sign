import React, { useState, useCallback } from "react";
import { FiUploadCloud, FiFile } from "react-icons/fi";
import styles from "../styles/DocumentUpload.module.css";

const DocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Hanya format PDF yang diperbolehkan");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }
    setFile(file);
    setError("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileChange(droppedFile);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFileChange(e.target.files[0]);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Verifikasi Dokumen</h2>

      <div
        className={styles.dropzone}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <div className={styles.uploadContent}>
          <FiUploadCloud className={styles.uploadIcon} />
          <div className={styles.textGroup}>
            <p className={styles.mainText}>Seret file PDF kesini atau</p>
            <label className={styles.browseButton}>
              Pilih File
              <input
                type="file"
                accept=".pdf"
                onChange={handleInputChange}
                hidden
              />
            </label>
          </div>
          <p className={styles.hintText}>Ukuran maksimal: 10MB</p>
        </div>
      </div>

      {file && (
        <div className={styles.filePreview}>
          <FiFile className={styles.fileIcon} />
          <span className={styles.fileName}>{file.name}</span>
        </div>
      )}

      {error && <p className={styles.errorMessage}>{error}</p>}

      <button
        className={styles.submitButton}
        disabled={!file}
        onClick={() => file && console.log("Proses dokumen:", file.name)}
      >
        Verifikasi 
      </button>
    </div>
  );
};

export default DocumentUpload;
