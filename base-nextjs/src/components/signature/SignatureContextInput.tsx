import { Box, FormLabel, Text } from "@chakra-ui/react";
import InputText from "@/components/molecules/Input";

interface SignatureContextInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
}

const SignatureContextInput = ({
  value,
  onChange,
  error,
}: SignatureContextInputProps) => (
  <Box mb={6}>
    <FormLabel fontWeight={600}>Konteks Penandatangan</FormLabel>
    <InputText
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Contoh: Sertifikat kegiatan ..."
      isInvalid={!!error}
    />
    {error && (
      <Text color="red.500" fontSize="sm" mt={1}>
        {error}
      </Text>
    )}
  </Box>
);

export default SignatureContextInput;
