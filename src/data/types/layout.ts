import type { NextComponentType, NextPage, NextPageContext } from "next"
import type { AppProps } from 'next/app'
import type React from "react"

// https://stackoverflow.com/questions/69965829/how-to-extend-nextpage-type-to-add-custom-field-to-page-component

export type PageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
	PageLayout?: React.FC<React.PropsWithChildren>
}

export type ComponentWithLayout<TProps, TInitProps = TProps> =
	NextComponentType<NextPageContext, TInitProps, TProps>
	& PageWithLayout<TProps, TInitProps>

export interface ExtendedAppProps<P> extends AppProps<P> {
	Component: ComponentWithLayout<P>
}