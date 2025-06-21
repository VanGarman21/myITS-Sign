import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import SignatureWidget from "./SignatureWidget";
import { DND_TYPE_SIGNATURE } from "./Toolbar";

// Untuk Next.js, gunakan path relatif ke node_modules
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

interface SignatureWidgetData {
  x: number;
  y: number;
  id: string;
  image?: string | null;
  width?: number;
  height?: number;
  isLocked?: boolean;
}

interface PdfViewerProps {
  pdfData: string;
  signatureWidgets: SignatureWidgetData[];
  onDropSignature: (x: number, y: number, item?: any) => void;
  onRemoveSignature: (id: string) => void;
  currentPage: number;
  onNumPages: (n: number) => void;
  onResizeWidget: (id: string, width: number, height: number) => void;
  onDragWidget: (id: string, x: number, y: number) => void;
  onLockWidget?: (id: string) => void;
  onPageLoadSuccess?: (page: any) => void;
  pdfPageOriginalWidth: number;
  pdfPageOriginalHeight: number;
}

export default function PdfViewer({
  pdfData,
  signatureWidgets,
  onDropSignature,
  onRemoveSignature,
  currentPage,
  onNumPages,
  onResizeWidget,
  onDragWidget,
  onLockWidget,
  onPageLoadSuccess,
  pdfPageOriginalWidth,
  pdfPageOriginalHeight,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const [, drop] = useDrop(
    () => ({
      accept: DND_TYPE_SIGNATURE,
      drop: (item, monitor) => {
        const offset = monitor.getClientOffset();
        const container = containerRef.current;
        if (container && offset) {
          const rect = container.getBoundingClientRect();
          const x = offset.x - rect.left;
          const y = offset.y - rect.top;
          onDropSignature(x, y, item);
        }
      },
    }),
    [onDropSignature]
  );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full"
      style={{ width: "100%", height: "auto" }}
    >
      <div
        ref={drop}
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "auto",
          position: "relative",
          margin: "0 auto",
        }}
      >
        <Document
          file={pdfData}
          onLoadSuccess={({ numPages }) => onNumPages(numPages)}
          loading={<div>Memuat PDF...</div>}
        >
          <div style={{ display: "block", width: "100%" }}>
            <Page
              key={`page_${currentPage}`}
              pageNumber={currentPage}
              width={containerWidth}
              onLoadSuccess={onPageLoadSuccess}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </div>
        </Document>
        {signatureWidgets.map((w) => (
          <SignatureWidget
            key={w.id}
            x={w.x}
            y={w.y}
            width={w.width || 160}
            height={w.height || 60}
            image={w.image}
            onRemove={() => onRemoveSignature(w.id)}
            onResize={(width, height) => onResizeWidget(w.id, width, height)}
            onDrag={(x, y) => onDragWidget(w.id, x, y)}
            onLock={onLockWidget ? () => onLockWidget(w.id) : undefined}
            isLocked={w.isLocked}
          />
        ))}
      </div>
    </div>
  );
}
