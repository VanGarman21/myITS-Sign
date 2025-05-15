import { useState, useRef, useEffect } from "react";
import { DraggableCore } from "react-draggable";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const TandaTanganPage = () => {
  const [showSignature, setShowSignature] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [signatureSize, setSignatureSize] = useState({
    width: 120,
    height: 60,
  });
  const [isSigned, setIsSigned] = useState(false);

  const documentData = localStorage.getItem("currentDocument");
  const documentName = localStorage.getItem("documentName");

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width - 40, // Account for padding
          height: rect.height - 40,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle drag with boundary constraints
  const handleDrag = (e: any, data: { x: number; y: number }) => {
    const maxX = containerSize.width - signatureSize.width;
    const maxY = containerSize.height - signatureSize.height;

    const newX = Math.max(20, Math.min(data.x, maxX + 20));
    const newY = Math.max(20, Math.min(data.y, maxY + 20));

    setPosition({ x: newX, y: newY });
  };

  // Handle konfirmasi tanda tangan
  const handleConfirm = () => {
    setIsSigned(true);
    alert("Tanda tangan berhasil disimpan!");
    setShowSignature(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tandatangani Dokumen</h1>
        <p className="text-gray-600">{documentName}</p>
      </div>

      <div
        className="border rounded-lg overflow-hidden relative bg-gray-50"
        ref={containerRef}
        style={{ height: "600px" }}
      >
        {documentData && (
          <iframe src={documentData} className="w-full h-full" />
        )}

        {/* Tanda Tangan Button */}
        <button
          onClick={() => setShowSignature(true)}
          className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-md"
          disabled={!documentData}
        >
          Tanda Tangan
        </button>

        {showSignature && (
          <TransformWrapper
            onZoom={(ref) =>
              setSignatureSize({
                width: 120 * ref.state.scale,
                height: 60 * ref.state.scale,
              })
            }
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <div>
                {/* Draggable Signature */}
                <DraggableCore onDrag={handleDrag} disabled={isSigned}>
                  <div
                    style={{
                      position: "absolute",
                      left: position.x,
                      top: position.y,
                      cursor: isSigned ? "default" : "move",
                      zIndex: 50,
                    }}
                  >
                    <TransformComponent>
                      <div className="relative">
                        {/* Action Buttons - Selalu tampil */}
                        <div className="absolute -top-8 left-0 right-0 flex justify-between">
                          <button
                            onClick={() => setShowSignature(false)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center 
                              hover:bg-red-600 shadow-md transform -translate-x-1/2"
                          >
                            ×
                          </button>
                          <button
                            onClick={handleConfirm}
                            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center 
                              hover:bg-green-600 shadow-md transform translate-x-1/2"
                          >
                            ✓
                          </button>
                        </div>

                        {/* Signature Image */}
                        <img
                          src="/dummy.png"
                          alt="Spesimen Tanda Tangan"
                          className="border-2 border-blue-500 rounded-lg shadow-xl"
                          style={{
                            width: `${signatureSize.width}px`,
                            height: `${signatureSize.height}px`,
                            pointerEvents: isSigned ? "none" : "auto",
                          }}
                        />
                      </div>
                    </TransformComponent>
                  </div>
                </DraggableCore>
              </div>
            )}
          </TransformWrapper>
        )}

        {/* Tambahkan ini untuk menampilkan tanda tangan terkunci */}
        {isSigned && (
          <div
            style={{
              position: "absolute",
              left: position.x,
              top: position.y,
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            <img
              src="/dummy.png"
              alt="Tanda Tangan Terkunci"
              className="border-2 border-blue-500 rounded-lg shadow-xl"
              style={{
                width: `${signatureSize.width}px`,
                height: `${signatureSize.height}px`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TandaTanganPage;
