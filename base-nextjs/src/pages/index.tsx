import PageTransition from "@/components/PageLayout";
import ContainerQuery from "@/components/atoms/ContainerQuery";
import { CheckmarkSquaresSolidIconMade, FormSolidIconMade, HomeSolidIconMade, UserCheckmarkSolidIconMade } from "@/components/atoms/IconsMade";
import PageRow from "@/components/atoms/PageRow";
import Wrapper from "@/components/atoms/Wrapper";
import Carousel from "@/components/molecules/Carousel";
import { CardDynamicIconShadow } from "@/components/organisms/CardIconShadow";
import PlainCard from "@/components/organisms/Cards/Card";
import { menuItem } from "@/data/menu";
import AccountInfoContext from "@/providers/AccountInfoProvider";
import {
  Box,
  ComponentWithAs,
  Flex,
  IconProps,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import Head from "next/head";
import { useContext } from "react";

const Beranda = () => {
  const { nickname, name } = useContext(AccountInfoContext);
  const t = useTranslations("Beranda");
  const commonTranslations = useTranslations("Common");
  const { colorMode, toggleColorMode } = useColorMode();

  const icons: { [key: string]: ComponentWithAs<"svg", IconProps> } = {
    beranda: HomeSolidIconMade,
    verify: CheckmarkSquaresSolidIconMade, // Ganti dengan ikon yang sesuai
    table: FormSolidIconMade, // Ganti dengan ikon yang sesuai
    spesimen: UserCheckmarkSolidIconMade,
  };
  const accountInfo = useContext(AccountInfoContext);

  return (
    <>
      <PageTransition pageTitle={t("hi", { name: nickname || name })}>
        <Head>
          <title>{process.env.NEXT_PUBLIC_APP_NAME_FULL}</title>
        </Head>
        <PageRow>
          <ContainerQuery>
            <PlainCard p="0px">
              <Carousel duration={8000} w="100%" borderRadius="24px">
                <Flex
                  bgGradient={
                    colorMode === "light"
                      ? "linear(to-tr, red.500, orange.500)"
                      : "linear(to-tr, red.600, orange.600)"
                  }
                  alignItems="center"
                  p="32px 56px"
                  h="300px"
                >
                  <Box>
                    <Text
                      fontSize="28px"
                      color="white"
                      // className={poppins.className}
                      lineHeight="1.111"
                    >
                      myITS Portal
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="white"
                      mt="8px"
                      lineHeight="1.5"
                    >
                      Rumah aplikasi myITS
                    </Text>
                  </Box>
                </Flex>
                <Flex
                  bgGradient={
                    colorMode === "light"
                      ? "linear(to-tr, blue.500, cyan.500)"
                      : "linear(to-tr, blue.600, cyan.600)"
                  }
                  alignItems="center"
                  p="32px 56px"
                  h="300px"
                >
                  <Box>
                    <Text
                      fontSize="28px"
                      color="white"
                      // className={poppins.className}
                      lineHeight="1.111"
                    >
                      myITS Sign
                    </Text>
                    <Text
                      fontSize="16px"
                      fontWeight="500"
                      color="white"
                      mt="8px"
                      lineHeight="1.5"
                    >
                      Kelola Dokumen di sini
                    </Text>
                  </Box>
                </Flex>
              </Carousel>
            </PlainCard>
            <Wrapper mt="-8px">
              {menuItem
                .filter(({ isShown }) => !isShown || isShown(accountInfo))
                .map(({ name, url }) => {
                  const Icon = icons[name];
                  // if (!Icon) return null;

                  return (
                    <CardDynamicIconShadow
                      key={"card-dinamy-icon-home-" + name}
                      title={commonTranslations(`modules.${name}.title`)}
                      subtitle={commonTranslations(`modules.${name}.subtitle`)}
                      link={url}
                      icon={Icon ? <Icon w="30px" h="30px" /> : null}
                    />
                  );
                })}
            </Wrapper>
          </ContainerQuery>
        </PageRow>
      </PageTransition>
    </>
  );
};

export default Beranda;
