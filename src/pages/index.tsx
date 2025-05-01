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
      <main className='flex flex-col gap-6 sm:gap-8 row-start-2 items-center w-full max-w-3xl'>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold border-b-2 border-foreground font-mono text-center w-full'>
          The Jade Trail
        </h1>
        <p className='text-sm sm:text-base text-center font-mono mb-4 sm:mb-8'>
          Security. Privacy. Trade.
        </p>

        <div className='flex gap-4 items-center flex-col sm:flex-row w-full max-w-xs sm:max-w-none justify-center'>
          <Link
            className='button-primary w-full sm:w-auto px-6 py-3'
            href='/signup'
          >
            Sign up
          </Link>
          <Link className='button w-full sm:w-auto px-6 py-3' href='/login'>
            Log in
          </Link>
        </div>
      </main>
      <footer className='row-start-3 text-foreground/50 text-xs sm:text-sm px-4 sm:px-0 mt-8 sm:mt-0'>
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
