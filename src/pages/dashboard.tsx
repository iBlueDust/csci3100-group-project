import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import classNames from 'classnames'
import { FiHome, FiPackage, FiMessageSquare, FiSettings, FiHeart, FiList } from 'react-icons/fi'

import { geistMono, geistSans } from '@/styles/fonts'
import Sidebar from '@/components/Sidebar'

// TODO: Add loading component
const Home = dynamic(() => import('@/components/Home'), { ssr: false })
const Messages = dynamic(() => import('@/components/messages'), { ssr: false })
const Marketplace = dynamic(() => import('@/components/marketplace'), {
  ssr: false,
})
const MyListings = dynamic(() => import('@/components/myListings'), { ssr: false })
const Settings = dynamic(() => import('@/components/settings'), { ssr: false })

enum Page {
  HOME = 'home',
  MARKETPLACE = 'marketplace',
  MY_LISTINGS = 'my-listings',
  MESSAGES = 'messages',
  SETTINGS = 'settings',
}

const navItems = [
  {
    key: Page.HOME,
    icon: <FiHome className='w-5 h-5 min-w-5' />,
    label: 'Home',
  },
  {
    key: Page.MARKETPLACE,
    icon: <FiPackage className='w-5 h-5 min-w-5' />,
    label: 'Marketplace',
  },
  {
    key: Page.MY_LISTINGS,
    icon: <FiList className='w-5 h-5 min-w-5' />,
    label: 'My Listings',
  },
  {
    key: Page.MESSAGES,
    icon: <FiMessageSquare className='w-5 h-5 min-w-5' />,
    label: 'Messages',
  },
  {
    key: Page.SETTINGS,
    icon: <FiSettings className='w-5 h-5 min-w-5' />,
    label: 'Settings',
  },
]

export default function Dashboard() {
  const [activePage, setActivePage] = useState(Page.HOME)
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null)
  
  // Function to navigate to marketplace with selected listing
  const navigateToMarketplace = (listingId: number) => {
    setSelectedListingId(listingId);
    setActivePage(Page.MARKETPLACE);
  }

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'w-full max-w-screen-sm mx-auto md:max-w-full md:mx-0 min-h-screen font-body bg-background flex flex-col overflow-x-hidden',
      )}
    >
      {/* Fixed Header */}
      <header className='h-16 px-6 border-b-2 border-foreground/10 flex items-center justify-between fixed top-0 left-0 right-0 bg-background z-10'>
        <Link href='/' className='font-bold text-xl'>
          The Jade Trail
        </Link>
        <div className='flex items-center gap-4'>
          {/* Favorites Button */}
          <button
            className='relative p-2 rounded-full hover:bg-background-dark'
            onClick={() => {
              // We'll implement this functionality in the Marketplace component
              if (activePage === Page.MARKETPLACE) {
                // Using a custom event to communicate with the Marketplace component
                window.dispatchEvent(new CustomEvent('toggle-favorites'));
              } else {
                setActivePage(Page.MARKETPLACE);
                // We'll use setTimeout to allow the component to mount before dispatching the event
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('show-favorites'));
                }, 100);
              }
            }}
          >
            <FiHeart className='w-5 h-5' />
          </button>
          {/* User Avatar or Placeholder */}
          <div className='w-8 h-8 rounded-full bg-foreground/10'></div>
          <span className='hidden sm:inline'>Username</span>
        </div>
      </header>

      <div className='flex flex-col sm:flex-row pt-16'> {/* Stack on mobile, row on sm+ */}
        {/* Fixed Sidebar (hidden on mobile) */}
        <div className="hidden sm:block fixed left-0 top-16 bottom-0">
           <Sidebar
             navItems={navItems}
             value={activePage}
             onChange={setActivePage as (value: string | number) => void}
           />
         </div>

        {/* Main content full-width on mobile, margin-left on desktop, bottom padding on mobile for bottom nav */}
        <main className='flex-1 p-6 pb-16 sm:pb-0 sm:ml-64'>
          {activePage === Page.HOME && <Home navigateToMarketplace={navigateToMarketplace} />}

          {activePage === Page.MESSAGES && <Messages />}

          {activePage === Page.MARKETPLACE && <Marketplace initialSelectedListingId={selectedListingId} />}

          {activePage === Page.MY_LISTINGS && <MyListings navigateToMarketplace={navigateToMarketplace} />}

          {activePage === Page.SETTINGS && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 bg-background border-t-2 border-foreground/10 flex justify-around p-2 sm:hidden z-10 w-full max-w-screen-sm mx-auto inset-x-0">
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setActivePage(item.key)}
            className={classNames(
              'p-2 rounded-md transition-colors',
              item.key === activePage ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
            )}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
