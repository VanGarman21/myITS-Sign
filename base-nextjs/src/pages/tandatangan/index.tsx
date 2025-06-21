import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  Spinner,
  useBreakpointValue,
  useToast,
  Link,
  Center,
  VStack,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  DownloadIcon,
  DeleteIcon,
  AddIcon,
} from "@chakra-ui/icons";
import axios from "axios";
import PageTransition from "@/components/PageLayout";
import {
  fetchSignatureTable,
  SignatureTableRow,
  deletePenandatanganan,
  downloadDokumen,
} from "../../services/signature";

const dropdownOptions = [
  { label: "Penandatangan Sendiri", path: "/tandatangan/sendiri" },
  { label: "Penandatangan Dengan Pihak Lain", path: "/tandatangan/pihak-lain" },
  { label: "Penandatangan Secara Massal", path: "/tandatangan/massal" },
];

const filterTabs = [
  "Semua Tanda Tangan",
  "Sudah Tanda Tangan",
  "Belum Tanda Tangan",
  "Penandatangan Saya Buat",
];

const columns = [
  { key: "no", label: "No.", sortable: false },
  { key: "judul", label: "Konteks Penandatangan", sortable: true },
  { key: "signature_status", label: "Status", sortable: true },
  { key: "actions", label: "Dokumen", sortable: false },
];

const SignaturePage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<SignatureTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [idSdm, setIdSdm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("judul");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const limit = 10;
  const router = useRouter();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    async function fetchIdSdm() {
      try {
        const user = await axios.get(
          (process.env.NEXT_PUBLIC_BACKEND_URL) +
            "/auth/user",
          { withCredentials: true }
        );
        const ssoUserId = user.data.data.sso_user_id || user.data.data.sub;
        const sdm = await axios.get(
          (process.env.NEXT_PUBLIC_BACKEND_URL) +
            "/sdm/by-sso-id/" +
            ssoUserId,
          { withCredentials: true }
        );
        const idSdm =
          sdm.data.id_sdm || (sdm.data.data && sdm.data.data.id_sdm);
        setIdSdm(idSdm || "");
      } catch (err) {
        setIdSdm("");
      }
    }
    fetchIdSdm();
  }, []);

  useEffect(() => {
    if (!idSdm) return;
    function isValidUUID(uuid: string) {
      return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        uuid
      );
    }
    if (!isValidUUID(idSdm)) return;
    setLoading(true);
    fetchSignatureTable({
      id_sdm: idSdm,
      search,
      status: selectedTab,
      page,
      limit,
    })
      .then((res) => {
        setData(Array.isArray(res.aaData) ? res.aaData : []);
        setTotal(res.iTotalRecords || 0);
      })
      .finally(() => setLoading(false));
  }, [idSdm, search, selectedTab, page]);

  // Sorting handler (optional, if backend supports sorting)
  // const handleSort = (key: string) => {
  //   if (sortBy === key) {
  //     setSortDir(sortDir === "asc" ? "desc" : "asc");
  //   } else {
  //     setSortBy(key);
  //     setSortDir("asc");
  //   }
  // };

  const totalPages = Math.ceil((total || 0) / limit);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus penandatanganan ini?")) return;
    try {
      await deletePenandatanganan(id);
      toast({
        title: "Berhasil menghapus penandatanganan!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchSignatureTable({
        id_sdm: idSdm,
        search,
        status: selectedTab,
        page,
        limit,
      })
        .then((res) => {
          setData(Array.isArray(res.aaData) ? res.aaData : []);
          setTotal(res.iTotalRecords || 0);
        })
        .finally(() => setLoading(false));
    } catch (e: any) {
      toast({
        title: "Gagal menghapus penandatanganan",
        description: e?.response?.data?.error || e.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <PageTransition pageTitle="Tanda Tangan Elektronik">
      <Box maxW={1100} mx="auto" px={{ base: 2, md: 0 }}>
        <HStack justify="space-between" mb={6} flexWrap="wrap" gap={2}>
          <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight={700}>
            Buat Tanda Tangan
          </Text>
          <Menu>
            <MenuButton
              as={Button}
              leftIcon={<AddIcon />}
              rightIcon={<ChevronDownIcon />}
              colorScheme="blue"
            >
              Penandatangan
            </MenuButton>
            <MenuList>
              {dropdownOptions.map((opt) => (
                <MenuItem key={opt.label} onClick={() => router.push(opt.path)}>
                  {opt.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </HStack>

        <Tabs
          index={selectedTab - 1}
          onChange={(idx) => {
            setSelectedTab(idx + 1);
            setPage(1);
          }}
          mb={4}
          variant="enclosed"
        >
          <TabList>
            {filterTabs.map((tab) => (
              <Tab key={tab} fontWeight={600}>
                {tab}
              </Tab>
            ))}
          </TabList>
        </Tabs>

        <InputGroup mb={4} maxW={400}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Cari"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            bg="white"
          />
        </InputGroup>

        <TableContainer
          borderRadius={12}
          bg="white"
          boxShadow="md"
          overflowX="auto"
        >
          {isMobile ? (
            <Box>
              {loading ? (
                <Center py={8}>
                  <Spinner size="md" color="blue.500" />
                </Center>
              ) : !Array.isArray(data) || data.length === 0 ? (
                <Text textAlign="center" py={8}>
                  Tidak ada data
                </Text>
              ) : (
                data.map((row, idx) => (
                  <Box
                    key={row.id_penandatanganan}
                    borderWidth={1}
                    borderRadius={10}
                    p={3}
                    mb={3}
                    boxShadow="sm"
                  >
                    <HStack justify="space-between" align="start">
                      <Box>
                        <Text
                          fontWeight={700}
                          color="blue.600"
                          fontSize="md"
                          mb={1}
                        >
                          {row.judul}
                        </Text>
                        <Text color="gray.500" fontStyle="italic" fontSize="sm">
                          {row.signature_type}
                        </Text>
                        <Box mt={2}>
                          {row.signature_status === "sudah_ttd" ? (
                            <Box
                              as="span"
                              px={2}
                              py={1}
                              borderRadius={8}
                              bg="green.100"
                              color="green.700"
                              fontWeight={600}
                              fontSize="sm"
                            >
                              Sudah Ditandatangani
                            </Box>
                          ) : (
                            <Box
                              as="span"
                              px={2}
                              py={1}
                              borderRadius={8}
                              bg="red.100"
                              color="red.800"
                              fontWeight={600}
                              fontSize="sm"
                            >
                              Perlu Tandatangan
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <VStack align="end" spacing={2}>
                        <IconButton
                          aria-label="Unduh"
                          icon={<DownloadIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          as={Link}
                          href={row.judul ? downloadDokumen(row.judul) : "#"}
                          isExternal
                        />
                        {row.signature_status === "perlu_ttd" &&
                          row.can_delete && (
                            <IconButton
                              aria-label="Hapus"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() =>
                                handleDelete(row.id_penandatanganan)
                              }
                            />
                          )}
                      </VStack>
                    </HStack>
                  </Box>
                ))
              )}
            </Box>
          ) : (
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  {columns.map((col) => (
                    <Th
                      key={col.key}
                      cursor={col.sortable ? "pointer" : "default"}
                      userSelect={col.sortable ? "none" : undefined}
                      color={col.sortable ? "blue.600" : undefined}
                      fontWeight={700}
                      fontSize="md"
                    >
                      {col.label}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={columns.length} textAlign="center">
                      <Spinner size="md" color="blue.500" />
                    </Td>
                  </Tr>
                ) : !Array.isArray(data) || data.length === 0 ? (
                  <Tr>
                    <Td colSpan={columns.length} textAlign="center">
                      Tidak ada data
                    </Td>
                  </Tr>
                ) : (
                  data.map((row, idx) => (
                    <Tr key={row.id_penandatanganan} _hover={{ bg: "gray.50" }}>
                      <Td>{(page - 1) * limit + idx + 1}</Td>
                      <Td>
                        <Text
                          color="blue.600"
                          fontWeight={600}
                          cursor="pointer"
                          textDecor="underline"
                          onClick={() =>
                            router.push(
                              `/tandatangan/detail/${row.id_penandatanganan}`
                            )
                          }
                          tabIndex={0}
                          _hover={{ color: "blue.800" }}
                        >
                          {row.judul}
                        </Text>
                        <Text color="gray.500" fontStyle="italic" fontSize="sm">
                          {row.signature_type}
                        </Text>
                      </Td>
                      <Td>
                        {row.signature_status === "sudah_ttd" ? (
                          <Box
                            as="span"
                            px={2}
                            py={1}
                            borderRadius={8}
                            bg="green.100"
                            color="green.700"
                            fontWeight={600}
                            fontSize="sm"
                          >
                            Sudah Ditandatangani
                          </Box>
                        ) : (
                          <Box
                            as="span"
                            px={2}
                            py={1}
                            borderRadius={8}
                            bg="red.100"
                            color="red.800"
                            fontWeight={600}
                            fontSize="sm"
                          >
                            Perlu Tandatangan
                          </Box>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          {row.judul && (
                            <Link
                              href={
                                row.judul ? downloadDokumen(row.judul) : "#"
                              }
                              isExternal
                            >
                              <IconButton
                                aria-label="Unduh"
                                icon={<DownloadIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                              />
                            </Link>
                          )}
                          {row.signature_status === "perlu_ttd" &&
                            row.can_delete && (
                              <IconButton
                                aria-label="Hapus"
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() =>
                                  handleDelete(row.id_penandatanganan)
                                }
                              />
                            )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </TableContainer>

        {/* Pagination */}
        <HStack justify="center" mt={6} spacing={1} flexWrap="wrap">
          <Button
            size="sm"
            onClick={() => setPage(1)}
            isDisabled={page === 1}
            variant="ghost"
          >
            Awal
          </Button>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            isDisabled={page === 1}
            variant="ghost"
          >
            Sebelumnya
          </Button>
          <Text fontSize="sm" px={2}>
            Halaman {page} dari {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={page === totalPages || totalPages === 0}
            variant="ghost"
          >
            Selanjutnya
          </Button>
          <Button
            size="sm"
            onClick={() => setPage(totalPages)}
            isDisabled={page === totalPages || totalPages === 0}
            variant="ghost"
          >
            Akhir
          </Button>
        </HStack>
      </Box>
    </PageTransition>
  );
};

export default SignaturePage;
