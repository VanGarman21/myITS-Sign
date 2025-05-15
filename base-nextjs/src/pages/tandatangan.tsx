import React, { useState } from "react";
import { useRouter } from "next/router";

const SignaturePage: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const router = useRouter();

  // Data dummy untuk tabel
  const tableData = [
    {
      no: 1,
      context: "Tes",
      status: "Susitin (Standardmengen)",
      document: "○",
    },
    {
      no: 2,
      context: "Tes",
      status: "Susitin (Standardmengen)",
      document: "○",
    },
    { no: 3, context: "Tes", status: "Pelin (Tandatangan)", document: "○" },
    { no: 4, context: "Tes", status: "Pelin (Tandatangan)", document: "○" },
  ];

  const dropdownOptions = [
    "Penandatangan Sendiri",
    "Penandatangan Dengan Pihak Lain",
    "Penandatangan Secara Massal",
  ];

  const handleSelectChange = (value: string) => {
    switch (value) {
      case "Penandatangan Sendiri":
        router.push("/ttd-sendiri");
        break;
      case "Penandatangan Dengan Pihak Lain":
        router.push("/ttd-pihak-lain");
        break;
      case "Penandatangan Secara Massal":
        router.push("/ttd-massal");
        break;
      default:
        break;
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Buat Tanda Tangan</h2>

      {/* Dropdown Section */}
      <div style={styles.dropdownWrapper}>
        <div
          style={styles.dropdownHeader}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>Penandatangan ▼</span>
        </div>

        {showDropdown && (
          <div style={styles.dropdownList}>
            {dropdownOptions.map((option, index) => (
              <div
                key={index}
                style={styles.dropdownItem}
                onClick={() => {
                  setSelectedOption(option);
                  setShowDropdown(false);
                  handleSelectChange(option);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table Section */}
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHeaderRow}>
            <th style={styles.tableHeader}>No.</th>
            <th style={styles.tableHeader}>Konteks Penandatangan</th>
            <th style={styles.tableHeader}>Status</th>
            <th style={styles.tableHeader}>Dokumen</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} style={styles.tableRow}>
              <td style={styles.tableCell}>{row.no}</td>
              <td style={styles.tableCell}>{row.context}</td>
              <td style={styles.tableCell}>{row.status}</td>
              <td style={styles.tableCell}>{row.document}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Action Buttons */}
      <div style={styles.buttonContainer}>
        <button style={styles.secondaryButton}>Provision</button>
        <button style={styles.primaryButton}>Next</button>
      </div>

      {/* Help Text */}
      <div style={styles.helpSection}>
        <span style={styles.helpIcon}>i</span>
        <span style={styles.helpText}>Bantuan</span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    color: "#2D3748",
    fontSize: "24px",
    marginBottom: "30px",
  },
  dropdownWrapper: {
    position: "relative" as "relative",
    marginBottom: "30px",
  },
  dropdownHeader: {
    padding: "12px 16px",
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    width: "300px",
  },
  dropdownList: {
    position: "absolute" as "absolute",
    top: "100%",
    left: 0,
    width: "300px",
    border: "1px solid #E2E8F0",
    borderRadius: "6px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginTop: "4px",
    zIndex: 100,
  },
  dropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#F7FAFC",
    },
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as "collapse",
    marginBottom: "30px",
  },
  tableHeaderRow: {
    backgroundColor: "#F7FAFC",
    borderBottom: "2px solid #E2E8F0",
  },
  tableHeader: {
    padding: "12px",
    textAlign: "left" as "left",
    color: "#718096",
    fontSize: "14px",
  },
  tableRow: {
    borderBottom: "1px solid #E2E8F0",
    ":hover": {
      backgroundColor: "#F7FAFC",
    },
  },
  tableCell: {
    padding: "12px",
    color: "#2D3748",
    fontSize: "14px",
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
  },
  primaryButton: {
    padding: "10px 24px",
    backgroundColor: "#4299E1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#3182CE",
    },
  },
  secondaryButton: {
    padding: "10px 24px",
    backgroundColor: "#FFFFFF",
    color: "#4299E1",
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#F7FAFC",
    },
  },
  helpSection: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  helpIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#4299E1",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },
  helpText: {
    color: "#4299E1",
    fontSize: "14px",
  },
};

export default SignaturePage;
