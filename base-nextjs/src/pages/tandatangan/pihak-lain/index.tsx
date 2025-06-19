import { useState } from "react";
import axios from "axios";
import PageTransition from "@/components/PageLayout";

type FooterColor = "hitam" | "purple";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";
type SDMOption = { id_sdm: string; nama: string };

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const PihakLainPage = () => {
  // State management
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] =
    useState<SignatureType>("invisible");
  const [language, setLanguage] = useState<Language>("id");
  const [footerColor, setFooterColor] = useState<FooterColor>("hitam");
  const [ikutkanSaya, setIkutkanSaya] = useState(false);
  const [anggotaLain, setAnggotaLain] = useState<SDMOption[]>([]);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<SDMOption[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [footerShowMode, setFooterShowMode] = useState("all");
  const [footerPages, setFooterPages] = useState("");

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Tambahkan fungsi handleSave
  const handleSave = () => {
    if (selectedFile) {
      // Simpan data ke localStorage sementara
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem("currentDocument", e.target?.result as string);
        localStorage.setItem("documentName", selectedFile.name);
        window.location.href = "/kelola-tanda-tangan";
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Tambahkan helper untuk ambil CSRF token dari cookie
  function getCsrfToken() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; CSRF-TOKEN=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Handler pencarian SDM
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length > 1) {
      try {
        const res = await axios.get(
          `${API_URL}/sdm/search?nama=${encodeURIComponent(value)}`
        );
        setOptions(res.data);
        setShowDropdown(true);
      } catch (err) {
        setOptions([]);
        setShowDropdown(false);
      }
    } else {
      setOptions([]);
      setShowDropdown(false);
    }
  };

  // Handler pilih anggota
  const handleSelect = (opt: SDMOption) => {
    if (!anggotaLain.find((a) => a.id_sdm === opt.id_sdm)) {
      setAnggotaLain([...anggotaLain, opt]);
    }
    setSearch("");
    setOptions([]);
    setShowDropdown(false);
  };

  // Handler hapus anggota
  const handleRemove = (id_sdm: string) => {
    setAnggotaLain(anggotaLain.filter((a) => a.id_sdm !== id_sdm));
  };

  const isValidUUID = (uuid: string) =>
    /^[0-9a-fA-F-]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      uuid
    );

  const handleSubmit = async () => {
    if (!context || !selectedFile) {
      alert("Lengkapi semua data!");
      return;
    }
    let csrfToken = getCsrfToken();
    if (!csrfToken) {
      await fetch("/csrf-cookie", { credentials: "include" });
      csrfToken = getCsrfToken();
    }
    const idSdmUser = localStorage.getItem("id_sdm") || "";
    if (!isValidUUID(idSdmUser)) {
      alert("ID SDM user login tidak valid! Harus UUID.");
      return;
    }
    // Debug ikutkanSaya
    console.log("[DEBUG] ikutkanSaya:", ikutkanSaya);
    console.log("[DEBUG] anggotaLain (sebelum):", anggotaLain);
    const anggotaList: { id_sdm: string; urutan: number }[] = [];
    let urutan = 1;
    if (ikutkanSaya === true) {
      anggotaList.push({ id_sdm: idSdmUser, urutan });
      urutan++;
    }
    anggotaLain.forEach((anggota, idx) => {
      anggotaList.push({ id_sdm: anggota.id_sdm, urutan: urutan + idx });
    });
    console.log("[DEBUG] anggotaList (setelah):", anggotaList);
    if (anggotaList.length === 0) {
      alert("Minimal harus ada satu anggota penandatangan!");
      return;
    }
    for (const anggota of anggotaList) {
      if (!isValidUUID(anggota.id_sdm)) {
        alert(`ID SDM anggota tidak valid: ${anggota.id_sdm}`);
        return;
      }
    }
    // Debug log
    console.log("[DEBUG] idSdmUser:", idSdmUser);
    const formData = new FormData();
    formData.append("judul", context);
    formData.append("type", "2"); // Penandatanganan Pihak Lain
    formData.append("signature_type", signatureType);
    formData.append("footer_bahasa", language);
    formData.append("footer_color", footerColor);
    formData.append("dokumen", selectedFile);
    formData.append("id_sdm", idSdmUser);
    formData.append("updater", idSdmUser);
    formData.append("is_footer_exist", "true");
    formData.append("is_bulk_sign", "false");
    // Kirim insert_footer_page sesuai pilihan user
    if (footerShowMode === "all") {
      formData.append("insert_footer_page", "all");
    } else if (footerShowMode === "custom" && footerPages.trim() !== "") {
      formData.append("insert_footer_page", footerPages);
    }

    try {
      // 1. Create penandatanganan utama
      const res = await axios.post(`${API_URL}/api/penandatanganan`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-csrf-token": csrfToken || "",
        },
        withCredentials: true,
      });
      const idPenandatanganan =
        res.data.penandatanganan?.id_penandatanganan ||
        res.data.id_penandatanganan;
      // 2. Insert anggota penandatanganan
      for (const anggota of anggotaList) {
        console.log("[DEBUG] POST anggota:", anggota);
        const anggotaRes = await axios.post(
          `${API_URL}/api/penandatanganan/${idPenandatanganan}/anggota`,
          {
            id_sdm: anggota.id_sdm,
            urutan: anggota.urutan,
            is_sign: false,
            updater: idSdmUser,
          },
          {
            headers: { "x-csrf-token": csrfToken || "" },
            withCredentials: true,
          }
        );
        console.log("[DEBUG] Response anggota:", anggotaRes.data);
      }
      window.location.href = `/tandatangan/detail/${idPenandatanganan}`;
    } catch (err) {
      alert("Gagal membuat penandatanganan");
    }
  };

  return (
    <PageTransition pageTitle="Buat Tanda Tangan Dengan Pihak Lain">
      <div className="flex flex-col items-center py-6 px-2 md:px-0">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-4 md:p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => (window.location.href = "/tandatangan")}
              className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold">
              Buat Tanda Tangan Dengan Pihak Lain
            </h1>
          </div>

          {/* Konteks Penandatangan */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">
              Konteks Penandatangan
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Contoh: Sertifikat kegiatan Pengabdian Masyarakat a.n. Ridwan"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Dokumen Section */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Dokumen</h2>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer 
                    hover:bg-blue-600 transition-all flex items-center gap-2 text-sm"
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

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[150px]">
              {selectedFile ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm">
                  <div className="flex items-center gap-3">
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
                    <div>
                      <p className="font-medium text-gray-700 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
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
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
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
            <h2 className="text-lg font-semibold mb-4">Jenis Tanda Tangan</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="signatureType"
                  checked={signatureType === "invisible"}
                  onChange={() => setSignatureType("invisible")}
                />
                Tandatangani Dokumen Tak Terlihat
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="signatureType"
                  checked={signatureType === "visible"}
                  onChange={() => setSignatureType("visible")}
                />
                Tanda Tangani Dokumen Terlihat dengan Spesimen
              </label>
            </div>
          </div>

          {/* Layanan */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Layanan</h2>
            <p className="p-2 bg-gray-100 rounded-md inline-block">
              Tanda Tangan Pihak Lain
            </p>
          </div>

          {/* Footer Settings */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Bahasa Footer</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setLanguage("id")}
                  className={`px-4 py-2 rounded-md ${
                    language === "id" ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Indonesia
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-4 py-2 rounded-md ${
                    language === "en" ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Warna Teks Footer</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setFooterColor("hitam")}
                  className={`px-4 py-2 rounded-md ${
                    footerColor === "hitam" ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  ● Hitam
                </button>
                <button
                  onClick={() => setFooterColor("purple")}
                  className={`px-4 py-2 text-black rounded-md ${
                    footerColor === "purple" ? "ring-2 ring-black" : ""
                  }`}
                >
                  ● Putih
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Tampilkan Footer dan QR Code
            </h2>
            <select
              value={footerShowMode}
              onChange={(e) => {
                setFooterShowMode(e.target.value);
                localStorage.setItem("footerShowMode", e.target.value);
                if (e.target.value === "all") {
                  setFooterPages("");
                  localStorage.setItem("footerPages", "");
                }
              }}
              className="border rounded px-2 py-1"
            >
              <option value="all">Semua Halaman</option>
              <option value="custom">Halaman Tertentu</option>
            </select>
            {footerShowMode === "custom" && (
              <input
                type="text"
                placeholder="1,2,3"
                value={footerPages}
                onChange={(e) => {
                  setFooterPages(e.target.value);
                  localStorage.setItem("footerPages", e.target.value);
                }}
                className="border rounded px-2 py-1 mt-2 w-full"
              />
            )}
          </div>

          {/* Anggota Penandatangan */}
          <div className="mb-8 mt-8">
            <h2 className="text-lg font-semibold mb-4">
              Anggota Penandatangan
            </h2>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-500"
                  checked={ikutkanSaya}
                  onChange={(e) => setIkutkanSaya(e.target.checked)}
                />
                <span>Ikutkan saya dalam penandatangan</span>
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Pilih anggota penandatangan"
                className="w-full p-3 border rounded-md"
                onFocus={() => setShowDropdown(options.length > 0)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              {showDropdown && options.length > 0 && (
                <ul className="absolute z-10 bg-white border w-full rounded shadow max-h-48 overflow-y-auto">
                  {options.map((opt) => (
                    <li
                      key={opt.id_sdm}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSelect(opt)}
                    >
                      {opt.nama}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Tampilkan anggota yang sudah dipilih */}
            <div className="mt-2 flex flex-wrap gap-2">
              {anggotaLain.map((opt) => (
                <span
                  key={opt.id_sdm}
                  className="bg-blue-100 px-2 py-1 rounded flex items-center gap-1"
                >
                  {opt.nama}
                  <button
                    onClick={() => handleRemove(opt.id_sdm)}
                    className="text-red-500 ml-1"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Simpan & Buat Penandatanganan
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default PihakLainPage;

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "24px",
    marginBottom: "30px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  backButton: {
    cursor: "pointer",
    color: "#4299E1",
    fontSize: "24px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #CBD5E0",
    borderRadius: "6px",
    marginBottom: "8px",
  },
  fileButton: {
    backgroundColor: "#4299E1",
    color: "white",
    padding: "10px 24px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#3182CE",
    },
  },
  saveButton: {
    backgroundColor: "#3182CE",
    color: "white",
    padding: "12px 32px",
    borderRadius: "6px",
    cursor: "pointer",
    marginTop: "30px",
    float: "right" as "right",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#3182CE",
    },
  },
};
