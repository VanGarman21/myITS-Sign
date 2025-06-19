import { useState, useEffect, useCallback, useContext } from "react";
import { addFooterToPdf } from "@/utils/addFooterToPdf";
import axios from "axios";
import { Alert } from "@chakra-ui/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import AuthContext from "@/providers/AuthProvider";
import { getCookie } from "@/utils/common/CookieParser";
import ToolbarDummyOnly from "@/components/signature/ToolbarDummyOnly";
import PdfViewer from "@/components/signature/PdfViewer";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type FooterColor = "hitam" | "purple";
type SignatureType = "invisible" | "visible";
type Language = "id" | "en";

interface SignatureWidgetData {
  x: number;
  y: number;
  id: string;
  pageNumber: number;
  image?: string | null;
  width?: number;
  height?: number;
  isLocked?: boolean;
}

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 60;

// Fungsi konversi base64 ke Blob
function base64ToBlob(base64: string, mime: string) {
  const byteChars = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

const CobaPage = () => {
  // Form states
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
  const [idSdm, setIdSdm] = useState<string>("");
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureWidgets, setSignatureWidgets] = useState<
    SignatureWidgetData[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [passphrase, setPassphrase] = useState("");
  const [pendingLockId, setPendingLockId] = useState<string | null>(null);
  const [passphraseError, setPassphraseError] = useState("");
  const auth = useContext(AuthContext);
  const [nik, setNik] = useState<string>("");
  const [spesimen, setSpesimen] = useState<string | null>(null);
  const [signLoading, setSignLoading] = useState(false);
  const [idDokumen, setIdDokumen] = useState<string | null>(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [pdfPageHeight, setPdfPageHeight] = useState<number>(0);
  const [pdfPageOriginalWidth, setPdfPageOriginalWidth] = useState<number>(0);
  const [pdfPageOriginalHeight, setPdfPageOriginalHeight] = useState<number>(0);
  const [showEditor, setShowEditor] = useState(false);

  // Fetch user data
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
        localStorage.setItem("id_sdm", idSdmVal);

        // Set NIK from SDM data
        const sdmData = sdm.data.data ? sdm.data.data : sdm.data;
        setNik(sdmData.nik);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfData(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Hanya file PDF yang didukung!");
    }
  };

  // Handle form submit - just show editor, don't submit to backend yet
  const handleSubmit = () => {
    if (!context || !selectedFile) {
      alert("Lengkapi semua data!");
      return;
    }
    setShowEditor(true);
  };

  // Editor functions
  const handleAddSignature = async () => {
    if (!signatureImage) {
      try {
        // Fetch spesimen based on id_sdm
        const spesimenRes = await axios.get(
          `${API_URL}/spesimen/sdm/${idSdm}`,
          { withCredentials: true }
        );
        const spesimenData = spesimenRes.data.data;
        setSpesimen(spesimenData);
        setSignatureImage(spesimenData);

        // Add signature widget
        setSignatureWidgets([
          {
            x: 100,
            y: 100,
            id: randomId(),
            pageNumber: currentPage,
            image: spesimenData,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            isLocked: false,
          },
        ]);
        setDownloadUrl(null);
      } catch (err) {
        alert("Gagal mengambil spesimen tanda tangan");
      }
    } else {
      // If signature image already exists, just add the widget
      setSignatureWidgets([
        {
          x: 100,
          y: 100,
          id: randomId(),
          pageNumber: currentPage,
          image: signatureImage,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          isLocked: false,
        },
      ]);
      setDownloadUrl(null);
    }
  };

  // Create a handler for the widget's checkmark button - embed signature directly
  const handleWidgetLock = () => {
    console.log("Checkmark button clicked!");
    if (signatureWidgets.length > 0) {
      const widgetId = signatureWidgets[0].id;
      console.log("Locking widget with id:", widgetId);
      // Lock the widget (this will trigger PDF embedding)
      setSignatureWidgets((prev) =>
        prev.map((w) => (w.id === widgetId ? { ...w, isLocked: true } : w))
      );
    }
  };

  // Hanya render widget di halaman aktif
  const widgetsForCurrentPage = signatureWidgets.filter(
    (w) => w.pageNumber === currentPage
  );

  // Cek apakah semua widget di halaman sudah locked
  const allLocked =
    widgetsForCurrentPage.length > 0 &&
    widgetsForCurrentPage.every((w) => w.isLocked);
  const notif = allLocked ? "Sudah Ditandatangani" : null;

  // Embed signature ke PDF otomatis jika allLocked dan downloadUrl belum ada
  useEffect(() => {
    const embedIfLocked = async () => {
      if (!pdfData || !allLocked || downloadUrl) return;
      setIsProcessing(true);
      try {
        const base64 = pdfData.split(",")[1];
        const pdfBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        for (const w of signatureWidgets) {
          const page = pages[w.pageNumber - 1];
          const width = w.width || DEFAULT_WIDTH;
          const height = w.height || DEFAULT_HEIGHT;
          if (w.image) {
            // Embed image signature
            let img;
            if (w.image.startsWith("data:image/png")) {
              img = await pdfDoc.embedPng(w.image);
            } else {
              img = await pdfDoc.embedJpg(w.image);
            }
            page.drawImage(img, {
              x: w.x,
              y: page.getHeight() - w.y - height,
              width,
              height,
            });
          }
        }
        const newPdfBytes = await pdfDoc.save();
        const newBase64 =
          "data:application/pdf;base64," + uint8ToBase64(newPdfBytes);
        setDownloadUrl(newBase64);
        setIsProcessing(false);
      } catch (e) {
        setIsProcessing(false);
        alert("Gagal embed signature ke PDF: " + e);
      }
    };
    embedIfLocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocked, pdfData, signatureWidgets]);

  // Save signed PDF to backend
  const handleSaveToBackend = async () => {
    if (!downloadUrl || !context || !idSdm) {
      alert("Dokumen belum siap untuk disimpan");
      return;
    }

    setSignLoading(true);
    try {
      // Convert base64 to file
      const pdfBlob = base64ToBlob(downloadUrl, "application/pdf");
      const signedPdfFile = new File([pdfBlob], "signed_dokumen.pdf", {
        type: "application/pdf",
      });

      // Submit to penandatanganan endpoint
      const submitFormData = new FormData();
      submitFormData.append("judul", context);
      submitFormData.append("type", "1"); // Penandatanganan Sendiri
      submitFormData.append("is_footer_exist", JSON.stringify(true));
      submitFormData.append("tag", "");
      submitFormData.append("is_bulk_sign", JSON.stringify(false));
      submitFormData.append("signature_type", signatureType);
      submitFormData.append("footer_bahasa", language);
      submitFormData.append("footer_color", footerColor);
      submitFormData.append("dokumen", signedPdfFile);
      submitFormData.append("updater", idSdm);
      submitFormData.append("id_sdm", idSdm);

      if (footerShowMode === "all") {
        submitFormData.append("insert_footer_page", "all");
      } else if (footerShowMode === "custom" && footerPages.trim() !== "") {
        submitFormData.append("insert_footer_page", footerPages);
      }

      await axios.get(`${API_URL}/csrf-cookie`, { withCredentials: true });
      const csrfToken = getCookie("CSRF-TOKEN");

      console.log("Submitting to penandatanganan endpoint...");
      const submitRes = await axios.post(
        `${API_URL}/api/penandatanganan`,
        submitFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-csrf-token": csrfToken || "",
          },
          withCredentials: true,
        }
      );

      console.log("Submit response:", submitRes.data);

      // Get id_dokumen from response
      const idDokumen = submitRes.data.id_dokumen;
      if (idDokumen) {
        setIdDokumen(idDokumen);
        setShowDownloadButton(true);
        console.log("Document ID received:", idDokumen);
      }

      alert("Dokumen berhasil disimpan ke backend!");
    } catch (e: any) {
      console.error("Error during save process:", e);
      alert(
        e?.response?.data?.message || e.message || "Gagal menyimpan dokumen"
      );
    }
    setSignLoading(false);
  };

  const handleRemoveSignature = useCallback((id: string) => {
    setSignatureWidgets([]);
    setDownloadUrl(null);
  }, []);

  const handleResizeWidget = (id: string, width: number, height: number) => {
    setSignatureWidgets((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, width: Math.round(width), height: Math.round(height) }
          : w
      )
    );
    setDownloadUrl(null);
  };

  const handleDragWidget = (id: string, x: number, y: number) => {
    setSignatureWidgets((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, x: Math.round(x), y: Math.round(y) } : w
      )
    );
    setDownloadUrl(null);
  };

  // Navigasi halaman
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  return (
    <div className="min-h-screen bg-gray-50">
      {!showEditor ? (
        // Form Section
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
              <h2 className="text-base md:text-lg font-semibold mb-2">
                Layanan
              </h2>
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
                      language === "id"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
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
                      language === "en"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
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
                    Ungu
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
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                type="button"
                disabled={userLoading || !idSdm}
              >
                Lanjut ke Editor
              </button>
              {!idSdm && !userLoading && (
                <div className="text-red-500 text-sm mt-2">
                  ID SDM tidak ditemukan, silakan login ulang atau hubungi
                  admin.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="flex min-h-screen relative">
            <div className="w-1/5 bg-gray-100 p-4 border-r">
              <ToolbarDummyOnly
                notif={notif}
                downloadUrl={downloadUrl}
                onClickSign={handleAddSignature}
              />
              {/* Add custom save button */}
              {downloadUrl && !showDownloadButton && (
                <button
                  onClick={handleSaveToBackend}
                  disabled={signLoading}
                  className="w-full px-3 py-2 mt-3 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-700 transition disabled:opacity-50"
                >
                  {signLoading ? "Menyimpan..." : "Simpan ke Backend"}
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex items-center mb-2 gap-2">
                <button
                  onClick={handlePrevPage}
                  className="px-3 py-1 bg-gray-300 rounded"
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span>
                  Halaman {currentPage} / {numPages}
                </span>
                <button
                  onClick={handleNextPage}
                  className="px-3 py-1 bg-gray-300 rounded"
                  disabled={currentPage === numPages}
                >
                  &gt;
                </button>
              </div>
              <PdfViewer
                pdfData={pdfData || ""}
                signatureWidgets={widgetsForCurrentPage}
                onDropSignature={() => {}}
                onRemoveSignature={handleRemoveSignature}
                currentPage={currentPage}
                onNumPages={setNumPages}
                onResizeWidget={handleResizeWidget}
                onDragWidget={handleDragWidget}
                onLockWidget={handleWidgetLock}
                onPageLoadSuccess={(page) => {
                  setPdfPageHeight(page.height);
                  setPdfPageOriginalWidth(page.originalWidth || page.width);
                  setPdfPageOriginalHeight(page.originalHeight || page.height);
                }}
                pdfPageOriginalWidth={pdfPageOriginalWidth}
                pdfPageOriginalHeight={pdfPageOriginalHeight}
              />
            </div>
            {/* Download Button */}
            {showDownloadButton && idDokumen && (
              <a
                href={`${API_URL}/api/sign/download/${idDokumen}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded shadow-lg hover:bg-green-700"
              >
                Download PDF Hasil Tanda Tangan
              </a>
            )}
          </div>
        </DndProvider>
      )}
    </div>
  );
};

export default CobaPage;
