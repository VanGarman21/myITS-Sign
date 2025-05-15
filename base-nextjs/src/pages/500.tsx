import { RefreshOutlineIconMade } from '@/components/atoms/IconsMade'
import ErrorPage from '@/components/pages/ErrorPage'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/router'
import { NextPageWithLayout } from './_app'

type Props = {
  resetError?: () => void
}

const Custom500: NextPageWithLayout<Props> = ({ resetError }) => {
  const t = useTranslations('ErrorPage')
  const { reload } = useRouter()

  return (
    <ErrorPage
      statusCode={500}
      title={t('kesalahan_internal_server')}
      action={{
        icon: <RefreshOutlineIconMade fontSize={'1.125rem'} />,
        onClick: () => {
          reload()
          resetError && resetError()
        },
        text: t('muat_ulang'),
      }}
    />
  )
}

Custom500.getLayout = ErrorPage.getLayout

export default Custom500
