import AccountInfoContext from "@/providers/AccountInfoProvider";
import AppSettingContext from "@/providers/AppSettingProvider";
import { useSignOutAction } from "@/utils/auth/SignOutAction";
import {
  Box,
  Button,
  Center,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useTranslations } from "next-intl";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FormEventHandler,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useState,
} from "react";
import { mutate } from "swr";
import defaultProfilePicture from "../../public/images/app/profile-default.jpg";
import { DaliGhostButton } from "./atoms/Buttons/DaliButton";
import { PrimaryButton } from "./atoms/Buttons/PrimaryButton";
import {
  ArrowLeftOutlineIconMade,
  CheckmarkOutlineIconMade,
  ChevronRightSolidIconMade,
  CloseOutlineIconMade,
  LogoutOutlineIconMade,
  MyITSLogo,
  UsersOutlineIconMade,
} from "./atoms/IconsMade";
import DropdownSelect from "./molecules/Select";
import ToastCard from "./molecules/ToastCard";
import { MotionBox } from "./motion/Motion";

const titledMenu = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const PageTransition = ({
  pageTitle,
  previousPage,
  previousPageTitle,
  children,
}: {
  pageTitle?: string;
  previousPage?: string;
  previousPageTitle?: string;
  children: ReactNode;
}) => {
  const page = useRouter().route;
  const router = useRouter();
  const n = page.lastIndexOf("/");
  const r = page.substring(n + 1);
  const { signOut } = useSignOutAction();

  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    document
      .querySelector("body")
      ?.classList.add(colorMode == "light" ? "light" : "dark");
    document
      .querySelector("body")
      ?.classList.remove(colorMode == "light" ? "dark" : "light");
  });

  const { isNavbarOpen, navbarToggler } = useContext(AppSettingContext);

  const {
    isOpen: isOpenGantiRole,
    onOpen: onOpenGantiRole,
    onClose: onCloseGantiRole,
  } = useDisclosure();
  const accountInfo = useContext(AccountInfoContext);
  const t = useTranslations("PageLayout");
  const commonTranslations = useTranslations("Common");

  // Mengatur animasi header agar muncul dan sembunyi versi mobile
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideAt = 96; //Pixel scroll untuk mulai menyembunyikan header

  const controlNavbar = () => {
    if (typeof window !== "undefined") {
      if (window.scrollY > hideAt && window.scrollY > lastScrollY) {
        setShow(false);
      } else if (window.scrollY < lastScrollY || window.scrollY <= hideAt) {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", controlNavbar);
      return () => {
        window.removeEventListener("scroll", controlNavbar);
      };
    }
  }, [lastScrollY]);

  //Scroll ke atas untuk header versi mobile
  const [isVisible, setIsVisible] = useState(false);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    setIsVisible(scrollTop > 400);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>
          {(pageTitle ? pageTitle + " • " : "") +
            process.env.NEXT_PUBLIC_APP_NAME_FULL}
        </title>
      </Head>
      <Flex
        className="page__row page__row_head"
        flexDirection={{ base: "column-reverse", t: "initial" }}
        m={{ base: "0", x: "0 0px", w: "0" }}
        p={{ base: "0px 0 0px 0", x: "0px 0", w: "0" }}
      >
        {/* Title col */}
        <Box
          className="page__col"
          p={{ base: "16px 16px 28px", x: "0 64px 44px" }}
          pt={{ base: "0", t: "48px", x: "48px" }}
          w="100%"
          display={{ base: "block", md: "flex" }}
          alignItems="center"
          flexWrap="wrap"
          gap={3}
        >
          {previousPage && (
            <>
              <Link href={previousPage}>
                <Text
                  display={["none", "none", "none", "block"]}
                  className="page__title"
                  fontSize={{ base: "24px", m: "28px", x: "30px" }}
                  lineHeight="1.33333"
                  fontWeight="600"
                  variant="toptitle"
                  opacity="0.6"
                  _hover={{
                    opacity: 1,
                  }}
                  transition="120ms ease-out"
                >
                  {previousPageTitle}
                </Text>
              </Link>
              <Flex
                opacity="0.6"
                mx="-2px"
                display={["none", "none", "none", "flex"]}
              >
                <ChevronRightSolidIconMade fontSize="24px" />
              </Flex>
            </>
          )}

          <Flex alignItems="center">
            <Flex
              alignItems="center"
              justifyContent="center"
              mr="2px"
              ml="-6px"
              w="36px"
              h="36px"
              display={page == "/" ? "none" : ["flex", "flex", "flex", "none"]}
              onClick={() => router.back()}
            >
              <ArrowLeftOutlineIconMade fontSize="24px" />
            </Flex>
            <Flex alignItems="center" minH="36px">
              <Text
                className="page__title"
                fontSize={{ base: "24px", m: "28px", x: "30px" }}
                lineHeight="1.33333"
                fontWeight="600"
                variant="toptitle"
              >
                {pageTitle}
              </Text>
            </Flex>
          </Flex>
        </Box>

        <Box
          className="page__col"
          p={{ base: "16px 16px 28px", x: "0 64px 44px" }}
          pt={{ base: "0", t: "48px", x: "48px" }}
          _first={{
            flex: { base: "100%", t: "calc(100% - 426px)" },
            maxWidth: { base: "100%", t: "calc(100% - 426px)" },
          }}
          _even={{
            flexShrink: "0",
            width: { base: "100%", t: "426px" },
          }}
        >
          <Flex
            className="header"
            pos={{ base: "fixed", m: "relative" }}
            top={{ base: show ? "0" : "-96px", m: "unset" }}
            zIndex="10"
            justifyContent="end"
            alignItems="center"
            h={{ base: "96px", t: "48px", x: "unset" }}
            p={{ base: "0 32px", t: "0" }}
            maxW={{ base: "calc(100% + 64px)", x: "100%", t: "298px" }}
            w={{ base: "100%", m: "unset" }}
            m={{ base: "0 -32px 0 -32px", t: "0px 0 0 auto" }}
            borderBottom={{ base: "1px solid", m: "none" }}
            borderColor={colorMode == "light" ? "#e4e4e4" : "#292929"}
            background={{
              base: colorMode === "light" ? "white" : "#141414",
              m: "unset",
            }}
            transition="top 0.3s"
          >
            <Button
              className="header__burger"
              display={{ base: "inline-block", m: "none" }}
              w="32px"
              h="40px"
              mr="auto"
              pos="relative"
              fontSize="0"
              onClick={navbarToggler}
              bg="none"
              _hover={{
                background: "none",
              }}
              _before={{
                content: '""',
                display: "inline-block",
                width: "32px",
                position: "absolute",
                top: "calc(42% - 4px)",
                left: "0px",
                height: "2px",
                margin: "3px auto",
                borderRadius: "1px",
                background: colorMode == "light" ? "#1b1d21" : "#ffffff",
              }}
              _after={{
                content: '""',
                display: "inline-block",
                width: "32px",
                position: "absolute",
                height: "2px",
                top: "calc(42% + 4px)",
                left: "0px",
                margin: "3px auto",
                borderRadius: "1px",
                background: colorMode == "light" ? "#1b1d21" : "#ffffff",
              }}
            ></Button>
            <Box
              w="full"
              mt="8px"
              pr="16px"
              display={{ base: "block", m: "none" }}
            >
              <Center>
                <MyITSLogo
                  w="68px"
                  h="auto"
                  color={colorMode === "light" ? "#013880" : "white"}
                  onClick={handleScrollTop}
                  cursor="pointer"
                />
              </Center>
              <Center>
                <Text
                  fontSize="13px"
                  fontWeight={600}
                  mt="2px"
                  textAlign="center"
                  onClick={handleScrollTop}
                  cursor="pointer"
                >
                  {process.env.NEXT_PUBLIC_APP_NAME}
                </Text>
              </Center>
            </Box>
            <Menu closeOnSelect={false}>
              <MenuButton
                className="header__user"
                cursor="pointer"
                display={{ base: "block" }}
                flexShrink="0"
                w="40px"
                h="40px"
                ml={{ base: "0", m: "24px" }}
                fontSize="0"
                backgroundSize="contain"
                borderRadius="50%"
                position={"relative"}
                overflow={"hidden"}
              >
                <Image
                  src={accountInfo.profPicture ?? defaultProfilePicture}
                  alt={t("profile_picture_of", {
                    name: accountInfo.name ?? t("user"),
                  })}
                  width={40}
                  height={40}
                  placeholder="blur"
                  blurDataURL={defaultProfilePicture.blurDataURL}
                />
              </MenuButton>
              <MenuList
                defaultChecked={false}
                w={{ base: "calc(100vw - 32px)", s: "350px" }}
                transition="all .25s"
                mx={{ base: "16px", s: "unset" }}
              >
                <Box p="1rem 0.75rem">
                  <Text fontSize="16px" fontWeight="600">
                    {accountInfo.name}
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="gray" mt="6px">
                    {accountInfo.prefUsername}
                  </Text>
                  {accountInfo.activeRole && (
                    <Text
                      fontSize="14px"
                      fontWeight="500"
                      color="gray"
                      mt="6px"
                    >
                      {commonTranslations(`roles.${accountInfo.activeRole}`)}
                    </Text>
                  )}
                </Box>
                {accountInfo.role && accountInfo.role.length > 1 && (
                  <MenuItem
                    icon={<UsersOutlineIconMade fontSize="18px" />}
                    onClick={onOpenGantiRole}
                  >
                    {commonTranslations("switch_role")}
                  </MenuItem>
                )}
                <MenuItem
                  icon={<ArrowLeftOutlineIconMade fontSize="18px" />}
                  as={Link}
                  href="https://portal.its.ac.id"
                >
                  {commonTranslations("to_myits_portal")}
                </MenuItem>
                <MenuDivider mx=".75rem" />
                <MenuItem
                  icon={<LogoutOutlineIconMade fontSize="18px" />}
                  color={colorMode == "light" ? "red.500" : "redDim.500"}
                  onClick={signOut}
                >
                  {commonTranslations("sign_out")}
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Box>
      </Flex>
      <MotionBox
        className="page__motion"
        variants={titledMenu}
        initial="initial"
        animate="animate"
        exit="exit"
        // @ts-ignore
        transition={{
          duration: 0.3,
          ease: "easeInOut",
          delay: 0,
        }}
      >
        {children}
      </MotionBox>

      <ModalGantiRole isOpen={isOpenGantiRole} onClose={onCloseGantiRole} />
    </>
  );
};

const ModalGantiRole = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { colorMode } = useColorMode();
  const accountInfo = useContext(AccountInfoContext);
  const commonTranslations = useTranslations("Common");

  // Role stuff
  const toast = useToast();
  const roles =
    accountInfo.role?.map((role) => ({
      value: role.id,
      label: commonTranslations(`roles.${role.id}`),
    })) ?? [];
  const activeRole = roles.find((role) => role.value == accountInfo.activeRole);
  const formId = useId();
  const [isSwitchingRole, setSwitchingRole] = useState(false);

  const handleChangeRole: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newRoleId = formData.get("role") as string;

    try {
      setSwitchingRole(true);
      localStorage.setItem("active_role", newRoleId);
      await mutate("auth");

      toast({
        position: "top-right",
        status: "success",
        duration: 5000,
        isClosable: true,
        render: (props) => (
          <ToastCard
            title={commonTranslations("role_successfully_changed")}
            description={commonTranslations("role_changed_to_x", {
              x: commonTranslations(`roles.${newRoleId}`),
            })}
            onClose={props.onClose}
            status="success"
            icon={<CheckmarkOutlineIconMade fontSize="24px" color="white" />}
          />
        ),
      });
    } catch (e) {
      let slug = "unknown";
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        slug = e.response.data.message;
      }

      const messages = new Map([
        ["user_does_not_have_this_role", "Anda tidak memiliki role ini"],
      ]);

      toast({
        position: "top-right",
        status: "error",
        duration: 5000,
        isClosable: true,
        render: (props) => (
          <ToastCard
            title="Role gagal diganti"
            description={
              messages.get(slug) ?? "Terjadi kesalahan saat mengganti role"
            }
            onClose={props.onClose}
            status="error"
            icon={<CloseOutlineIconMade fontSize="24px" color="white" />}
          />
        ),
      });
    } finally {
      setSwitchingRole(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent
        borderRadius="16px"
        py="8px"
        m="16px 24px"
        bg={useColorModeValue("white", "gray.900")}
      >
        <ModalHeader
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {commonTranslations("switch_role")}
        </ModalHeader>

        {/* @ts-expect-error */}
        <ModalBody as="form" onSubmit={handleChangeRole} id={formId}>
          <Box w="full">
            <DropdownSelect
              placeholder="Pilih role"
              defaultValue={activeRole}
              name="role"
              options={roles}
              isDisabled={false}
              isMulti={false}
              isClearable={false}
            />
          </Box>
        </ModalBody>
        <ModalFooter display="flex" pt="24px" gap={2}>
          <Center w={{ base: "full", s: "auto" }}>
            <DaliGhostButton onClick={onClose}>
              {commonTranslations("cancel")}
            </DaliGhostButton>
          </Center>
          <Center w={{ base: "full", s: "auto" }}>
            <PrimaryButton
              form={formId}
              type="submit"
              isLoading={isSwitchingRole}
              loadingText={commonTranslations("switching_role")}
            >
              {commonTranslations("switch")}
            </PrimaryButton>
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PageTransition;
