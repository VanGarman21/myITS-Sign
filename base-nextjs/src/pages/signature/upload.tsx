import { useRouter } from "next/router";
import { useRef, useState } from "react";

export default function UploadPdfPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signType, setSignType] = useState<"single" | "batch">("single");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (signType === "single") {
      const file = files[0];
      if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function (ev) {
          if (ev.target?.result) {
            sessionStorage.setItem("uploadedPdf", ev.target.result as string);
            router.push("/signature/editor");
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert("Mohon upload file PDF.");
      }
    } else {
      // batch
      const pdfs: string[] = [];
      let loaded = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== "application/pdf") {
          alert("Semua file harus PDF!");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          if (ev.target?.result) {
            pdfs[i] = ev.target.result as string;
            loaded++;
            if (loaded === files.length) {
              sessionStorage.setItem("batchUploadedPdfs", JSON.stringify(pdfs));
              router.push("/signature/batch-editor");
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Upload PDF untuk Signature</h1>
      <div className="mb-4 flex gap-4">
        <label>
          <input
            type="radio"
            name="signType"
            value="single"
            checked={signType === "single"}
            onChange={() => setSignType("single")}
          />{" "}
          Tanda tangan sendiri
        </label>
        <label>
          <input
            type="radio"
            name="signType"
            value="batch"
            checked={signType === "batch"}
            onChange={() => setSignType("batch")}
          />{" "}
          Tanda tangan massal
        </label>
      </div>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="mb-4"
        multiple={signType === "batch"}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => fileInputRef.current?.click()}
      >
        Pilih File PDF{signType === "batch" ? " (bisa banyak)" : ""}
      </button>
    </div>
  );
}
