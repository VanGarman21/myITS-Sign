import { Box, FormLabel, Text, Input } from "@chakra-ui/react";
import { RadioCardGroup, RadioCard } from "@/components/molecules/RadioCard";

interface SignatureFooterSettingsProps {
  language: string;
  setLanguage: (v: string) => void;
  footerColor: string;
  setFooterColor: (v: string) => void;
  footerShowMode: string;
  setFooterShowMode: (v: string) => void;
  footerPages: string;
  setFooterPages: (v: string) => void;
}

const SignatureFooterSettings = ({
  language,
  setLanguage,
  footerColor,
  setFooterColor,
  footerShowMode,
  setFooterShowMode,
  footerPages,
  setFooterPages,
}: SignatureFooterSettingsProps) => (
  <Box mb={8}>
    <FormLabel fontWeight={600}>Pengaturan Footer</FormLabel>
    <Box mb={4}>
      <Text fontWeight={500} mb={2}>
        Bahasa Footer
      </Text>
      <RadioCardGroup
        name="footerLanguage"
        value={language}
        onChange={setLanguage}
        direction="row"
        gap={4}
      >
        <RadioCard value="id">Indonesia</RadioCard>
        <RadioCard value="en">English</RadioCard>
      </RadioCardGroup>
    </Box>
    <Box mb={4}>
      <Text fontWeight={500} mb={2}>
        Warna Footer
      </Text>
      <RadioCardGroup
        name="footerColor"
        value={footerColor}
        onChange={setFooterColor}
        direction="row"
        gap={4}
      >
        <RadioCard value="hitam">Hitam</RadioCard>
        <RadioCard value="putih">Putih</RadioCard>
      </RadioCardGroup>
    </Box>
    <Box mb={2}>
      <Text fontWeight={500} mb={2}>
        Tampilkan Footer dan QR Code
      </Text>
      <RadioCardGroup
        name="footerShowMode"
        value={footerShowMode}
        onChange={setFooterShowMode}
        direction="row"
        gap={4}
      >
        <RadioCard value="all">Semua Halaman</RadioCard>
        <RadioCard value="custom">Halaman Tertentu</RadioCard>
      </RadioCardGroup>
      {footerShowMode === "custom" && (
        <Input
          mt={2}
          value={footerPages}
          onChange={(e) => setFooterPages(e.target.value)}
          placeholder="Contoh: 1,2,5"
        />
      )}
    </Box>
  </Box>
);

export default SignatureFooterSettings;
