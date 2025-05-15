import { useState, useRef, useEffect } from "react";
import { DraggableCore } from "react-draggable";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { FiCheck, FiX, FiMaximize, FiMinimize } from "react-icons/fi";

const TandaTanganPage = () => {
  const [showSignature, setShowSignature] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [signatureSize, setSignatureSize] = useState({
    width: 150,
    height: 80,
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [documentSize, setDocumentSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const signatureImageRef = useRef<HTMLImageElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [documentReady, setDocumentReady] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<any>(null);
  const [passphrase, setPassphrase] = useState("");
  const [passphraseError, setPassphraseError] = useState("");
  const [hasSignedBefore, setHasSignedBefore] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const documentData = localStorage.getItem("currentDocument");
  const documentName = localStorage.getItem("documentName");

  // Check if document has been signed before
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("signatureData") || "{}");

    if (savedData.position) {
      setIsSigned(true);
      setHasSignedBefore(true);

      if (savedData.documentPosition) {
        setPosition({
          x: savedData.documentPosition.x,
          y: savedData.documentPosition.y,
        });
      } else {
        setPosition({
          x: savedData.position.x,
          y: savedData.position.y,
        });
      }

      if (savedData.size) {
        setSignatureSize({
          width: savedData.size.width,
          height: savedData.size.height,
        });
      }
    }
  }, []);

  // Render signature (either on canvas for editing or directly for signed state)
  const renderSignature = () => {
    if (isSigned && !showSignature) {
      // For confirmed signatures, render as a fixed element in the container
      renderConfirmedSignature();
    } else if (showSignature) {
      // For editing mode, render on canvas
      renderEditingSignature();
    } else {
      // Clear canvas if no signature is being shown or edited
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      }
    }
  };

  // Load dummy signature image
  useEffect(() => {
    if (signatureImageRef.current) {
      signatureImageRef.current.onload = () => {
        renderSignature();
      };
      signatureImageRef.current.src = "/dummy.png";
    }
  }, []);

  // Handle iframe load and get document dimensions
  useEffect(() => {
    const handleIframeLoad = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentDocument) {
          // Get document dimensions
          const doc = iframeRef.current.contentDocument;
          const docElement = doc.documentElement;

          // Set document size
          setDocumentSize({
            width: Math.max(docElement.scrollWidth, docElement.clientWidth),
            height: Math.max(docElement.scrollHeight, docElement.clientHeight),
          });

          // Create a listener for scroll events on the iframe document
          const handleScroll = () => {
            try {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                const newScrollY =
                  iframeRef.current.contentWindow.scrollY ||
                  doc.documentElement.scrollTop ||
                  0;
                setScrollPosition(newScrollY);
              }
            } catch (e) {
              console.error("Error accessing scroll position:", e);
            }
          };

          // Add scroll event listener
          try {
            iframeRef.current.contentWindow?.addEventListener(
              "scroll",
              handleScroll
            );
          } catch (e) {
            console.warn("Could not add scroll listener:", e);
          }

          setDocumentReady(true);
        }
      } catch (e) {
        console.error("Cannot access iframe document:", e);
      }
    };

    if (iframeRef.current) {
      iframeRef.current.onload = handleIframeLoad;

      // Check if already loaded
      try {
        if (iframeRef.current.contentDocument?.readyState === "complete") {
          handleIframeLoad();
        }
      } catch (e) {
        console.warn("Could not check if iframe is already loaded:", e);
      }
    }

    return () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.removeEventListener(
            "scroll",
            () => {}
          );
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    };
  }, []);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });

        // Update canvas size to match container
        if (canvasRef.current) {
          canvasRef.current.width = rect.width;
          canvasRef.current.height = rect.height;
        }
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Re-render signature when position, size, or other states change
  useEffect(() => {
    renderSignature();
  }, [
    position,
    signatureSize,
    isDragging,
    isSigned,
    showSignature,
    scrollPosition,
  ]);

  // Set initial position for new signatures
  useEffect(() => {
    if (
      showSignature &&
      !isSigned &&
      containerSize.width > 0 &&
      containerSize.height > 0 &&
      documentReady
    ) {
      try {
        if (iframeRef.current) {
          const contentRect = iframeRef.current.getBoundingClientRect();
          const visibleWidth = contentRect.width;
          const visibleHeight = contentRect.height;

          // Position in the center of the visible area
          setPosition({
            x: visibleWidth / 2 - signatureSize.width / 2,
            y: scrollPosition + visibleHeight / 2 - signatureSize.height / 2,
          });
        }
      } catch (e) {
        // Fallback if iframe access fails
        setPosition({
          x: containerSize.width / 2 - signatureSize.width / 2,
          y: containerSize.height / 2 - signatureSize.height / 2,
        });
      }
    }
  }, [
    showSignature,
    containerSize,
    signatureSize,
    isSigned,
    documentReady,
    scrollPosition,
  ]);

  // Render signature in editing mode
  const renderEditingSignature = () => {
    const canvas = canvasRef.current;
    const signatureImg = signatureImageRef.current;

    if (!canvas || !signatureImg || !signatureImg.complete) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw border box (dashed when editing)
    ctx.save();
    ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]); // Always dashed in edit mode
    ctx.strokeRect(
      position.x,
      position.y,
      signatureSize.width,
      signatureSize.height
    );

    // Draw signature image
    ctx.globalAlpha = isDragging ? 0.8 : 1;
    ctx.drawImage(
      signatureImg,
      position.x + 4,
      position.y + 4,
      signatureSize.width - 8,
      signatureSize.height - 8
    );
    ctx.globalAlpha = 1;

    ctx.restore();
  };

  // Render confirmed signature as a fixed positioned element
  const renderConfirmedSignature = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Get saved signature data
    const savedData = JSON.parse(localStorage.getItem("signatureData") || "{}");
    if (!savedData.documentPosition) return;

    // Calculate viewport position based on document position and current scroll
    const viewportY = savedData.documentPosition.y - scrollPosition;

    // Check if signature is in visible area
    const isVisible =
      viewportY + savedData.size.height >= 0 &&
      viewportY <= containerSize.height;

    // Render as HTML element for better performance and fixed positioning
    overlay.innerHTML = isVisible
      ? `
      <div style="
        position: absolute;
        left: ${savedData.documentPosition.x}px;
        top: ${viewportY}px;
        width: ${savedData.size.width}px;
        height: ${savedData.size.height}px;
        background-color: transparent;
        padding: 0;
        pointer-events: none;
        z-index: 20;
      ">
        <img 
          src="/dummy.png"
          alt="Tanda Tangan"
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
          "
        />
      </div>
    `
      : "";

    // Tambahan: Jika dokumen punya iframe, coba tambahkan tanda tangan ke iframe juga
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
        // Cek apakah tanda tangan sudah ada di iframe
        const existingSignature =
          iframe.contentDocument.getElementById("embedded-signature");
        if (!existingSignature) {
          // Tambahkan tanda tangan ke iframe
          const signatureElement = iframe.contentDocument.createElement("div");
          signatureElement.id = "embedded-signature";
          signatureElement.style.position = "absolute";
          signatureElement.style.left = `${savedData.documentPosition.x}px`;
          signatureElement.style.top = `${savedData.documentPosition.y}px`;
          signatureElement.style.width = `${savedData.size.width}px`;
          signatureElement.style.height = `${savedData.size.height}px`;
          signatureElement.style.zIndex = "9999";
          signatureElement.style.pointerEvents = "none";

          const signatureImg = iframe.contentDocument.createElement("img");
          signatureImg.src = "/dummy.png";
          signatureImg.alt = "Tanda Tangan";
          signatureImg.style.width = "100%";
          signatureImg.style.height = "100%";
          signatureImg.style.objectFit = "contain";

          signatureElement.appendChild(signatureImg);
          iframe.contentDocument.body.appendChild(signatureElement);
        }
      }
    } catch (e) {
      // Ignore errors - cross-origin restrictions might prevent this
      console.warn("Cannot embed signature directly in document:", e);
    }
  };

  // Handle drag dengan batasan area
  const handleDragStart = () => {
    setIsDragging(true);

    // Jika belum dalam mode edit dan sudah ada tanda tangan, masuk ke mode edit
    if (!showSignature && isSigned) {
      setShowSignature(true);
    }
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    // Get bounds for document
    let maxX, maxY;

    try {
      if (documentSize.width > 0) {
        maxX = documentSize.width - signatureSize.width;
        maxY = documentSize.height - signatureSize.height;
      } else {
        maxX = containerSize.width - signatureSize.width;
        maxY = containerSize.height - signatureSize.height;
      }
    } catch (e) {
      maxX = containerSize.width - signatureSize.width;
      maxY = containerSize.height - signatureSize.height;
    }

    const newX = Math.max(0, Math.min(data.x, maxX));
    const newY = Math.max(0, Math.min(data.y, maxY));

    setPosition({
      x: newX,
      y: newY,
    });
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  // Toggle ukuran tanda tangan
  const handleResize = () => {
    setIsExpanded(!isExpanded);
    const newSize = {
      width: isExpanded ? 150 : 200,
      height: isExpanded ? 80 : 120,
    };
    setSignatureSize(newSize);
  };

  // Handle pra-konfirmasi - menyimpan data dan membuka modal passphrase
  const handlePreConfirm = () => {
    // Jika sudah pernah tandatangan sebelumnya, tidak bisa lagi
    if (hasSignedBefore && !isSigned) {
      toast({
        title: "Dokumen sudah ditandatangani",
        description:
          "Anda tidak dapat menandatangani dokumen yang sama dua kali",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Get current document position (x, y + current scroll)
    const documentPosition = {
      x: position.x,
      y: position.y + scrollPosition,
    };

    // Simpan data sementara
    const signatureData = {
      position: position,
      documentPosition: documentPosition,
      scrollPosition: scrollPosition,
      documentSize: documentSize,
      size: {
        width: signatureSize.width,
        height: signatureSize.height,
      },
      documentId: documentData,
      timestamp: new Date().toISOString(),
    };

    // Simpan data untuk digunakan nanti
    setPendingSignature(signatureData);

    // Reset passphrase dan error
    setPassphrase("");
    setPassphraseError("");

    // Buka modal passphrase
    onOpen();
  };

  // Handle konfirmasi tanda tangan setelah memasukkan passphrase
  const handleConfirm = () => {
    // Validasi passphrase
    if (!passphrase) {
      setPassphraseError("Passphrase tidak boleh kosong");
      return;
    }

    if (passphrase.length < 6) {
      setPassphraseError("Passphrase minimal 6 karakter");
      return;
    }

    // Gunakan data yang tersimpan sebelumnya
    const signatureData = pendingSignature;
    if (!signatureData) {
      onClose();
      return;
    }

    // Tambahkan hash passphrase ke data tanda tangan (di implementasi nyata, gunakan enkripsi yang aman)
    signatureData.passphraseHash = btoa(passphrase);

    // Simpan data di localStorage
    localStorage.setItem("signatureData", JSON.stringify(signatureData));

    // Update state
    setIsSigned(true);
    setShowSignature(false);
    setHasSignedBefore(true);

    // Clear canvas and render confirmed signature
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    // Render the confirmed signature
    renderConfirmedSignature();

    toast({
      title: "Tanda tangan berhasil disimpan!",
      description: "Tanda tangan telah dilekatkan pada dokumen",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Di implementasi nyata, kirim data ke backend
    sendSignatureDataToBackend(signatureData);

    // Tutup modal
    onClose();
  };

  // Fungsi untuk mengirim data tanda tangan ke backend
  const sendSignatureDataToBackend = (signatureData: any) => {
    // Implementasi pengiriman data ke backend menggunakan fetch atau axios
    console.log("Mengirim data tanda tangan ke backend:", signatureData);

    // Contoh implementasi dengan fetch (dikomentari)
    /*
    fetch('/api/sign-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signatureData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Berhasil:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
        toast({
          title: "Gagal mengirim data tanda tangan",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
    */
  };

  // Reset tanda tangan dan mulai dari awal
  const handleReset = () => {
    setIsSigned(false);
    setShowSignature(true);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    // Clear overlay
    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
    }

    // Hapus tanda tangan dari iframe jika ada
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const existingSignature =
          iframe.contentDocument.getElementById("embedded-signature");
        if (existingSignature) {
          existingSignature.remove();
        }
      }
    } catch (e) {
      console.warn("Cannot remove signature from iframe:", e);
    }

    // Hapus data tersimpan
    localStorage.removeItem("signatureData");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tandatangani Dokumen</h1>
        <p className="text-gray-600">
          {documentName || "Dokumen tidak ditemukan"}
        </p>
      </div>

      <div
        className="border rounded-lg overflow-hidden relative bg-gray-50"
        ref={containerRef}
        style={{ height: "600px" }}
      >
        {/* Document display */}
        <div className="absolute top-0 left-0 w-full h-full">
          {documentData ? (
            <iframe
              ref={iframeRef}
              src={documentData}
              className="w-full h-full"
              title="Dokumen untuk ditandatangani"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Tidak ada dokumen tersedia
            </div>
          )}
        </div>

        {/* Canvas overlay untuk tanda tangan saat editing */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            zIndex: 10,
            pointerEvents: showSignature ? "auto" : "none",
          }}
        />

        {/* HTML overlay untuk tanda tangan terkonfirmasi */}
        <div
          ref={overlayRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            zIndex: 15,
            pointerEvents: "none",
          }}
        />

        {/* Hidden image untuk tanda tangan */}
        <img
          ref={signatureImageRef}
          src="/dummy.png"
          alt="Signature"
          style={{ display: "none" }}
        />

        {/* Control buttons */}
        <div className="absolute top-4 right-4 flex space-x-2 z-20">
          <Button
            onClick={() => setShowSignature(true)}
            colorScheme="blue"
            isDisabled={
              !documentData ||
              !documentReady ||
              showSignature ||
              (hasSignedBefore && !isSigned)
            }
            size="sm"
          >
            {isSigned ? "Edit Tanda Tangan" : "Tambah Tanda Tangan"}
          </Button>
        </div>

        {/* Signature controls when active */}
        {showSignature && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-4">
            <Tooltip label="Perkecil/Perbesar" placement="top">
              <IconButton
                aria-label="Resize"
                icon={isExpanded ? <FiMinimize /> : <FiMaximize />}
                onClick={handleResize}
                colorScheme="blue"
                size="sm"
              />
            </Tooltip>

            <Button
              onClick={() => setShowSignature(false)}
              colorScheme="gray"
              size="sm"
            >
              Batal
            </Button>

            <Button onClick={handlePreConfirm} colorScheme="green" size="sm">
              Konfirmasi
            </Button>
          </div>
        )}

        {/* Draggable area for signature */}
        {showSignature && (
          <DraggableCore
            onStart={handleDragStart}
            onDrag={handleDrag}
            onStop={handleDragStop}
          >
            <div
              style={{
                position: "absolute",
                left: position.x,
                top: position.y,
                width: signatureSize.width,
                height: signatureSize.height,
                cursor: "move",
                zIndex: 15,
                opacity: 0, // Transparent but draggable
              }}
            />
          </DraggableCore>
        )}
      </div>

      <Box mt={4} textAlign="center">
        <p className="text-sm text-gray-500">
          Klik &quot;Tambah Tanda Tangan&quot;, kemudian geser posisi tanda
          tangan dan klik &quot;Konfirmasi&quot; untuk menyimpan
        </p>
        {isSigned && !showSignature && (
          <p className="text-sm text-blue-500 mt-1">
            Tanda tangan tersimpan pada posisi absolut di dokumen. Tanda tangan
            akan tetap pada posisi yang sama saat dokumen di-scroll.
          </p>
        )}
        {hasSignedBefore && !isSigned && (
          <p className="text-sm text-red-500 mt-1">
            Dokumen ini telah ditandatangani sebelumnya. Dokumen hanya dapat
            ditandatangani sekali.
          </p>
        )}
      </Box>

      {/* Modal Konfirmasi Passphrase */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Masukkan Passphrase untuk Konfirmasi</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text mb={4}>
              Masukkan passphrase untuk mengonfirmasi tanda tangan Anda.
              Passphrase ini akan digunakan untuk memverifikasi tanda tangan
              digital.
            </Text>

            <FormControl isInvalid={!!passphraseError}>
              <FormLabel>Passphrase</FormLabel>
              <Input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Masukkan passphrase Anda"
              />
              {passphraseError && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {passphraseError}
                </Text>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Batal
            </Button>
            <Button colorScheme="blue" onClick={handleConfirm}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default TandaTanganPage;
