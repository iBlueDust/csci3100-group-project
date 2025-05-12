import Link from 'next/link'
import classNames from 'classnames'

import { geistMono, geistSans } from '@/styles/fonts'

export default function Home() {
  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-4 pb-10 gap-8 sm:p-8 md:p-20 md:pb-20 md:gap-16 font-body',
      )}
    >
      <main className='row-start-2 flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8'>
        <h1 className='w-full border-b-2 border-foreground text-center font-mono text-4xl font-bold sm:text-5xl md:text-6xl'>
          The Jade Trail
        </h1>
        <p className='mb-4 text-center font-mono text-sm sm:mb-8 sm:text-base'>
          Security. Privacy. Trade.
        </p>

        <div className='flex w-full max-w-xs flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row'>
          <Link
            className='button-primary w-full px-6 py-3 sm:w-auto'
            href='/signup'
          >
            Sign up
          </Link>
          <Link className='button w-full px-6 py-3 sm:w-auto' href='/login'>
            Log in
          </Link>
        </div>
      </main>
      <footer className='row-start-3 mt-8 px-4 text-xs text-foreground/50 sm:mt-0 sm:px-0 sm:text-sm'>
        <p>
          This website was created to fulfill the requirements of the course{' '}
          <code>CSCI 3100 Software Engineering</code>
          at The Chinese University of Hong Kong. The authors of this website DO
          NOT GUARANTEE any claims made about this website nor its fitness for
          any particular purpose. In no event shall the authors be liable for
          any claim, damages, or other liability incurred by the use of this
          website. Do not perform any illegal activities on this website.
        </p>
        <br />
        <p>
          This website is licensed under the{' '}
          <a
            className='link'
            href='https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.en'
            target='_blank'
            rel='noopener noreferrer'
          >
            Creative Commons BY-NC-ND 4.0 License.
          </a>
        </p>
      </footer>
    </div>
  )
}
