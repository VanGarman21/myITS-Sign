import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/TandaTangan.module.css";
import {
  fetchSignatureTable,
  SignatureTableRow,
} from "../../services/signature";
import { getAuthService } from "../../services/GetAuth";
import axios from "axios";
import PageTransition from "@/components/PageLayout";

const dropdownOptions = [
  "Penandatangan Sendiri",
  "Penandatangan Dengan Pihak Lain",
  "Penandatangan Secara Massal",
];

const filterTabs = [
  "Semua Tanda Tangan",
  "Sudah Tanda Tangan",
  "Belum Tanda Tangan",
  "Penandatangan Saya Buat",
];

const SignaturePage: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<SignatureTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [idSdm, setIdSdm] = useState<string>("");
  const limit = 10;
  const router = useRouter();

  // Ambil id_sdm dari backend persis seperti di manage-specimen
  useEffect(() => {
    async function fetchIdSdm() {
      try {
        // 1. Ambil user SSO yang sedang login
        const user = await axios.get(
          (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080") +
            "/auth/user",
          { withCredentials: true }
        );
        const ssoUserId = user.data.data.sso_user_id || user.data.data.sub;

        // 2. Ambil data SDM berdasarkan sso_user_id
        const sdm = await axios.get(
          (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080") +
            "/sdm/by-sso-id/" +
            ssoUserId,
          { withCredentials: true }
        );
        const idSdm =
          sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
        setIdSdm(idSdm || "");
      } catch (err) {
        setIdSdm("");
      }
    }
    fetchIdSdm();
  }, []);

  useEffect(() => {
    if (!idSdm) return;
    // Validasi UUID
    function isValidUUID(uuid: string) {
      return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        uuid
      );
    }
    console.log("id_sdm dari backend:", idSdm);
    if (!isValidUUID(idSdm)) {
      console.error("id_sdm tidak valid UUID:", idSdm);
      return;
    }
    setLoading(true);
    fetchSignatureTable({
      id_sdm: idSdm,
      search,
      status: selectedTab,
      page,
      limit,
    })
      .then((res) => {
        setData(Array.isArray(res.aaData) ? res.aaData : []);
        setTotal(res.iTotalRecords || 0);
      })
      .finally(() => setLoading(false));
  }, [idSdm, search, selectedTab, page]);

  const handleSelectChange = (value: string) => {
    switch (value) {
      case "Penandatangan Sendiri":
        router.push("/tandatangan/sendiri");
        break;
      case "Penandatangan Dengan Pihak Lain":
        router.push("/tandatangan/pihak-lain");
        break;
      case "Penandatangan Secara Massal":
        router.push("/tandatangan/massal");
        break;
      default:
        break;
    }
  };

  return (
    <PageTransition pageTitle="Tanda Tangan Elektronik">
      <div
        style={{ background: "#f7f8fa", minHeight: "100vh", padding: "2rem 0" }}
      >
        <div className={styles.container}>
          <div className={styles.title}>Buat Tanda Tangan</div>
          <div className={styles.actionRow}>
            <div className={styles.dropdown}>
              <button
                className={styles.dropdownButton}
                onClick={() => setShowDropdown((v) => !v)}
              >
                <span style={{ fontSize: 20, marginRight: 8 }}>+</span>{" "}
                Penandatangan
                <svg width="14" height="14" style={{ marginLeft: 8 }}>
                  <path
                    d="M2 5l5 5 5-5"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className={styles.dropdownList}>
                  {dropdownOptions.map((option, idx) => (
                    <div
                      key={option}
                      className={styles.dropdownItem}
                      onClick={() => {
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
          </div>
          <div className={styles.filterTabs}>
            {filterTabs.map((tab, idx) => (
              <button
                key={tab}
                className={
                  styles.filterTab +
                  (selectedTab === idx + 1 ? " " + styles.active : "")
                }
                onClick={() => {
                  setSelectedTab(idx + 1);
                  setPage(1);
                }}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 18 }}
          >
            <div className={styles.searchBox}>
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="#94a3b8"
                style={{ marginRight: 6 }}
              >
                <circle cx="8" cy="8" r="7" strokeWidth="2" />
                <path d="M13 13l3 3" strokeWidth="2" />
              </svg>
              <input
                className={styles.searchInput}
                placeholder="Cari"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Konteks Penandatangan</th>
                  <th>Status</th>
                  <th>Dokumen</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Loading...
                    </td>
                  </tr>
                ) : !Array.isArray(data) || data.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr key={row.id_penandatanganan}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>
                        <span
                          style={{
                            color: "#2563eb",
                            fontWeight: 600,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() =>
                            router.push(
                              `/tandatangan/detail/${row.id_penandatanganan}`
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              router.push(
                                `/tandatangan/detail/${row.id_penandatanganan}`
                              );
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Lihat detail penandatanganan ${row.judul}`}
                        >
                          {row.judul}
                        </span>
                        <br />
                        <span
                          style={{
                            color: "#6b7280",
                            fontStyle: "italic",
                            fontSize: 13,
                          }}
                        >
                          {row.signature_type}
                        </span>
                      </td>
                      <td>
                        {row.signature_status === "sudah_ttd" ? (
                          <span
                            className={`${styles.statusBadge} ${styles.statusSelesai}`}
                          >
                            Sudah Ditandatangani
                          </span>
                        ) : (
                          <span
                            className={`${styles.statusBadge} ${styles.statusPerlu}`}
                          >
                            Perlu Tandatangan
                          </span>
                        )}
                      </td>
                      <td>
                        <button className={styles.iconButton} title="Unduh">
                          <svg
                            className={styles.iconDownload}
                            width="20"
                            height="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 4v10m0 0l-4-4m4 4l4-4" />
                            <rect x="4" y="16" width="12" height="2" rx="1" />
                          </svg>
                        </button>
                        {row.signature_status === "perlu_ttd" &&
                          row.can_delete && (
                            <button className={styles.iconButton} title="Hapus">
                              <svg
                                className={styles.iconDelete}
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect x="6" y="8" width="8" height="8" rx="2" />
                                <path d="M9 8V6a1 1 0 0 1 2 0v2" />
                                <path d="M4 8h12" />
                              </svg>
                            </button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            {Array.from({ length: Math.ceil((total || 0) / limit) }, (_, i) => (
              <button
                key={i}
                className={
                  styles.pageBtn + (page === i + 1 ? " " + styles.active : "")
                }
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SignaturePage;
