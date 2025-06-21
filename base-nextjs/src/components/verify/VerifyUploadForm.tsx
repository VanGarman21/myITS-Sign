import { Stack, Button, Input, Box } from "@chakra-ui/react";
import React, { useRef } from "react";

interface Props {
  selectedFile: File | null;
  isLoading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcess: () => void;
}

const VerifyUploadForm: React.FC<Props> = ({
  selectedFile,
  isLoading,
  onFileSelect,
  onProcess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Stack direction={{ base: "column", md: "row" }} spacing={3} width="100%">
      <Box flex={1} minW={0}>
        <Input
          type="text"
          value={selectedFile ? selectedFile.name : ""}
          placeholder="Pilih"
          readOnly
          mb={{ base: 2, md: 0 }}
        />
        <Input
          type="file"
          display="none"
          ref={fileInputRef}
          accept=".pdf"
          onChange={onFileSelect}
        />
      </Box>
      <Button
        onClick={() => fileInputRef.current?.click()}
        colorScheme="gray"
        width={{ base: "100%", md: "auto" }}
      >
        Cari
      </Button>
      <Button
        onClick={onProcess}
        colorScheme="blue"
        isLoading={isLoading}
        disabled={!selectedFile || isLoading}
        width={{ base: "100%", md: "auto" }}
      >
        Proses
      </Button>
    </Stack>
  );
};

export default VerifyUploadForm;
