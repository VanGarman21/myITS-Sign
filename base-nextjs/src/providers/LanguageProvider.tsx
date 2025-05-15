import { ReactNode, useContext } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import AppSettingContext from './AppSettingProvider'
import langId from '@/lang/id'
import langEn from '@/lang/en'

const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { langPref } = useContext(AppSettingContext)
  const messages = new Map([
    ['id', langId],
    ['en', langEn]
  ])

  return (
    <NextIntlClientProvider
      locale={langPref}
      timeZone={process.env.NEXT_PUBLIC_SERVER_TZ ?? 'Asia/Jakarta'}
      messages={messages.get(langPref) ?? {}}
    >
      {children}
    </NextIntlClientProvider>
  )
}

export default LanguageProvider
