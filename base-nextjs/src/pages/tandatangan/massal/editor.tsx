import { useEffect, useState } from "react";
import PdfViewer from "@/components/signature/PdfViewer";
import ToolbarDummyOnly from "@/components/signature/ToolbarDummyOnly";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import FooterDokumen from "@/components/signature/FooterDokumen";

const DEFAULT_WIDTH = 160;
const DEFAULT_HEIGHT = 60;

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

export default function MassalEditor() {
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [widgets, setWidgets] = useState<SignatureWidgetData[][]>([]); // per file
  const [currentPages, setCurrentPages] = useState<number[]>([]); // per file
  const [numPagesArr, setNumPagesArr] = useState<number[]>([]); // per file
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLinks, setDownloadLinks] = useState<(string | null)[]>([]);
  const [notifArr, setNotifArr] = useState<(string | null)[]>([]);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  useEffect(() => {
    const arr = sessionStorage.getItem("massalUploadedPdfs");
    if (arr) {
      const pdfArr = JSON.parse(arr) as string[];
      setPdfs(pdfArr);
      setWidgets(pdfArr.map(() => []));
      setCurrentPages(pdfArr.map(() => 1));
      setNumPagesArr(pdfArr.map(() => 1));
      setDownloadLinks(pdfArr.map(() => null));
      setNotifArr(pdfArr.map(() => null));
    }
    // Load dummy signature as data URL
    fetch("/dummy.png")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => setSignatureImage(reader.result as string);
        reader.readAsDataURL(blob);
      });
  }, []);

  const handleDropSignature = (
    fileIdx: number,
    x: number,
    y: number,
    image?: string | null
  ) => {
    setWidgets((prev) =>
      prev.map((w, idx) =>
        idx === fileIdx
          ? [
              ...w,
              {
                x: Number.isFinite(x) ? x : 0,
                y: Number.isFinite(y) ? y : 0,
                id: randomId(),
                pageNumber: currentPages[fileIdx],
                image: image || null,
                width: DEFAULT_WIDTH,
                height: DEFAULT_HEIGHT,
                isLocked: false,
              },
            ]
          : w
      )
    );
    setDownloadLinks((prev) =>
      prev.map((l, idx) => (idx === fileIdx ? null : l))
    );
    setNotifArr((prev) => prev.map((n, idx) => (idx === fileIdx ? null : n)));
  };
  const handleRemoveSignature = (fileIdx: number, id: string) => {
    setWidgets((prev) =>
      prev.map((w, idx) => (idx === fileIdx ? w.filter((x) => x.id !== id) : w))
    );
    setDownloadLinks((prev) =>
      prev.map((l, idx) => (idx === fileIdx ? null : l))
    );
    setNotifArr((prev) => prev.map((n, idx) => (idx === fileIdx ? null : n)));
  };
  const handleResizeWidget = (
    fileIdx: number,
    id: string,
    width: number,
    height: number
  ) => {
    setWidgets((prev) =>
      prev.map((w, idx) =>
        idx === fileIdx
          ? w.map((widget) =>
              widget.id === id
                ? {
                    ...widget,
                    width: Number.isFinite(width)
                      ? Math.round(width)
                      : DEFAULT_WIDTH,
                    height: Number.isFinite(height)
                      ? Math.round(height)
                      : DEFAULT_HEIGHT,
                  }
                : widget
            )
          : w
      )
    );
    setDownloadLinks((prev) =>
      prev.map((l, idx) => (idx === fileIdx ? null : l))
    );
    setNotifArr((prev) => prev.map((n, idx) => (idx === fileIdx ? null : n)));
  };
  const handleDragWidget = (
    fileIdx: number,
    id: string,
    x: number,
    y: number
  ) => {
    setWidgets((prev) =>
      prev.map((w, idx) =>
        idx === fileIdx
          ? w.map((widget) =>
              widget.id === id
                ? {
                    ...widget,
                    x: Number.isFinite(x) ? Math.round(x) : 0,
                    y: Number.isFinite(y) ? Math.round(y) : 0,
                  }
                : widget
            )
          : w
      )
    );
    setDownloadLinks((prev) =>
      prev.map((l, idx) => (idx === fileIdx ? null : l))
    );
    setNotifArr((prev) => prev.map((n, idx) => (idx === fileIdx ? null : n)));
  };
  const handlePageChange = (fileIdx: number, newPage: number) => {
    setCurrentPages((prev) =>
      prev.map((p, idx) => (idx === fileIdx ? newPage : p))
    );
  };
  const handleNumPages = (fileIdx: number, n: number) => {
    setNumPagesArr((prev) => prev.map((p, idx) => (idx === fileIdx ? n : p)));
  };

  // Lock widget (setelah centang di SignatureWidget)
  const handleLockWidget = (fileIdx: number, id: string) => {
    setWidgets((prev) =>
      prev.map((w, idx) =>
        idx === fileIdx
          ? w.map((widget) =>
              widget.id === id ? { ...widget, isLocked: true } : widget
            )
          : w
      )
    );
  };

  // Cek apakah semua widget di dokumen aktif sudah locked
  const widgetsForActiveTab = (widgets[activeTab] || []).filter(
    (w) => w.pageNumber === (currentPages[activeTab] || 1)
  );
  const allLocked =
    widgetsForActiveTab.length > 0 &&
    widgetsForActiveTab.every((w) => w.isLocked);

  // Embed signature ke PDF otomatis jika allLocked dan downloadLinks[activeTab] belum ada
  useEffect(() => {
    const embedIfLocked = async () => {
      if (
        !pdfs[activeTab] ||
        !allLocked ||
        downloadLinks[activeTab] ||
        widgets[activeTab].length === 0
      )
        return;
      setIsProcessing(true);
      try {
        const pdfData = pdfs[activeTab];
        const base64 = pdfData.split(",")[1];
        const pdfBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        for (const w of widgets[activeTab]) {
          const page = pages[w.pageNumber - 1];
          const width = Number.isFinite(w.width) ? w.width! : DEFAULT_WIDTH;
          const height = Number.isFinite(w.height) ? w.height! : DEFAULT_HEIGHT;
          const x = Number.isFinite(w.x) ? w.x : 0;
          const y = Number.isFinite(w.y) ? w.y : 0;
          if (w.image) {
            let img;
            if (w.image.startsWith("data:image/png")) {
              img = await pdfDoc.embedPng(w.image);
            } else {
              img = await pdfDoc.embedJpg(w.image);
            }
            page.drawImage(img, {
              x,
              y: page.getHeight() - y - height,
              width,
              height,
            });
          } else {
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            page.drawText("Signed", {
              x,
              y: page.getHeight() - y - 40,
              size: 24,
              font,
              color: rgb(0, 0, 1),
            });
          }
        }
        const newPdfBytes = await pdfDoc.save();
        const newBase64 =
          "data:application/pdf;base64," + uint8ToBase64(newPdfBytes);
        setDownloadLinks((prev) =>
          prev.map((l, idx) => (idx === activeTab ? newBase64 : l))
        );
        setNotifArr((prev) =>
          prev.map((n, idx) =>
            idx === activeTab
              ? "Semua tanda tangan sudah dikunci. Dokumen siap diunduh."
              : n
          )
        );
        setIsProcessing(false);
      } catch (e) {
        setIsProcessing(false);
        alert("Gagal embed signature ke PDF: " + e);
      }
    };
    embedIfLocked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocked, pdfs, widgets, activeTab]);

  // Tambah signature ke dokumen aktif (hanya satu, jika belum ada yang belum dikunci)
  const handleAddSignature = () => {
    if (!signatureImage) return;
    setWidgets((prev) =>
      prev.map((w, idx) => {
        if (idx !== activeTab) return w;
        // Jika sudah ada signature yang belum dikunci, jangan tambah lagi
        if (w.some((widget) => !widget.isLocked)) return w;
        return [
          ...w,
          {
            x: 100,
            y: 100,
            id: randomId(),
            pageNumber: currentPages[activeTab] || 1,
            image: signatureImage,
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            isLocked: false,
          },
        ];
      })
    );
    setDownloadLinks((prev) =>
      prev.map((l, idx) => (idx === activeTab ? null : l))
    );
    setNotifArr((prev) => prev.map((n, idx) => (idx === activeTab ? null : n)));
  };

  if (pdfs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Tidak ada file PDF yang diupload.
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col min-h-screen">
        <div className="flex gap-2 border-b bg-gray-100 px-4 py-2">
          {pdfs.map((_, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-t ${
                activeTab === idx
                  ? "bg-white font-bold border-t border-l border-r border-gray-300"
                  : "bg-gray-200"
              }`}
              onClick={() => setActiveTab(idx)}
            >
              Dokumen {idx + 1}
            </button>
          ))}
        </div>
        <div className="flex-1 flex">
          <div className="w-1/5 bg-gray-100 p-4 border-r">
            <ToolbarDummyOnly
              notif={notifArr[activeTab] || null}
              downloadUrl={downloadLinks[activeTab] || null}
              onClickSign={handleAddSignature}
            />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2 gap-2">
              <button
                onClick={() =>
                  handlePageChange(
                    activeTab,
                    Math.max(1, (currentPages[activeTab] || 1) - 1)
                  )
                }
                className="px-3 py-1 bg-gray-300 rounded"
                disabled={(currentPages[activeTab] || 1) === 1}
              >
                &lt;
              </button>
              <span>
                Halaman {currentPages[activeTab] || 1} /{" "}
                {numPagesArr[activeTab] || 1}
              </span>
              <button
                onClick={() =>
                  handlePageChange(
                    activeTab,
                    Math.min(
                      numPagesArr[activeTab] || 1,
                      (currentPages[activeTab] || 1) + 1
                    )
                  )
                }
                className="px-3 py-1 bg-gray-300 rounded"
                disabled={
                  (currentPages[activeTab] || 1) ===
                  (numPagesArr[activeTab] || 1)
                }
              >
                &gt;
              </button>
            </div>
            {/* Show dummy signature image above editor if signed (notif present) */}
            {notifArr[activeTab] && (
              <div className="mb-4 flex flex-col items-center"></div>
            )}
            <PdfViewer
              pdfData={pdfs[activeTab]}
              signatureWidgets={(widgets[activeTab] || []).filter(
                (w) => w.pageNumber === (currentPages[activeTab] || 1)
              )}
              onDropSignature={() => {}}
              onRemoveSignature={(id) => handleRemoveSignature(activeTab, id)}
              currentPage={currentPages[activeTab] || 1}
              onNumPages={(n) => handleNumPages(activeTab, n)}
              onResizeWidget={(id, width, height) =>
                handleResizeWidget(activeTab, id, width, height)
              }
              onDragWidget={(id, x, y) => handleDragWidget(activeTab, id, x, y)}
              onLockWidget={(id) => handleLockWidget(activeTab, id)}
              pdfPageOriginalWidth={0}
              pdfPageOriginalHeight={0}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
