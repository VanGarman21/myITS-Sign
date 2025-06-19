import { useEffect, useState, useCallback } from "react";
import Toolbar, { DND_TYPE_SIGNATURE } from "@/components/signature/Toolbar";
import PdfViewer from "@/components/signature/PdfViewer";
import { useRouter } from "next/router";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

export default function PdfEditorPage() {
  const [pdfData, setPdfData] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signatureWidgets, setSignatureWidgets] = useState<
    SignatureWidgetData[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("uploadedPdf");
    if (!data) {
      router.replace("/signature/upload");
    } else {
      setPdfData(data);
    }
  }, [router]);

  const handleDropSignature = useCallback(
    (x: number, y: number, image?: string | null) => {
      setSignatureWidgets((prev) => [
        ...prev,
        {
          x,
          y,
          id: randomId(),
          pageNumber: currentPage,
          image: image || signatureImage,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          isLocked: false,
        },
      ]);
      setDownloadUrl(null);
    },
    [currentPage, signatureImage]
  );

  const handleRemoveSignature = useCallback((id: string) => {
    setSignatureWidgets((prev) => prev.filter((w) => w.id !== id));
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

  // Lock widget (setelah centang di SignatureWidget)
  const handleLockWidget = (id: string) => {
    setSignatureWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isLocked: true } : w))
    );
  };

  // Hanya render widget di halaman aktif
  const widgetsForCurrentPage = signatureWidgets.filter(
    (w) => w.pageNumber === currentPage
  );

  // Cek apakah semua widget di halaman sudah locked
  const allLocked =
    widgetsForCurrentPage.length > 0 &&
    widgetsForCurrentPage.every((w) => w.isLocked);
  const notif = allLocked
    ? "Semua tanda tangan sudah dikunci. Dokumen siap diunduh."
    : null;

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
          } else {
            // Fallback: draw text
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
  }, [allLocked, pdfData, signatureWidgets]);

  // Navigasi halaman
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  if (!pdfData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Memuat PDF...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen relative">
        <div className="w-1/5 bg-gray-100 p-4 border-r">
          <Toolbar
            signatureImage={signatureImage}
            onSignatureImageChange={setSignatureImage}
            notif={notif}
            downloadUrl={downloadUrl}
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
            signatureWidgets={widgetsForCurrentPage}
            onDropSignature={(x, y, item) =>
              handleDropSignature(x, y, item?.image)
            }
            onRemoveSignature={handleRemoveSignature}
            currentPage={currentPage}
            onNumPages={setNumPages}
            onResizeWidget={handleResizeWidget}
            onDragWidget={handleDragWidget}
            onLockWidget={handleLockWidget}
            pdfPageOriginalWidth={0}
            pdfPageOriginalHeight={0}
          />
        </div>
      </div>
    </DndProvider>
  );
}
