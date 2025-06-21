import {
  Box,
  FormLabel,
  Checkbox,
  Input,
  List,
  ListItem,
  Text,
  HStack,
  VStack,
  Button,
} from "@chakra-ui/react";

interface SDMOption {
  id_sdm: string;
  nama: string;
}

interface AnggotaPenandatanganSelectorProps {
  ikutkanSaya: boolean;
  setIkutkanSaya: (v: boolean) => void;
  anggotaLain: SDMOption[];
  setAnggotaLain: (v: SDMOption[]) => void;
  search: string;
  setSearch: (v: string) => void;
  options: SDMOption[];
  setOptions: (v: SDMOption[]) => void;
  showDropdown: boolean;
  setShowDropdown: (v: boolean) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (opt: SDMOption) => void;
  onRemove: (id_sdm: string) => void;
}

const AnggotaPenandatanganSelector = ({
  ikutkanSaya,
  setIkutkanSaya,
  anggotaLain,
  setAnggotaLain,
  search,
  setSearch,
  options,
  setOptions,
  showDropdown,
  setShowDropdown,
  onSearch,
  onSelect,
  onRemove,
}: AnggotaPenandatanganSelectorProps) => {
  return (
    <Box mb={8}>
      <FormLabel fontWeight={600} mb={2}>
        Anggota Penandatangan
      </FormLabel>
      <Checkbox
        isChecked={ikutkanSaya}
        onChange={(e) => setIkutkanSaya(e.target.checked)}
        mb={3}
      >
        Ikutkan saya dalam penandatangan
      </Checkbox>
      <Box position="relative">
        <Input
          placeholder="Pilih anggota penandatangan"
          value={search}
          onChange={onSearch}
          onFocus={() => options.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          mb={2}
        />
        {showDropdown && options.length > 0 && (
          <Box
            position="absolute"
            zIndex={10}
            bg="white"
            borderRadius="md"
            boxShadow="md"
            borderWidth={1}
            w="100%"
            maxH="180px"
            overflowY="auto"
          >
            <List spacing={0}>
              {options.map((opt) => (
                <ListItem
                  key={opt.id_sdm}
                  px={3}
                  py={2}
                  _hover={{ bg: "blue.50", cursor: "pointer" }}
                  onClick={() => onSelect(opt)}
                >
                  {opt.nama}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
      {/* List anggota terpilih */}
      <HStack mt={2} spacing={2} flexWrap="wrap">
        {anggotaLain.map((opt) => (
          <Box
            key={opt.id_sdm}
            bg="blue.50"
            px={2}
            py={1}
            borderRadius="md"
            display="flex"
            alignItems="center"
            fontSize="sm"
            color="blue.800"
          >
            {opt.nama}
            <Button
              size="xs"
              ml={1}
              colorScheme="red"
              variant="ghost"
              onClick={() => onRemove(opt.id_sdm)}
            >
              x
            </Button>
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

export default AnggotaPenandatanganSelector;
