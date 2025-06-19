import PageTransition from "@/components/PageLayout";
import ContainerQuery from "@/components/atoms/ContainerQuery";
import {
  CheckmarkSquaresSolidIconMade,
  FormSolidIconMade,
  HomeSolidIconMade,
  UserCheckmarkSolidIconMade,
} from "@/components/atoms/IconsMade";
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
  // import AuthStatus from "@/components/AuthStatus";

const Beranda = () => {
  const { nickname, name } = useContext(AccountInfoContext);
  const t = useTranslations("Beranda");
  const commonTranslations = useTranslations("Common");
  const { colorMode } = useColorMode();

  const icons: { [key: string]: ComponentWithAs<"svg", IconProps> } = {
    verify: CheckmarkSquaresSolidIconMade,
    table: FormSolidIconMade,
    specimen: UserCheckmarkSolidIconMade,
  };

  const customSubtitles: { [key: string]: string } = {
    table: "Tanda tangan dokumen elektronik Anda dengan mudah dan aman.",
    verify: "Cek keaslian dan status tanda tangan elektronik dokumen.",
    specimen: "Kelola gambar spesimen tanda tangan Anda di sini.",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 36,
                marginTop: 8,
                gap: 32,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 20,
                    color: "#64748b",
                    fontWeight: 500,
                    marginBottom: 24,
                  }}
                >
                  Selamat datang di myITS Sign
                </div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#222",
                    marginBottom: 0,
                  }}
                >
                  Menu Utama
                </div>
              </div>
              <div
                style={{
                  flex: "0 0 140px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                {/* <AuthStatus /> */}
                <img
                  src="/myITS-Sign.svg"
                  alt="myITS Sign"
                  style={{ width: 120, height: 120, objectFit: "contain" }}
                />
              </div>
            </div>
            <Wrapper mt="-8px">
              {menuItem
                .filter(
                  ({ isShown, name }) =>
                    name !== "beranda" && (!isShown || isShown(accountInfo))
                )
                .map(({ name, url }) => {
                  const Icon = icons[name];
                  return (
                    <CardDynamicIconShadow
                      key={"card-dinamy-icon-home-" + name}
                      title={commonTranslations(`modules.${name}.title`)}
                      subtitle={
                        customSubtitles[name] ||
                        commonTranslations(`modules.${name}.subtitle`)
                      }
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
