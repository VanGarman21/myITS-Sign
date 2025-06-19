import React from "react";

interface ToolbarDummyOnlyProps {
  notif?: string | null;
  downloadUrl?: string | null;
  onClickSign: () => void;
}

export default function ToolbarDummyOnly({
  notif,
  downloadUrl,
  onClickSign,
}: ToolbarDummyOnlyProps) {
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

      {!notif && (
        <button
          className="w-full px-3 py-2 bg-blue-500 text-white rounded font-semibold shadow hover:bg-blue-600 transition"
          onClick={onClickSign}
        >
          Tanda Tangan
        </button>
      )}
    </div>
  );
}
