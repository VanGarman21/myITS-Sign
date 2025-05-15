import { useState } from "react";

type FooterColor = "hitam" | "purple";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";

const BuatTandaTanganSendiri = () => {
  // State management
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] =
    useState<SignatureType>("invisible");
  const [language, setLanguage] = useState<Language>("id");
  const [footerColor, setFooterColor] = useState<FooterColor>("hitam");

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
        window.location.href = "/tanda-tangan";
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => (window.location.href = "/table")}
          className="mr-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Buat Tanda Tangan Sendiri</h1>
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
              <p className="text-gray-400 text-sm">Belum ada dokumen dipilih</p>
              <p className="text-gray-400 text-xs mt-1">
                Format yang didukung: PDF, DOC, DOCX
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
          Tanda Tangan Sendiri
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

      <button style={styles.saveButton} className="mb-10" onClick={handleSave}>
        Simpan
      </button>
    </div>
  );
};

export default BuatTandaTanganSendiri;

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
