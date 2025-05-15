import { ErrorBoundary } from '@/components/pages/ErrorBoundary';
import { AppSettingProvider } from '@/providers/AppSettingProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import LanguageProvider from '@/providers/LanguageProvider';
import '@/styles/globals.css';
import "@/styles/styles.css"; // Import style file
import theme from '@/theme/theme';
import { AuthSSO } from '@/utils/auth/AuthSSO';
import { ChakraProvider } from '@chakra-ui/react';
import {
	Hydrate,
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import { NextPage } from 'next';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, ReactNode, useState } from 'react';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
	const router = useRouter()

	const [queryClient] = useState(() => new QueryClient())

	if (router.pathname === '/404' || router.pathname === '/500') {
		const getLayout = Component.getLayout ?? ((page) => page)
		return getLayout(<Component {...pageProps} />)
	}

	return (
		<ErrorBoundary>
			<Head>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
				<link rel="manifest" href="/site.webmanifest" />
				<title>{process.env.NEXT_PUBLIC_APP_NAME_FULL}</title>
			</Head>
			<AuthProvider>
				<AppSettingProvider>
					<LanguageProvider>
						<QueryClientProvider client={queryClient}>
							<ChakraProvider theme={theme}>
								<AuthSSO>
									<Hydrate state={pageProps.dehydratedState}>
										<Component key={router.route} {...pageProps} />
									</Hydrate>
								</AuthSSO>
							</ChakraProvider>
						</QueryClientProvider>
					</LanguageProvider>
				</AppSettingProvider>
			</AuthProvider>
		</ErrorBoundary>
	)
}

export { getServerSideProps } from '@/Chakra';

