import React, { useRef } from "react";
import { FiUploadCloud } from "react-icons/fi";
import styles from "../styles/DocumentUpload.module.css";

interface SpecimenUploadProps {
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_FORMATS = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const SpecimenUpload: React.FC<SpecimenUploadProps> = ({
  onFileChange,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        alert("Format file tidak didukung. Hanya .jpg/.jpeg/.png");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      onFileChange(file);
    }
  };

  return (
    <div className={styles.dropzone} style={{ marginBottom: 0, minWidth: 300 }}>
      <div className={styles.uploadContent}>
        <FiUploadCloud className={styles.uploadIcon} />
        <div className={styles.textGroup}>
          <p className={styles.mainText}>Seret file gambar ke sini atau</p>
          <button
            type="button"
            className={styles.browseButton}
            style={{ opacity: disabled ? 0.5 : 1 }}
            onClick={() => !disabled && inputRef.current?.click()}
            disabled={disabled}
          >
            Pilih File
          </button>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            ref={inputRef}
            onChange={handleInputChange}
            hidden
            disabled={disabled}
          />
        </div>
        <p className={styles.hintText}>
          Hanya .jpg/.jpeg/.png &nbsp;|&nbsp; Maksimal 2MB
        </p>
      </div>
    </div>
  );
};

export default SpecimenUpload;
