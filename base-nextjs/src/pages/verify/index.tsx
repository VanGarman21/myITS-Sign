import React, { useState } from "react";
import PageTransition from "@/components/PageLayout";
import VerifyUploadForm from "@/components/verify/VerifyUploadForm";
import { Box, Text, Flex, Stack } from "@chakra-ui/react";

const MAX_FILE_SIZE_MB = 10;

const VerifyPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null); // result dari backend
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError("Ukuran file melebihi 10 MB");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
      setResult(null);
    }
  };

  const getCsrfToken = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/csrf-cookie`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Gagal mengambil CSRF token");
      return true;
    } catch (err) {
      setError("Gagal mempersiapkan verifikasi");
      return false;
    }
  };

  const handleVerification = async () => {
    if (!selectedFile) {
      setError("Silakan pilih dokumen terlebih dahulu");
      return;
    }

    const csrfReady = await getCsrfToken();
    if (!csrfReady) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("document", selectedFile);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        setError("Response dari server tidak valid atau bukan JSON.");
        setIsLoading(false);
        return;
      }
      if (result.success) {
        setResult(result.data);
      } else {
        setError(result.message || "Verifikasi gagal");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat verifikasi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk status
  const isValid = result && result.summary === "VALID";
  const isInvalid = result && result.summary !== "VALID";

  return (
    <PageTransition pageTitle="Verifikasi Dokumen">
      {/* Judul utama */}
      <Box width="100%" maxW={900} mx="auto" my="2.5rem" px={4}></Box>
      {/* Panel 1: Form Upload */}
      <Box
        maxW={900}
        mx="auto"
        my={0}
        px={{ base: 4, md: 8 }}
        py={10}
        borderRadius={16}
        bg="white"
        boxShadow="md"
      >
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight={600} mb={6}>
          Pilih Dokumen Anda
        </Text>
        <VerifyUploadForm
          selectedFile={selectedFile}
          isLoading={isLoading}
          onFileSelect={handleFileSelect}
          onProcess={handleVerification}
        />
        <Text color="gray.500" fontSize="sm" mt={3} ml={1}>
          Hanya dapat mengunggah berkas dengan format <b>.pdf</b>
          <br />
          Ukuran maksimum berkas : 10 MB
        </Text>
        {error && !result && (
          <Text color="red.500" mt={2} fontSize="sm">
            {error}
          </Text>
        )}
      </Box>

      {/* Panel Hasil Verifikasi modern & responsif */}
      {(result || (error && selectedFile)) && (
        <Box
          mt={8}
          px={{ base: 2, md: 0 }}
          width="100%"
          display="flex"
          justifyContent="center"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align="flex-start"
            gap={{ base: 4, md: 8 }}
            width="100%"
            maxW={800}
            bg={isValid ? "green.50" : "red.50"}
            borderWidth={1}
            borderColor={isValid ? "green.300" : "red.300"}
            borderRadius={16}
            p={{ base: 4, md: 6 }}
            boxSizing="border-box"
            flexWrap="wrap"
          >
            <Box
              minW={100}
              maxW={140}
              w={{ base: "100%", md: 140 }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={{ base: 2, md: 0 }}
            >
              <img
                src={
                  result && result.summary === "VALID"
                    ? "/document-verify.svg"
                    : "/document-not-verify.svg"
                }
                alt={
                  result && result.summary === "VALID" ? "Valid" : "Not Valid"
                }
                style={{ width: 100, height: 100, objectFit: "contain" }}
              />
            </Box>
            <Box flex={1} minW={0}>
              <Stack
                direction="column"
                spacing={3}
                mb={2}
                align="flex-start"
              >
                <Flex
                  align="center"
                  gap={2}
                  fontSize={{ base: "md", md: "lg" }}
                  color={isValid ? "green.600" : "red.600"}
                  fontWeight={600}
                  wrap="wrap"
                >
                  <Box as="span" fontSize={22}>
                    {result && result.summary === "VALID" ? "✔" : "✖"}
                  </Box>
                  <Text as="span" fontWeight={600} fontSize={{ base: "md", md: "lg" }}>
                    {result?.notes ||
                      (result && result.summary === "VALID"
                        ? "Dokumen valid, Sertifikat yang digunakan terpercaya"
                        : "Dokumen tidak memiliki tandatangan elektronik")}
                  </Text>
                </Flex>
                <Box
                  bg="white"
                  borderRadius={8}
                  p={{ base: 3, md: 4 }}
                  border="1px solid"
                  borderColor={isValid ? "green.100" : "blue.200"}
                  w="100%"
                  overflowX="auto"
                >
                  <Text fontWeight={600} fontSize={16} mb={2}>
                    Detail Dokumen
                  </Text>
                  <Box fontSize={15} lineHeight={1.7} mt={2}>
                    <div>
                      <b>Nama File :</b>{" "}
                      <span style={{ wordBreak: "break-all" }}>
                        {result?.nama_dokumen}
                      </span>
                    </div>
                    <div>
                      <b>Ukuran :</b>{" "}
                      {result?.size
                        ? `${Math.round(result.size / 1024)} KB`
                        : selectedFile
                        ? `${Math.round(selectedFile.size / 1024)} KB`
                        : "-"}
                    </div>
                    <div>
                      <b>Jumlah Penandatangan :</b>{" "}
                      {result?.jumlah_signature || 0}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <b>Detail Penandatangan :</b>
                    </div>
                    {Array.isArray(result?.details) && result.details.length > 0 ? (
                      result.details.map((signer: any, idx: number) => (
                        <Box
                          key={idx}
                          bg="#e0f7fa"
                          borderRadius={8}
                          p={{ base: 2, md: "10px 14px" }}
                          mt={2}
                          fontSize={14}
                          boxShadow="0 1px 4px rgba(0,0,0,0.03)"
                          overflowX="auto"
                        >
                          <Text fontWeight={600}>{signer.info_signer?.signer_name}</Text>
                          <Text fontSize={13} color="#555" mt={1}>
                            <b>Info TSA :</b> {signer.info_tsa?.name}
                          </Text>
                          <Text fontSize={13} color="#555" mt={1}>
                            <b>Ditanda tangani pada :</b> {signer.signature_document?.signed_in}
                          </Text>
                        </Box>
                      ))
                    ) : (
                      <Box mt={2} fontSize={14}>
                        Tidak ada penandatangan
                      </Box>
                    )}
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Flex>
        </Box>
      )}
    </PageTransition>
  );
};

export default VerifyPage;
