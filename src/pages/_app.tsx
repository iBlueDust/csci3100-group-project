import type { ExtendedAppProps } from '@/data/types/layout'

import '@/styles/globals.css'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const App: React.FC<ExtendedAppProps<any>> = ({ Component, pageProps }) => {
  const PageLayout =
    Component.PageLayout ??
    (({ children }: React.PropsWithChildren) => children)

  return (
    <PageLayout>
      <Component {...pageProps} />
    </PageLayout>
  )
}

export default App
