import { useDrag } from "react-dnd";
import { useRef } from "react";

export const DND_TYPE_SIGNATURE = "SIGNATURE_WIDGET";

interface ToolbarProps {
  signatureImage: string | null;
  onSignatureImageChange: (base64: string) => void;
  notif?: string | null;
  downloadUrl?: string | null;
}

function resizeImage(base64: string, maxWidth = 300): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = base64;
  });
}

export default function Toolbar({
  signatureImage,
  onSignatureImageChange,
  notif,
  downloadUrl,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DND_TYPE_SIGNATURE,
      item: { image: signatureImage },
      canDrag: !!signatureImage,
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [signatureImage]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onload = async function (ev) {
        if (ev.target?.result) {
          const resized = await resizeImage(ev.target.result as string, 300);
          onSignatureImageChange(resized);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("Mohon upload file gambar PNG atau JPG.");
    }
  };

  return (
    <div>
      {notif && (
        <div
          style={{
            background: "#d1fae5",
            border: "1.5px solid #22c55e",
            color: "#166534",
            borderRadius: 6,
            padding: "8px 12px",
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span>
          <span>{notif}</span>
        </div>
      )}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="signed.pdf"
          className="block px-3 py-2 mb-3 bg-green-600 text-white rounded text-center font-semibold shadow hover:bg-green-700 transition"
          style={{ textDecoration: "none" }}
        >
          Unduh PDF Hasil Signature
        </a>
      )}
      <h2 className="font-bold mb-2">Widget</h2>
      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/png,image/jpeg"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button
          className="px-3 py-2 bg-gray-500 text-white rounded cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Gambar Tanda Tangan
        </button>
        {signatureImage && (
          <div className="flex flex-col items-center mt-2">
            <img
              src={signatureImage}
              alt="Signature Preview"
              style={{
                width: 120,
                height: 48,
                objectFit: "contain",
                border: "1px solid #ccc",
                background: "#fff",
              }}
            />
            <button
              ref={drag}
              className={`mt-2 px-3 py-2 bg-blue-500 text-white rounded cursor-move ${
                isDragging ? "opacity-50" : ""
              }`}
              style={{ opacity: isDragging ? 0.5 : 1 }}
            >
              Drag ke PDF (Tanda Tangan)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
