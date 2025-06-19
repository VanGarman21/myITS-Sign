import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [signedPdf, setSignedPdf] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("signedPdf");
    setSignedPdf(data);
  }, []);

  const handleDownload = () => {
    if (!signedPdf) return;
    const link = document.createElement("a");
    link.href = signedPdf;
    link.download = "signed-document.pdf";
    link.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Dokumen Berhasil Ditandatangani!
      </h1>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded mb-4"
        onClick={handleDownload}
        disabled={!signedPdf}
      >
        Download PDF Hasil Signature
      </button>
      <button
        className="px-4 py-2 bg-gray-400 text-white rounded"
        onClick={() => router.push("/signature/upload")}
      >
        Upload PDF Lain
      </button>
    </div>
  );
}
