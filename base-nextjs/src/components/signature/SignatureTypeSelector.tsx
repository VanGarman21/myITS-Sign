import { Box, FormLabel, useBreakpointValue } from "@chakra-ui/react";
import { RadioCardGroup, RadioCard } from "@/components/molecules/RadioCard";

interface SignatureTypeSelectorProps {
  value: string;
  onChange: (v: string) => void;
}

const SignatureTypeSelector = ({
  value,
  onChange,
}: SignatureTypeSelectorProps) => {
  const direction = useBreakpointValue({ base: "column", md: "row" });
  return (
    <Box>
      <FormLabel fontWeight={600} mb={2} fontSize={{ base: "md", md: "lg" }}>
        Jenis Tanda Tangan
      </FormLabel>
      <RadioCardGroup
        name="signatureType"
        value={value}
        onChange={onChange}
        direction={direction}
        gap={4}
      >
        <RadioCard
          value="invisible"
          px={3}
          py={2}
          fontSize="15px"
          borderRadius="10px"
        >
          Tandatangani Dokumen Tak Terlihat
        </RadioCard>
        <RadioCard
          value="visible"
          px={3}
          py={2}
          fontSize="15px"
          borderRadius="10px"
        >
          Tanda Tangani Dokumen Terlihat dengan Spesimen
        </RadioCard>
      </RadioCardGroup>
    </Box>
  );
};

export default SignatureTypeSelector;
