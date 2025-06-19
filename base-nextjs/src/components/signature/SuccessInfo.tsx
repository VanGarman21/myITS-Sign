interface SuccessInfoProps {
  onDownload: () => void;
  onUploadAnother: () => void;
  disabled?: boolean;
}

export default function SuccessInfo({
  onDownload,
  onUploadAnother,
  disabled,
}: SuccessInfoProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">
        Dokumen Berhasil Ditandatangani!
      </h1>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded mb-4"
        onClick={onDownload}
        disabled={disabled}
      >
        Download PDF Hasil Signature
      </button>
      <button
        className="px-4 py-2 bg-gray-400 text-white rounded"
        onClick={onUploadAnother}
      >
        Upload PDF Lain
      </button>
    </div>
  );
}
