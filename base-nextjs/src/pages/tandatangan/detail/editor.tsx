import { useEffect, useState, useCallback, useContext } from "react";
import ToolbarDummyOnly from "@/components/signature/ToolbarDummyOnly";
import PdfViewer from "@/components/signature/PdfViewer";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import AuthContext from "@/providers/AuthProvider";
import axios from "axios";
import { getCookie } from "@/utils/common/CookieParser";

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

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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

export default function EditorTandaTanganSendiri({
  pdfUrl,
}: {
  pdfUrl?: string;
}) {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  
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

  // Ambil PDF dari prop pdfUrl jika ada, jika tidak dari localStorage
  useEffect(() => {
    if (pdfUrl) {
      fetch(pdfUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onload = () => setPdfData(reader.result as string);
          reader.readAsDataURL(blob);
        })
        .catch((err) => {
          console.error("Gagal fetch PDF:", err);
          setPdfData(null);
        });
    } else {
      const doc = localStorage.getItem("currentDocument");
      if (doc) {
        if (doc.startsWith("data:application/pdf")) {
          setPdfData(doc);
        } else {
          fetch(doc)
            .then((res) => res.blob())
            .then((blob) => {
              const reader = new FileReader();
              reader.onload = () => setPdfData(reader.result as string);
              reader.readAsDataURL(blob);
            });
        }
      }
    }
  }, [pdfUrl]);

  // Ambil NIK dan spesimen saat komponen mount
  useEffect(() => {
    const fetchUserAndSpesimen = async () => {
      try {
        // 1. Ambil user SSO yang sedang login
        const userRes = await axios.get(`${backendUrl}/auth/user`, {
          withCredentials: true,
        });
        const ssoUserId =
          userRes.data.data.sso_user_id || userRes.data.data.sub;
        // 2. Ambil data SDM berdasarkan sso_user_id
        const sdmRes = await axios.get(
          `${backendUrl}/sdm/by-sso-id/${ssoUserId}`,
          { withCredentials: true }
        );
        console.log("Response dari /sdm/by-sso-id:", sdmRes.data);
        // Cek struktur response, ambil id_sdm dan nik dari property yang benar
        const sdm = sdmRes.data.data ? sdmRes.data.data : sdmRes.data;
        setNik(sdm.nik);
        // 3. Ambil spesimen berdasarkan id_sdm
        const spesimenRes = await axios.get(
          `${backendUrl}/spesimen/sdm/${sdm.id_sdm}`,
          { withCredentials: true }
        );
        setSpesimen(spesimenRes.data.data); // base64 image
        setSignatureImage(spesimenRes.data.data); // signatureImage = spesimen
      } catch (e) {
        // handle error
      }
    };
    fetchUserAndSpesimen();
  }, []);

  // Fungsi untuk menambah signature di atas PDF (bukan drag dari sidebar)
  const handleAddSignature = () => {
    if (!signatureImage) return;
    
    setDownloadUrl(null);
  };

  // Saat user ingin lock signature, tampilkan modal passphrase
  const handleRequestLockWidget = (id: string) => {
    setPendingLockId(id);
    setShowPassphraseModal(true);
    setPassphrase("");
    setPassphraseError("");
  };

  // Fungsi validasi passphrase (dummy: passphrase = '1234')
  const handleSubmitPassphrase = async () => {
    // Validasi passphrase ke backend/BSrE
    if (!pdfData || !nik || !spesimen ) return;
    setSignLoading(true);
    try {
 
      // Konversi base64 ke Blob tanpa fetch
      const pdfBlob = base64ToBlob(pdfData, "application/pdf");
      const pdfFile = new File([pdfBlob], "dokumen.pdf", {
        type: "application/pdf",
      });
      const spesimenBlob = base64ToBlob(spesimen, "image/png");
      const spesimenFile = new File([spesimenBlob], "ttd.png", {
        type: "image/png",
      });
      // Siapkan form-data
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("nik", nik);
      formData.append("passphrase", passphrase);
      formData.append("tampilan", "visible");
      formData.append("image", "true");
      formData.append("imageTTD", spesimenFile);
      formData.append("page", widget.pageNumber.toString());
      // LOG posisi dan ukuran widget serta ukuran asli PDF
      console.log(
        "PDF asli - width:",
        pdfPageOriginalWidth,
        "height:",
        pdfPageOriginalHeight
      );
      console.log(
        "Widget - x:",
        widget.x,
        "y:",
        widget.y,
        "width:",
        widget.width,
        "height:",
        widget.height
      );
      const xAxis = Math.round(widget.x);
      const yAxis = Math.round(
        pdfPageOriginalHeight - (widget.y + (widget.height || DEFAULT_HEIGHT))
      );
      const width = Math.round(widget.width || DEFAULT_WIDTH);
      const height = Math.round(widget.height || DEFAULT_HEIGHT);
      console.log(
        "Kirim ke BSrE => xAxis:",
        xAxis,
        "yAxis:",
        yAxis,
        "width:",
        width,
        "height:",
        height
      );
      formData.append("xAxis", xAxis.toString());
      formData.append("yAxis", yAxis.toString());
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      // LOG semua data yang akan dikirim
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            pair[0],
            "File:",
            (pair[1] as File).name,
            (pair[1] as File).type,
            (pair[1] as File).size,
            "bytes"
          );
        } else {
          console.log(pair[0], pair[1]);
        }
      }
      // Ambil CSRF token terbaru sebelum submit
      await axios.get(`${backendUrl}/csrf-cookie`, { withCredentials: true });
      const csrfToken = getCookie("CSRF-TOKEN");
      const res = await axios.post(`${backendUrl}/api/sign/pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-CSRF-TOKEN": csrfToken || "",
        },
        withCredentials: true,
        responseType: "blob",
      });
      // Ambil id_dokumen dari response header backend (case-insensitive)
      let idDokumenHeader = null;
      for (const key in res.headers) {
        if (key.toLowerCase() === "id_dokumen") {
          idDokumenHeader = res.headers[key];
          break;
        }
      }
      if (idDokumenHeader) {
        setIdDokumen(idDokumenHeader);
        setShowDownloadButton(true);
        console.log("ID_DOKUMEN dari response header:", idDokumenHeader);
      }
      // Jika sukses, lock widget, tutup modal, reset passphrase
      if (pendingLockId) {
      }
      setShowPassphraseModal(false);
      setPendingLockId(null);
      setPassphrase("");
      setPassphraseError("");
      alert("Dokumen berhasil ditandatangani!");
    } catch (e: any) {
      setPassphraseError(
        e?.response?.data?.message ||
          e.message ||
          "Gagal menandatangani dokumen"
      );
    }
    setSignLoading(false);
  };

  const handleRemoveSignature = useCallback((id: string) => {

    setDownloadUrl(null);
  }, []);

  const handleResizeWidget = (id: string, width: number, height: number) => {
  
    setDownloadUrl(null);
  };

  const handleDragWidget = (id: string, x: number, y: number) => {

    setDownloadUrl(null);
  };

  // Hanya render widget di halaman aktif

  // Cek apakah semua widget di halaman sudah locked
  // Embed signature ke PDF otomatis jika allLocked dan downloadUrl belum ada
  useEffect(() => {
    const embedIfLocked = async () => {
      if (!pdfData ||  downloadUrl || !signatureImage) return;
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
          } else {
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            page.drawText("Signed", {
              x: w.x,
              y: page.getHeight() - w.y - 40,
              size: 24,
              font,
              color: rgb(0, 0, 1),
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
  }, [allLocked, pdfData,  signatureImage]);

  // Navigasi halaman
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  if (!pdfData || !signatureImage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {pdfUrl
          ? "Gagal memuat PDF dari server. Pastikan file tersedia dan backend mengizinkan akses."
          : "Memuat PDF..."}
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen relative">
        <div className="w-1/5 bg-gray-100 p-4 border-r">
          <ToolbarDummyOnly
            notif={notif}
            downloadUrl={downloadUrl}
            onClickSign={handleAddSignature}
          />
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
            pdfData={pdfData}
            onDropSignature={() => {}}
            onRemoveSignature={handleRemoveSignature}
            currentPage={currentPage}
            onNumPages={setNumPages}
            onResizeWidget={handleResizeWidget}
            onDragWidget={handleDragWidget}
            onLockWidget={handleRequestLockWidget}
            onPageLoadSuccess={(page) => {
              setPdfPageHeight(page.height); // viewer height
              setPdfPageOriginalWidth(page.originalWidth || page.width);
              setPdfPageOriginalHeight(page.originalHeight || page.height);
            }}
            pdfPageOriginalWidth={pdfPageOriginalWidth}
            pdfPageOriginalHeight={pdfPageOriginalHeight}
          />
        </div>
        {/* Modal Passphrase */}
        {showPassphraseModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md border">
              <h2 className="text-xl font-bold mb-2">Tanda Tangani Dokumen</h2>
              <div className="mb-2">Masukkan passphrase</div>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-2"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                autoFocus
              />
              {passphraseError && (
                <div className="text-red-600 mb-2">{passphraseError}</div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => setShowPassphraseModal(false)}
                >
                  Batal
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleSubmitPassphrase}
                >
                  Tanda Tangan
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tambahkan tombol download jika id_dokumen tersedia */}
        {showDownloadButton && idDokumen && (
          <a
            href={`http://localhost:8080/api/sign/download/${idDokumen}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded mt-4 inline-block"
          >
            Download PDF Hasil Tanda Tangan
          </a>
        )}
      </div>
    </DndProvider>
  );
}
