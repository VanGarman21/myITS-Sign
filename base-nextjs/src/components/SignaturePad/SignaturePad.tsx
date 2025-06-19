import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Box, Button, VStack, HStack, useToast } from "@chakra-ui/react";

interface SignaturePadProps {
  onSave: (signature: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave }) => {
  const sigCanvas = useRef<any>();
  const toast = useToast();
  const [isEmpty, setIsEmpty] = useState(true);

  const clear = () => {
    sigCanvas.current.clear();
    setIsEmpty(true);
  };

  const save = () => {
    if (isEmpty) {
      toast({
        title: "Tanda tangan kosong",
        description: "Silakan buat tanda tangan terlebih dahulu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const signatureData = sigCanvas.current.toDataURL();
    onSave(signatureData);
  };

  return (
    <VStack spacing={4} width="100%" align="stretch">
      <Box
        border="2px dashed"
        borderColor="gray.300"
        borderRadius="md"
        p={2}
        bg="white"
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas",
          }}
          backgroundColor="white"
          onBegin={() => setIsEmpty(false)}
        />
      </Box>
      <HStack spacing={4} justify="flex-end">
        <Button colorScheme="red" onClick={clear}>
          Hapus
        </Button>
        <Button colorScheme="blue" onClick={save}>
          Simpan
        </Button>
      </HStack>
    </VStack>
  );
};

export default SignaturePad;
