import { useRef, useState, useEffect } from "react";

interface SignatureWidgetProps {
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string | null;
  onRemove?: () => void;
  onResize?: (width: number, height: number) => void;
  onDrag?: (x: number, y: number) => void;
  onLock?: () => void;
  isLocked?: boolean;
}

export default function SignatureWidget({
  x,
  y,
  width,
  height,
  image,
  onRemove,
  onResize,
  onDrag,
  onLock,
  isLocked,
}: SignatureWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizing = useRef(false);
  const [locked, setLocked] = useState(isLocked || false);
  const [imgSize, setImgSize] = useState<{
    w: number;
    h: number;
    ratio: number;
  } | null>(null);
  const [widgetSize, setWidgetSize] = useState<{ w: number; h: number }>({
    w: width,
    h: height,
  });

  // Sync locked state with prop
  if (locked !== !!isLocked) setLocked(!!isLocked);

  // Ambil ukuran asli gambar saat load
  useEffect(() => {
    if (image) {
      const img = new window.Image();
      img.onload = function () {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        setImgSize({ w, h, ratio: w / h });
        // Hanya set ukuran default jika width/height belum ada
        if (!width || !height) {
          let maxW = w > 320 ? 320 : w;
          let maxH = maxW / (w / h);
          setWidgetSize({ w: maxW, h: maxH });
          if (onResize) onResize(maxW, maxH);
        }
      };
      img.src = image;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  // Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (locked) return;
    if ((e.target as HTMLElement).classList.contains("resize-handle")) return;
    dragOffset.current = {
      x: e.clientX - x,
      y: e.clientY - y,
    };
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
  };
  const handleDragMove = (e: MouseEvent) => {
    if (onDrag) {
      onDrag(
        e.clientX - dragOffset.current.x,
        e.clientY - dragOffset.current.y
      );
    }
  };
  const handleDragEnd = () => {
    document.removeEventListener("mousemove", handleDragMove);
    document.removeEventListener("mouseup", handleDragEnd);
  };

  // Resize dengan aspect ratio tetap
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (locked) return;
    e.stopPropagation();
    resizing.current = true;
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };
  const handleResizeMove = (e: MouseEvent) => {
    if (onResize && widgetRef.current && resizing.current && imgSize) {
      const rect = widgetRef.current.getBoundingClientRect();
      let newWidth = Math.max(40, e.clientX - rect.left);
      // Hitung height dari width sesuai aspect ratio
      let newHeight = newWidth / imgSize.ratio;
      setWidgetSize({ w: newWidth, h: newHeight });
      onResize(newWidth, newHeight);
    }
  };
  const handleResizeEnd = () => {
    resizing.current = false;
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  };

  const handleLock = () => {
    setLocked(true);
    if (onLock) onLock();
  };

  // Widget size selalu ikut gambar
  const w = widgetSize.w;
  const h = widgetSize.h;

  if (locked) {
    // Hanya render gambar signature tanpa border/box/tombol/label
    return image ? (
      <img
        src={image}
        alt="Signature"
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          objectFit: "contain",
          background: "transparent",
          zIndex: 10,
          pointerEvents: "none",
        }}
      />
    ) : null;
  }

  return (
    <div
      ref={widgetRef}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        background: "transparent",
        border: "2px dashed #888",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: locked ? "default" : "move",
        zIndex: 10,
        userSelect: "none",
        boxShadow: locked ? "0 0 0 1px #4ade80" : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {image && (
        <img
          src={image}
          alt="Signature"
          style={{
            width: w,
            height: h,
            objectFit: "contain",
            background: "transparent",
            borderRadius: 4,
          }}
        />
      )}
      {/* Action buttons */}
      {!locked && (
        <div
          style={{
            display: "flex",
            gap: 16,
            position: "absolute",
            bottom: -28,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <button
            onClick={onRemove}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#dc2626",
              border: "none",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px #0002",
              cursor: "pointer",
            }}
            title="Hapus"
          >
            ✕
          </button>
          <button
            onClick={handleLock}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#22c55e",
              border: "none",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 4px #0002",
              cursor: "pointer",
            }}
            title="Selesai"
          >
            ✓
          </button>
        </div>
      )}
      {/* Resize handle */}
      {!locked && (
        <div
          className="resize-handle"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            width: 16,
            height: 16,
            background: "#2563eb",
            borderRadius: "0 0 8px 0",
            cursor: "nwse-resize",
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
}
