import Link from 'next/link'
import classNames from 'classnames'

import { geistMono, geistSans } from '@/styles/fonts'

export default function Home() {
  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-body',
      )}
    >
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start'>
        <h1 className='text-6xl font-bold border-b border-foreground font-mono'>
          The Jade Trail
        </h1>
        <p className='text-base text-center sm:text-left font-mono mb-8'>
          Security. Privacy. Trade.
        </p>

        <div className='flex gap-4 items-center flex-col sm:flex-row mx-auto'>
          <Link className='button-primary' href='/signup'>
            Sign up
          </Link>
          <Link className='button' href='/login'>
            Log in
          </Link>
        </div>
      </main>
      <footer className='row-start-3 text-foreground/50 text-sm'>
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
