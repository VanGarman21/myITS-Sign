import { Document, Page, pdfjs } from "react-pdf";
import { useState, useRef } from "react";
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
      style={{ minHeight: pdfPageOriginalHeight || 700 }}
    >
      <div
        ref={drop}
        style={{
          width: pdfPageOriginalWidth || 600,
          height: pdfPageOriginalHeight || 700,
          position: "relative",
        }}
      >
        <Document
          file={pdfData}
          onLoadSuccess={({ numPages }) => onNumPages(numPages)}
          loading={<div>Memuat PDF...</div>}
        >
          <Page
            key={`page_${currentPage}`}
            pageNumber={currentPage}
            width={pdfPageOriginalWidth || 600}
            height={pdfPageOriginalHeight || undefined}
            onLoadSuccess={onPageLoadSuccess}
          />
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
