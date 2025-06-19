import { useState, useEffect } from "react";
import { addFooterToPdf } from "@/utils/addFooterToPdf";
import axios from "axios";
import { Alert } from "@chakra-ui/react";
import PageTransition from "@/components/PageLayout";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type FooterColor = "hitam" | "purple";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";

const SendiriPage = () => {
  // State management
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] =
    useState<SignatureType>("invisible");
  const [language, setLanguage] = useState<Language>("id");
  const [footerColor, setFooterColor] = useState<FooterColor>("hitam");
  const [footerShowMode, setFooterShowMode] = useState(
    localStorage.getItem("footerShowMode") || "all"
  );
  const [footerPages, setFooterPages] = useState(
    localStorage.getItem("footerPages") || ""
  );
  const [insertFooterPage, setInsertFooterPage] = useState("");
  const [idSdm, setIdSdm] = useState<string>("");
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [sdmData, setSdmData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const user = await axios.get(`${API_URL}/auth/user`, {
          withCredentials: true,
        });
        const ssoUserId = user.data.data.sso_user_id || user.data.data.sub;
        const sdm = await axios.get(`${API_URL}/sdm/by-sso-id/${ssoUserId}`, {
          withCredentials: true,
        });
        const idSdmVal =
          sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
        setIdSdm(idSdmVal);
        setUserData(user.data.data);
        setSdmData(sdm.data.data || sdm.data);
        localStorage.setItem("id_sdm", idSdmVal);
        setError(null);
      } catch (err) {
        setIdSdm("");
        setError(
          "Gagal mengambil data user/SDM. Pastikan Anda sudah login dan backend berjalan."
        );
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Hanya file PDF yang didukung!");
    }
  };

  // Tambahkan fungsi handleSave
  const handleSave = async () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        // Footer text sesuai setting
        const footerText = `Catatan:\nUU ITE No 11 Tahun 2008 Pasal 5 ayat 1\n"Informasi Elektronik dan/atau Dokumen Elektronik dan/atau hasil cetaknya merupakan alat bukti hukum yang sah"\nDokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan BSrE, BSSN\nDokumen ini dapat dibuktikan keasliannya dengan memindai QR Code`;
        // Ambil setting halaman
        const showMode = localStorage.getItem("footerShowMode") || "all";
        const pages = (localStorage.getItem("footerPages") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const resultBytes = await addFooterToPdf(
          arrayBuffer,
          footerText,
          showMode === "all" ? "all" : pages
        );
        // Simpan ke localStorage (base64)
        const blob = new Blob([resultBytes], { type: "application/pdf" });
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          localStorage.setItem("currentDocument", ev.target?.result as string);
          localStorage.setItem("documentName", selectedFile.name);
          window.location.href = "/tandatangan/sendiri/editor";
        };
        fileReader.readAsDataURL(blob);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Tambahkan helper untuk ambil CSRF token dari cookie
  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; CSRF-TOKEN=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  const handleSubmit = async () => {
    if (!context || !selectedFile) {
      alert("Lengkapi semua data!");
      return;
    }
    if (!idSdm) {
      alert("Data user belum siap, silakan tunggu sebentar.");
      return;
    }
    // Ambil CSRF token dari cookie
    let csrfToken = getCsrfToken();
    // Jika belum ada, fetch ke /csrf-cookie
    if (!csrfToken) {
      await fetch("/csrf-cookie", { credentials: "include" });
      csrfToken = getCsrfToken();
    }
    const formData = new FormData();
    formData.append("judul", context);
    formData.append("type", "1"); // Penandatanganan Sendiri
    formData.append("is_footer_exist", JSON.stringify(true)); // Selalu ada footer, boolean
    formData.append("tag", ""); // tag kosong jika tidak ada
    formData.append("is_bulk_sign", JSON.stringify(false)); // Untuk sendiri, false (boolean)
    formData.append("signature_type", signatureType); // "invisible" atau "visible"
    formData.append("footer_bahasa", language); // "id" atau "en"
    formData.append("footer_color", footerColor); // "hitam" atau "putih"
    formData.append("dokumen", selectedFile);
    // updater dari id_sdm (ambil dari state hasil fetch)
    formData.append("updater", idSdm);
    formData.append("id_sdm", idSdm); // id_sdm wajib
    // Kirim insert_footer_page sesuai pilihan user
    if (footerShowMode === "all") {
      formData.append("insert_footer_page", "all");
    } else if (footerShowMode === "custom" && footerPages.trim() !== "") {
      formData.append("insert_footer_page", footerPages);
    }
    try {
      const response = await axios.post(
        `${API_URL}/api/penandatanganan`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-csrf-token": csrfToken || "",
          },
          withCredentials: true,
        }
      );
      // Jika berhasil, POST anggota ke endpoint khusus
      if (response.data && response.data.id_penandatanganan) {
        const idPenandatanganan = response.data.id_penandatanganan;
        // POST anggota
        await axios.post(
          `${API_URL}/api/penandatanganan/${idPenandatanganan}/anggota`,
          {
            id_sdm: idSdm,
            is_sign: false,
            updater: idSdm,
          },
          {
            headers: { "x-csrf-token": csrfToken || "" },
            withCredentials: true,
          }
        );
        window.location.href = `/tandatangan/detail/${idPenandatanganan}`;
      } else {
        window.location.href = "/tandatangan/sendiri/editor";
      }
    } catch (err) {
      alert("Gagal membuat penandatanganan");
    }
  };

  return (
    <PageTransition pageTitle="Buat Tanda Tangan Sendiri">
      <div className="flex flex-col items-center py-6 px-2 md:px-0">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-4 md:p-8">
          {error && (
            <Alert status="error" className="mb-4">
              {error}
            </Alert>
          )}
          <div className="flex items-center mb-6">
            <button
              onClick={() => (window.location.href = "/tandatangan")}
              className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 focus:outline-none"
              aria-label="Kembali"
            >
              ←
            </button>
            <h1 className="text-xl md:text-2xl font-bold">
              Buat Tanda Tangan Sendiri
            </h1>
          </div>

          {/* Konteks Penandatangan */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Konteks Penandatangan
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Contoh: Sertifikat kegiatan Pengabdian Masyarakat a.n. Ridwan"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-200 focus:outline-none text-sm md:text-base"
            />
          </div>

          {/* Dokumen Section */}
          <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-700">
                Dokumen
              </h2>
              <div className="relative w-full md:w-auto">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="application/pdf"
                />
                <label
                  htmlFor="file-upload"
                  className="w-full md:w-auto flex justify-center items-center bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-all gap-2 text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17a2 2 0 012 2v10a2 2 0 01-2 2H3zm7-9a1 1 0 10-2 0v2H8a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pilih File
                </label>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[120px] flex items-center justify-center">
              {selectedFile ? (
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-3 p-3 bg-white rounded-md shadow-sm">
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="truncate">
                      <p className="font-medium text-gray-700 truncate max-w-[180px] md:max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                    aria-label="Hapus file"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full text-center py-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-400 text-sm">
                    Belum ada dokumen dipilih
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Format yang didukung: PDF
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Jenis Tanda Tangan */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold mb-4">
              Jenis Tanda Tangan
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="signatureType"
                  checked={signatureType === "invisible"}
                  onChange={() => setSignatureType("invisible")}
                  className="accent-blue-500"
                />
                <span className="text-sm md:text-base">
                  Tandatangani Dokumen Tak Terlihat
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="signatureType"
                  checked={signatureType === "visible"}
                  onChange={() => setSignatureType("visible")}
                  className="accent-blue-500"
                />
                <span className="text-sm md:text-base">
                  Tanda Tangani Dokumen Terlihat dengan Spesimen
                </span>
              </label>
            </div>
          </div>

          {/* Layanan */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold mb-2">Layanan</h2>
            <p className="p-2 bg-gray-100 rounded-md inline-block text-sm md:text-base">
              Tanda Tangan Sendiri
            </p>
          </div>

          {/* Footer Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-4">
                Bahasa Footer
              </h2>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => {
                    setLanguage("id");
                    localStorage.setItem("footerBahasa", "id");
                  }}
                  className={`px-4 py-2 rounded-md text-sm md:text-base ${
                    language === "id" ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Indonesia
                </button>
                <button
                  onClick={() => {
                    setLanguage("en");
                    localStorage.setItem("footerBahasa", "en");
                  }}
                  className={`px-4 py-2 rounded-md text-sm md:text-base ${
                    language === "en" ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  English
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-4">
                Warna Footer
              </h2>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => setFooterColor("hitam")}
                  className={`px-4 py-2 rounded-md text-sm md:text-base ${
                    footerColor === "hitam"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Hitam
                </button>
                <button
                  onClick={() => setFooterColor("purple")}
                  className={`px-4 py-2 rounded-md text-sm md:text-base ${
                    footerColor === "purple"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Putih
                </button>
              </div>
            </div>
          </div>

          {/* Pilihan Footer Show Mode */}
          <div className="mb-8">
            <h2 className="text-base md:text-lg font-semibold mb-4">
              Tampilkan Footer dan QR Code
            </h2>
            <div className="flex gap-4 flex-wrap items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="footerShowMode"
                  checked={footerShowMode === "all"}
                  onChange={() => {
                    setFooterShowMode("all");
                    localStorage.setItem("footerShowMode", "all");
                  }}
                  className="accent-blue-500"
                />
                <span className="text-sm md:text-base">Semua Halaman</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="footerShowMode"
                  checked={footerShowMode === "custom"}
                  onChange={() => {
                    setFooterShowMode("custom");
                    localStorage.setItem("footerShowMode", "custom");
                  }}
                  className="accent-blue-500"
                />
                <span className="text-sm md:text-base">Halaman Tertentu</span>
              </label>
              {footerShowMode === "custom" && (
                <input
                  type="text"
                  value={footerPages}
                  onChange={(e) => {
                    setFooterPages(e.target.value);
                    localStorage.setItem("footerPages", e.target.value);
                  }}
                  placeholder="Contoh: 1,2,5"
                  className="ml-2 p-2 border rounded-md text-sm md:text-base"
                />
              )}
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              type="button"
            >
              Simpan ke Editor
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              type="button"
              disabled={userLoading || !idSdm || !userData || !sdmData}
            >
              Submit Penandatanganan
            </button>
            {!idSdm && !userLoading && (
              <div className="text-red-500 text-sm mt-2">
                ID SDM tidak ditemukan, silakan login ulang atau hubungi admin.
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SendiriPage;
