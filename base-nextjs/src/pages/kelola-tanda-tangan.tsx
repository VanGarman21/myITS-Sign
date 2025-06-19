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
  Flex,
  Image,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiX,
  FiMaximize,
  FiMinimize,
  FiDownload,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
// Import pdf-lib untuk manipulasi dokumen PDF
import { PDFDocument } from "pdf-lib";

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
  // State tambahan untuk PDF
  const [pdfPageCount, setPdfPageCount] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(
    null
  );
  const [isPdfDocument, setIsPdfDocument] = useState(false);
  // Tambahkan state untuk menyimpan aspek rasio
  const [aspectRatio, setAspectRatio] = useState(150 / 80); // rasio default width/height

  // Tambahkan state untuk resize
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const resizeStartPosition = useRef({ x: 0, y: 0 });

  // Tambahkan state untuk preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [documentData, setDocumentData] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Dapatkan dokumen yang sudah ditandatangani
      if (savedData.signedDocumentUrl) {
        setSignedDocumentUrl(savedData.signedDocumentUrl);
      }
    }
  }, []);

  // Fungsi untuk memvalidasi URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Fungsi untuk memvalidasi dan mengakses dokumen
  const validateDocument = async (
    url: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    if (!url) {
      return { isValid: false, error: "URL dokumen kosong" };
    }

    if (!isValidUrl(url)) {
      return { isValid: false, error: "URL dokumen tidak valid" };
    }

    try {
      const response = await fetch(url, {
        method: "HEAD",
        credentials: "include", // Untuk menangani kasus yang memerlukan autentikasi
        headers: {
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        return {
          isValid: false,
          error: `Dokumen tidak dapat diakses (${response.status}: ${response.statusText})`,
        };
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType?.includes("pdf")) {
        return {
          isValid: false,
          error: "Dokumen bukan dalam format PDF",
        };
      }

      return { isValid: true };
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        return {
          isValid: false,
          error:
            "Gagal mengakses dokumen. Kemungkinan masalah CORS atau koneksi",
        };
      }
      return {
        isValid: false,
        error: `Error saat memvalidasi dokumen: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  };

  // Fungsi untuk menghandle upload file
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validasi tipe file
      if (!file.type.includes("pdf")) {
        setError("Hanya file PDF yang diperbolehkan");
        return;
      }

      // Validasi ukuran file (maksimal 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB dalam bytes
      if (file.size > maxSize) {
        setError("Ukuran file tidak boleh lebih dari 10MB");
        return;
      }

      // Konversi file ke URL
      const fileUrl = URL.createObjectURL(file);

      // Simpan ke localStorage
      localStorage.setItem("currentDocument", fileUrl);
      localStorage.setItem("documentName", file.name);

      // Update state
      setDocumentData(fileUrl);
      setDocumentName(file.name);
      setUploadedFile(file);

      // Validasi dan proses PDF
      await checkIfPdfAndCountPages(fileUrl);

      toast({
        title: "Dokumen berhasil diunggah",
        description: file.name,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Terjadi kesalahan saat mengunggah file");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk membersihkan file yang diupload
  const handleClearFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(documentData || "");
    }
    setUploadedFile(null);
    setDocumentData(null);
    setDocumentName(null);
    localStorage.removeItem("currentDocument");
    localStorage.removeItem("documentName");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Tambahkan useEffect untuk cleanup URL.createObjectURL
  useEffect(() => {
    return () => {
      if (uploadedFile && documentData) {
        URL.revokeObjectURL(documentData);
      }
    };
  }, [uploadedFile, documentData]);

  // Fungsi untuk memeriksa apakah dokumen adalah PDF dan menghitung jumlah halaman
  const checkIfPdfAndCountPages = async (url: string) => {
    if (!url) {
      console.log("URL dokumen belum tersedia");
      setError("URL dokumen belum tersedia");
      return;
    }

    try {
      let pdfBytes: ArrayBuffer;

      if (uploadedFile) {
        // Jika file diupload, baca langsung dari File object
        pdfBytes = await uploadedFile.arrayBuffer();
      } else {
        // Jika menggunakan URL
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            Accept: "application/pdf",
          },
        });
        pdfBytes = await response.arrayBuffer();
      }

      try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        setPdfPageCount(pageCount);
        setIsPdfDocument(true);
        console.log(`PDF memiliki ${pageCount} halaman`);
      } catch (pdfError) {
        console.error("Error memproses PDF:", pdfError);
        setError("Dokumen tidak dapat diproses sebagai PDF yang valid");
        setIsPdfDocument(false);
      }
    } catch (error) {
      console.error("Error mengecek dokumen:", error);
      setError("Gagal memproses dokumen PDF. Silakan coba lagi.");
      setIsPdfDocument(false);
    }
  };

  // Fungsi untuk mengubah halaman PDF
  const handleChangePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pdfPageCount) {
      setCurrentPage(newPage);

      // Perlu menyesuaikan posisi tanda tangan dan scroll ke halaman baru
      if (iframeRef.current) {
        try {
          iframeRef.current.src = `${documentData}#page=${newPage}&zoom=page-fit`;
        } catch (e) {
          console.warn("Tidak dapat mengubah halaman:", e);
        }
      }
    }
  };

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
        const img = signatureImageRef.current;
        if (img) {
          // Set aspek rasio berdasarkan gambar asli
          const imageAspectRatio = img.naturalWidth / img.naturalHeight;
          setAspectRatio(imageAspectRatio);

          // Set ukuran awal dengan aspek rasio yang benar
          const initialWidth = 150;
          setSignatureSize({
            width: initialWidth,
            height: initialWidth / imageAspectRatio,
          });
        }
        renderSignature();
      };
      signatureImageRef.current.src = "/dummy.png";
    }
  }, []); // Hapus aspectRatio dari dependency

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

    // Draw resize handle
    ctx.fillStyle = "rgba(59, 130, 246, 0.8)";
    ctx.fillRect(
      position.x + signatureSize.width - 8,
      position.y + signatureSize.height - 8,
      8,
      8
    );

    ctx.restore();
  };

  // Render confirmed signature as a fixed positioned element
  const renderConfirmedSignature = () => {
    if (signedDocumentUrl) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    const savedData = JSON.parse(localStorage.getItem("signatureData") || "{}");
    if (!savedData.documentPosition) return;

    const viewportY = savedData.documentPosition.y - scrollPosition;

    overlay.innerHTML = `
      <div style="
        position: absolute;
        left: ${savedData.documentPosition.x}px;
        top: ${savedData.documentPosition.y}px;
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
    `;
  };

  // Handle drag dengan batasan area
  const handleDragStart = () => {
    setIsDragging(true);
    if (!showSignature && isSigned) {
      setShowSignature(true);
    }
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    if (!isResizing) {
      const maxX = containerSize.width - signatureSize.width;
      const maxY = containerSize.height - signatureSize.height;
      const newX = Math.max(0, Math.min(data.x, maxX));
      const newY = Math.max(0, Math.min(data.y, maxY));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  // Toggle ukuran tanda tangan
  const handleResize = () => {
    setIsExpanded(!isExpanded);
    const newSize = {
      width: isExpanded ? 150 : 200,
      height: isExpanded ? 150 / aspectRatio : 200 / aspectRatio,
    };
    setSignatureSize(newSize);
  };

  // Handle resize start
  const handleResizeStart = (e: any) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartSize.current = { ...signatureSize };
    resizeStartPosition.current = {
      x: e.clientX || e.touches?.[0]?.clientX || 0,
      y: e.clientY || e.touches?.[0]?.clientY || 0,
    };
  };

  // Handle resize drag
  const handleResizeDrag = (
    e: any,
    data: { deltaX: number; deltaY: number }
  ) => {
    if (!isResizing) return;

    const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0;

    const deltaX = currentX - resizeStartPosition.current.x;

    resizeStartPosition.current = {
      x: currentX,
      y: currentY,
    };

    const newWidth = Math.max(
      50,
      Math.min(
        resizeStartSize.current.width + deltaX,
        containerSize.width - position.x
      )
    );

    const newHeight = newWidth / aspectRatio;

    if (position.y + newHeight <= containerSize.height) {
      setSignatureSize({
        width: newWidth,
        height: newHeight,
      });

      resizeStartSize.current = {
        width: newWidth,
        height: newHeight,
      };
    } else {
      const maxHeight = containerSize.height - position.y;
      const adjustedWidth = maxHeight * aspectRatio;

      setSignatureSize({
        width: adjustedWidth,
        height: maxHeight,
      });

      resizeStartSize.current = {
        width: adjustedWidth,
        height: maxHeight,
      };
    }
  };

  // Handle resize stop
  const handleResizeStop = () => {
    setIsResizing(false);
    resizeStartPosition.current = { x: 0, y: 0 };
    resizeStartSize.current = { width: 0, height: 0 };
  };

  // Tambahkan useEffect untuk mengelola overlay di dalam iframe
  useEffect(() => {
    const injectOverlay = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentDocument) return;

        // Hapus overlay lama jika ada
        const oldOverlay =
          iframe.contentDocument.getElementById("signature-overlay");
        if (oldOverlay) {
          oldOverlay.remove();
        }

        if (showSignature || isSigned) {
          // Buat overlay container
          const overlayContainer = iframe.contentDocument.createElement("div");
          overlayContainer.id = "signature-overlay";
          overlayContainer.style.position = "absolute";
          overlayContainer.style.left = "0";
          overlayContainer.style.top = "0";
          overlayContainer.style.width = "100%";
          overlayContainer.style.height = "100%";
          overlayContainer.style.pointerEvents = "none";
          overlayContainer.style.zIndex = "1000";

          // Buat signature element
          const signatureElement = iframe.contentDocument.createElement("div");
          signatureElement.style.position = "absolute";
          signatureElement.style.left = `${position.x}px`;
          signatureElement.style.top = `${position.y}px`;
          signatureElement.style.width = `${signatureSize.width}px`;
          signatureElement.style.height = `${signatureSize.height}px`;
          signatureElement.style.zIndex = "1000";
          signatureElement.style.pointerEvents = "none";

          // Tambahkan gambar tanda tangan
          const signatureImg = iframe.contentDocument.createElement("img");
          signatureImg.src = "/dummy.png";
          signatureImg.alt = "Tanda Tangan";
          signatureImg.style.width = "100%";
          signatureImg.style.height = "100%";
          signatureImg.style.objectFit = "contain";

          signatureElement.appendChild(signatureImg);
          overlayContainer.appendChild(signatureElement);

          // Tambahkan overlay ke dokumen
          const targetElement =
            iframe.contentDocument.body ||
            iframe.contentDocument.documentElement;
          targetElement.appendChild(overlayContainer);
        }
      } catch (error) {
        console.error("Error injecting overlay:", error);
      }
    };

    // Tunggu iframe load
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        injectOverlay();
      };

      iframe.addEventListener("load", handleLoad);

      // Inject juga setelah delay untuk memastikan dokumen sudah siap
      setTimeout(injectOverlay, 500);

      return () => {
        iframe.removeEventListener("load", handleLoad);
      };
    }
  }, [position, signatureSize, showSignature, isSigned]);

  // Fungsi untuk menggabungkan tanda tangan dengan dokumen PDF
  const combineSignatureWithDocument = async () => {
    if (!documentData) return null;

    try {
      const response = await fetch(documentData);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const page = pdfDoc.getPage(0);

      const { width: pdfWidth, height: pdfHeight } = page.getSize();
      const viewportWidth = containerSize.width;
      const viewportHeight = containerSize.height;

      const scaleX = pdfWidth / viewportWidth;
      const scaleY = pdfHeight / viewportHeight;
      const scale = Math.min(scaleX, scaleY);

      const adjustedX = position.x * scale;
      const adjustedY = pdfHeight - (position.y + signatureSize.height) * scale;
      const adjustedWidth = signatureSize.width * scale;
      const adjustedHeight = signatureSize.height * scale;

      try {
        const signatureImageBytes = await fetch("/dummy.png").then((res) =>
          res.arrayBuffer()
        );

        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        page.drawImage(signatureImage, {
          x: adjustedX,
          y: adjustedY,
          width: adjustedWidth,
          height: adjustedHeight,
        });

        const signedPdfBytes = await pdfDoc.save();
        return URL.createObjectURL(
          new Blob([signedPdfBytes], { type: "application/pdf" })
        );
      } catch (error) {
        console.error("Error embedding signature:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error processing document:", error);
      throw error;
    }
  };

  // Handle pra-konfirmasi - menyimpan data dan membuka modal passphrase
  const handlePreConfirm = () => {
    const documentPosition = {
      x: position.x,
      y: position.y + scrollPosition,
    };

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

    setPendingSignature(signatureData);
    setPassphrase("");
    setPassphraseError("");
    onOpen();
  };

  // Handle konfirmasi tanda tangan setelah memasukkan passphrase
  const handleConfirm = async () => {
    if (!passphrase) {
      setPassphraseError("Passphrase tidak boleh kosong");
      return;
    }

    if (passphrase.length < 6) {
      setPassphraseError("Passphrase minimal 6 karakter");
      return;
    }

    try {
      const signatureData = {
        ...pendingSignature,
        passphraseHash: btoa(passphrase),
      };

      setIsSigned(true);
      setShowSignature(false);
      setHasSignedBefore(true);

      // Simpan data ke localStorage
      localStorage.setItem("signatureData", JSON.stringify(signatureData));

      // Gabungkan tanda tangan dengan dokumen
      const signedUrl = await combineSignatureWithDocument();
      if (signedUrl) {
        setSignedDocumentUrl(signedUrl);

        // Refresh iframe dengan URL yang baru
        if (iframeRef.current) {
          iframeRef.current.src = signedUrl;
        }
      }

      // Render ulang tanda tangan
      renderConfirmedSignature();

      toast({
        title: "Tanda tangan berhasil ditambahkan!",
        description: "Dokumen telah ditandatangani",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saat menandatangani:", error);
      toast({
        title: "Gagal menandatangani dokumen",
        description: "Terjadi kesalahan saat mengolah dokumen",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    onClose();
  };

  // Fungsi untuk mengunduh dokumen yang sudah ditandatangani
  const handleDownloadSignedDocument = () => {
    if (!signedDocumentUrl || !documentName) return;

    const a = document.createElement("a");
    a.href = signedDocumentUrl;
    let fileName = `signed_${documentName}`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Dokumen berhasil diunduh",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Hapus tanda tangan dari dokumen
  const handleDeleteSignature = () => {
    setIsSigned(false);
    setHasSignedBefore(false);
    setShowSignature(false);
    setSignedDocumentUrl(null);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    if (overlayRef.current) {
      overlayRef.current.innerHTML = "";
    }

    localStorage.removeItem("signatureData");

    toast({
      title: "Tanda tangan berhasil dihapus",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Komponen untuk menampilkan informasi debugging
  const DebugInfo = () => {
    const [showDebug, setShowDebug] = useState(false);

    return (
      <Box position="fixed" bottom="4" right="4" zIndex="1000">
        <Button size="sm" onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? "Sembunyikan Debug" : "Tampilkan Debug"}
        </Button>

        {showDebug && (
          <Box
            mt="2"
            p="4"
            bg="white"
            boxShadow="lg"
            borderRadius="md"
            maxW="400px"
            fontSize="sm"
          >
            <Text fontWeight="bold" mb="2">
              Informasi Debug:
            </Text>
            <Text>Document URL: {documentData || "Tidak ada"}</Text>
            <Text>Document Name: {documentName || "Tidak ada"}</Text>
            <Text>Is PDF: {isPdfDocument ? "Ya" : "Tidak"}</Text>
            <Text>Page Count: {pdfPageCount}</Text>
            <Text>Loading: {isLoading ? "Ya" : "Tidak"}</Text>
            <Text>Error: {error || "Tidak ada"}</Text>

            <Button
              size="xs"
              mt="2"
              onClick={async () => {
                try {
                  const validation = await validateDocument(documentData || "");
                  alert(JSON.stringify(validation, null, 2));
                } catch (err) {
                  alert(
                    "Error validating: " +
                      (err instanceof Error ? err.message : String(err))
                  );
                }
              }}
            >
              Test Validasi Dokumen
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  // Komponen upload file
  const FileUploadSection = () => (
    <Box mb={6} p={4} borderWidth={1} borderRadius="md">
      <FormControl>
        <FormLabel>Unggah Dokumen PDF</FormLabel>
        <Input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          display="none"
        />
        <Flex gap={2}>
          <Button
            onClick={() => fileInputRef.current?.click()}
            colorScheme="blue"
            isLoading={isLoading}
          >
            Pilih File PDF
          </Button>
          {uploadedFile && (
            <Button
              onClick={handleClearFile}
              colorScheme="red"
              variant="outline"
            >
              Hapus File
            </Button>
          )}
        </Flex>
        {uploadedFile && (
          <Text mt={2} fontSize="sm">
            File terpilih: {uploadedFile.name}
          </Text>
        )}
      </FormControl>
    </Box>
  );

  // Render loading state
  if (isLoading) {
    return (
      <Box p={6} maxW="6xl" mx="auto">
        <Text>Memuat dokumen...</Text>
        <DebugInfo />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box p={6} maxW="6xl" mx="auto">
        <Text color="red.500" whiteSpace="pre-line">
          {error}
        </Text>
        <Button
          mt="4"
          colorScheme="blue"
          onClick={() => {
            localStorage.removeItem("currentDocument");
            localStorage.removeItem("documentName");
            window.location.reload();
          }}
        >
          Reset Dokumen
        </Button>
        <DebugInfo />
      </Box>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tandatangani Dokumen</h1>
        <FileUploadSection />
      </div>

      {documentData ? (
        <div
          className="border rounded-lg overflow-hidden relative bg-gray-50"
          ref={containerRef}
          style={{ height: "600px" }}
        >
          {/* Document display */}
          <div className="absolute top-0 left-0 w-full h-full">
            <iframe
              ref={iframeRef}
              src={`${documentData}${
                pdfPageCount > 1
                  ? `#page=${currentPage}&zoom=page-fit`
                  : "#zoom=page-fit"
              }`}
              className="w-full h-full"
              title="Dokumen untuk ditandatangani"
            />
          </div>

          {/* Canvas overlay untuk tanda tangan saat editing */}
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              zIndex: 10,
              pointerEvents: showSignature ? "auto" : "none",
              display: signedDocumentUrl && isSigned ? "none" : "block",
            }}
          />

          {/* HTML overlay untuk tanda tangan terkonfirmasi */}
          <div
            ref={overlayRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{
              zIndex: 15,
              pointerEvents: "none",
              display: signedDocumentUrl && isSigned ? "none" : "block", // Sembunyikan overlay jika dokumen sudah ditandatangani
            }}
          />

          {/* Hidden image untuk tanda tangan */}
          <img
            ref={signatureImageRef}
            src="/dummy.png"
            alt="Signature"
            style={{ display: "none" }}
          />

          {/* Navigasi halaman untuk PDF */}
          {documentData &&
            isPdfDocument &&
            pdfPageCount > 1 &&
            !showSignature && (
              <div className="absolute top-4 left-4 flex items-center space-x-2 z-20 bg-white px-3 py-1 rounded-md shadow-md">
                <button
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`px-2 py-1 rounded ${
                    currentPage <= 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  &laquo; Prev
                </button>
                <span className="text-sm">
                  Halaman {currentPage} / {pdfPageCount}
                </span>
                <button
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={currentPage >= pdfPageCount}
                  className={`px-2 py-1 rounded ${
                    currentPage >= pdfPageCount
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Next &raquo;
                </button>
              </div>
            )}

          {/* Control buttons */}
          <div className="absolute top-4 right-4 flex space-x-2 z-20">
            {!isSigned && !showSignature && (
              <Button
                onClick={() => setShowSignature(true)}
                colorScheme="blue"
                isDisabled={!documentData || !documentReady}
                size="sm"
              >
                Tanda Tangan
              </Button>
            )}

            {isSigned && !showSignature && (
              <>
                <Button
                  onClick={handleDownloadSignedDocument}
                  colorScheme="blue"
                  size="sm"
                  leftIcon={<FiDownload />}
                >
                  Unduh Dokumen
                </Button>
                <Button
                  onClick={handleDeleteSignature}
                  colorScheme="red"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                >
                  Hapus Tanda Tangan
                </Button>
              </>
            )}
          </div>

          {/* Signature controls when active */}
          {showSignature && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-4">
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
            <>
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

              {/* Resize handle */}
              <DraggableCore
                onStart={handleResizeStart}
                onDrag={handleResizeDrag}
                onStop={handleResizeStop}
              >
                <div
                  style={{
                    position: "absolute",
                    left: position.x + signatureSize.width - 10,
                    top: position.y + signatureSize.height - 10,
                    width: "20px",
                    height: "20px",
                    cursor: "se-resize",
                    background: isResizing
                      ? "rgba(59, 130, 246, 0.8)"
                      : "rgba(59, 130, 246, 0.5)",
                    border: "2px solid white",
                    borderRadius: "50%",
                    zIndex: 20,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "background-color 0.2s",
                  }}
                />
              </DraggableCore>
            </>
          )}

          {/* Status dokumen */}
          {isSigned && !showSignature && (
            <div className="absolute bottom-4 left-4 z-20 bg-green-100 text-green-800 px-3 py-1 rounded-md shadow-md">
              <span className="flex items-center">
                <FiCheck className="mr-1" />
                Dokumen telah ditandatangani
              </span>
            </div>
          )}
        </div>
      ) : (
        <Box p={6} textAlign="center" bg="gray.50" borderRadius="md">
          <Text>Silakan unggah dokumen PDF untuk memulai</Text>
        </Box>
      )}

      <Box mt={4} textAlign="center">
        {!isSigned && !showSignature && (
          <p className="text-sm text-gray-500">
            Klik &quot;Tambah Tanda Tangan&quot;, kemudian geser posisi tanda
            tangan dan klik &quot;Konfirmasi&quot; untuk menyimpan
          </p>
        )}
        {isSigned && !showSignature && (
          <p className="text-sm text-blue-500 mt-1">
            Tanda tangan tersimpan pada posisi absolut di dokumen. Tanda tangan
            akan tetap pada posisi yang sama saat dokumen di-scroll.
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
      <DebugInfo />
    </div>
  );
};

export default TandaTanganPage;
