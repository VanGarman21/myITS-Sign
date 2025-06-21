import { Box, FormLabel, Text, Flex, useColorMode } from "@chakra-ui/react";
import { useRef, useState } from "react";

interface SignatureFileUploadProps {
  file: File | File[] | null;
  onFileChange: (file: File | File[] | null) => void;
  error?: string | null;
  multiple?: boolean;
}

const SignatureFileUpload = ({
  file,
  onFileChange,
  error,
  multiple = false,
}: SignatureFileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { colorMode } = useColorMode();

  const handlePanelClick = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []).filter(
      (f) => f.type === "application/pdf"
    );
    if (multiple) {
      onFileChange(files.length > 0 ? files : null);
    } else {
      const f = files[0] || null;
      onFileChange(f);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type === "application/pdf"
    );
    if (multiple) {
      onFileChange(files.length > 0 ? files : null);
    } else {
      const f = files[0] || null;
      onFileChange(f);
    }
  };

  const handleRemoveFile = (
    idx?: number,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (e) e.stopPropagation();
    if (multiple && Array.isArray(file)) {
      if (typeof idx === "number") {
        const newFiles = file.filter((_, i) => i !== idx);
        onFileChange(newFiles.length > 0 ? newFiles : null);
      }
    } else {
      onFileChange(null);
    }
  };

  // Render file(s)
  const renderFiles = () => {
    if (multiple && Array.isArray(file)) {
      return file.length === 0 ? null : (
        <Box w="100%">
          {file.map((f, idx) => (
            <Flex
              key={idx}
              align="center"
              justify="space-between"
              w="100%"
              maxW="100%"
              direction={{ base: "column", md: "row" }}
              gap={2}
              mb={2}
            >
              <Box flex={1} minW={0}>
                <Text
                  fontWeight={600}
                  fontSize={{ base: "sm", md: "md" }}
                  color="blue.700"
                  isTruncated
                  maxW={{ base: "180px", md: "320px" }}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {f.name}
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                  {(f.size / 1024).toFixed(2)} KB
                </Text>
              </Box>
              <Box
                as="button"
                aria-label="Hapus file"
                color="red.500"
                fontSize="lg"
                ml={{ base: 0, md: 2 }}
                mt={{ base: 1, md: 0 }}
                bg="none"
                border="none"
                cursor="pointer"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                  handleRemoveFile(idx, e)
                }
              >
                🗑️
              </Box>
            </Flex>
          ))}
        </Box>
      );
    } else if (!multiple && file && file instanceof File) {
      return (
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          maxW="100%"
          direction={{ base: "column", md: "row" }}
          gap={2}
        >
          <Box flex={1} minW={0}>
            <Text
              fontWeight={600}
              fontSize={{ base: "sm", md: "md" }}
              color="blue.700"
              isTruncated
              maxW={{ base: "180px", md: "320px" }}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {file.name}
            </Text>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
              {(file.size / 1024).toFixed(2)} KB
            </Text>
          </Box>
          <Box
            as="button"
            aria-label="Hapus file"
            color="red.500"
            fontSize="lg"
            ml={{ base: 0, md: 2 }}
            mt={{ base: 1, md: 0 }}
            bg="none"
            border="none"
            cursor="pointer"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              handleRemoveFile(undefined, e)
            }
          >
            🗑️
          </Box>
        </Flex>
      );
    }
    return null;
  };

  return (
    <Box mb={0}>
      <FormLabel fontWeight={600} mb={2}>
        Dokumen
      </FormLabel>
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={handleInputChange}
        style={{ display: "none" }}
        id="signature-file-upload"
        multiple={multiple}
      />
      <Box
        borderWidth={2}
        borderStyle="dashed"
        borderColor={error ? "red.400" : dragActive ? "blue.400" : "gray.200"}
        borderRadius="16px"
        p={{ base: 3, md: 6 }}
        minH="120px"
        maxW="100%"
        bg={
          colorMode === "light"
            ? dragActive
              ? "blue.50"
              : "gray.50"
            : dragActive
            ? "blue.900"
            : "gray.700"
        }
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        mb={error ? 1 : 4}
        cursor="pointer"
        transition="all 0.2s"
        onClick={handlePanelClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        _hover={{
          borderColor: "blue.400",
          bg: colorMode === "light" ? "blue.50" : "blue.900",
        }}
      >
        {renderFiles() || (
          <Box textAlign="center" color="gray.400">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 48 48"
              style={{ margin: "0 auto" }}
            >
              <rect width="48" height="48" rx="12" fill="#F3F6FA" />
              <path
                d="M16 32V20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2Z"
                stroke="#A0AEC0"
                strokeWidth="2"
              />
              <path
                d="M20 24h8M20 28h8"
                stroke="#A0AEC0"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <Text fontWeight={500} mt={2}>
              {dragActive
                ? "Lepaskan file untuk mengunggah"
                : "Belum ada dokumen dipilih"}
            </Text>
            <Text fontSize="sm" color="gray.400">
              Format yang didukung: PDF
            </Text>
          </Box>
        )}
      </Box>
      {error && (
        <Text color="red.500" fontSize="sm" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  );
};

export default SignatureFileUpload;
