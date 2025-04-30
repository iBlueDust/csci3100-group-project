import Head from 'next/head'

import type { ExtendedAppProps } from '@/data/types/layout'
import '@/styles/globals.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const App: React.FC<ExtendedAppProps<any>> = ({ Component, pageProps }) => {
  const PageLayout =
    Component.PageLayout ??
    (({ children }: React.PropsWithChildren) => children)

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
        />
      </Head>

      <PageLayout>
        <Component {...pageProps} />
      </PageLayout>
    </>
  )
}

export default App
