import { useState } from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { geistMono, geistSans } from '@/styles/fonts'
import { FiHome, FiPackage, FiUser, FiMessageSquare, FiSettings, FiLogOut } from 'react-icons/fi'
import Messages from '@/components/messages'
import Marketplace from '@/components/marketplace'
import Settings from '@/components/settings'

export default function Dashboard() {
  const [activePage, setActivePage] = useState('home')
  // Mock data for recent listings/trades
  const recentListings = [
    { id: 1, title: 'Collectible Item', price: '$250', seller: 'user123', time: '2 hours ago' },
    { id: 2, title: 'Rare Artifact', price: '$1,200', seller: 'jade_collector', time: '5 hours ago' },
    { id: 3, title: 'Vintage Item', price: '$800', seller: 'antique_lover', time: '1 day ago' },
    { id: 4, title: 'Limited Edition', price: '$450', seller: 'treasure_hunter', time: '2 days ago' },
  ]

  return (
    <div
      className={classNames(
        geistSans.variable,
        geistMono.variable,
        'min-h-screen font-body bg-background',
      )}
    >
      {/* Header */}
      <header className="h-16 px-6 border-b border-foreground/10 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          The Jade Trail
        </Link>
        <div className="flex items-center">
          {/* User Avatar or Placeholder */}
          <div className="w-8 h-8 rounded-full bg-foreground/10 mr-2" />
          <span>Username</span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-16 sm:w-64 border-r border-foreground/10 h-[calc(100vh-4rem)] p-4 flex flex-col">
          <nav className="space-y-1">
            <button
              onClick={() => setActivePage('home')}
              className={classNames(
                "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
                activePage === 'home'
                  ? "bg-foreground text-background"
                  : "hover:bg-background-dark"
              )}
            >
              <FiHome className="w-5 h-5 min-w-5" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => setActivePage('marketplace')}
              className={classNames(
                "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
                activePage === 'marketplace'
                  ? "bg-foreground text-background"
                  : "hover:bg-background-dark"
              )}
            >
              <FiPackage className="w-5 h-5 min-w-5" />
              <span className="hidden sm:inline">Marketplace</span>
            </button>

            <button
              onClick={() => setActivePage('messages')}
              className={classNames(
                "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
                activePage === 'messages'
                  ? "bg-foreground text-background"
                  : "hover:bg-background-dark"
              )}
            >
              <FiMessageSquare className="w-5 h-5 min-w-5" />
              <span className="hidden sm:inline">Messages</span>
            </button>

            <button
              onClick={() => setActivePage('settings')}
              className={classNames(
                "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
                activePage === 'settings'
                  ? "bg-foreground text-background"
                  : "hover:bg-background-dark"
              )}
            >
              <FiSettings className="w-5 h-5 min-w-5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </nav>

          <div className="mt-auto">
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-background-dark w-full transition-colors text-red-500"
            >
              <FiLogOut className="w-5 h-5 min-w-5" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {activePage === 'home' && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
                <p className="text-foreground/70">Here's what's happening on your Jade Trail today.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Market Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Active Listings</span>
                      <span className="font-mono font-bold">1,245</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed Trades</span>
                      <span className="font-mono font-bold">289</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Trade Value</span>
                      <span className="font-mono font-bold">$420</span>
                    </div>
                  </div>
                  <button className="mt-4 button w-full">View More Stats</button>
                </div>

                <div className="bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Your Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current Listings</span>
                      <span className="font-mono font-bold">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Trades</span>
                      <span className="font-mono font-bold">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Messages</span>
                      <span className="font-mono font-bold">5</span>
                    </div>
                  </div>
                  <button className="mt-4 button-primary w-full">Create New Listing</button>
                </div>
              </div>

              <div className="bg-background-light p-6 rounded-lg border border-foreground/10 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Recent Listings</h3>
                  <button className="text-sm link">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-foreground/10">
                      <tr>
                        <th className="py-3 text-left">Item</th>
                        <th className="py-3 text-left">Price</th>
                        <th className="py-3 text-left">Seller</th>
                        <th className="py-3 text-left">Listed</th>
                        <th className="py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentListings.map((item) => (
                        <tr key={item.id} className="border-b border-foreground/5 hover:bg-background-dark/30">
                          <td className="py-3">{item.title}</td>
                          <td className="py-3 font-mono">{item.price}</td>
                          <td className="py-3">{item.seller}</td>
                          <td className="py-3 text-foreground/70">{item.time}</td>
                          <td className="py-3 text-right">
                            <button className="button py-1 px-3 h-auto">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activePage === 'messages' && (
            <Messages />
          )}

          {activePage === 'marketplace' && (
            <Marketplace />
          )}

          {activePage === 'settings' && (
            <Settings />
          )}
        </main>
      </div>
    </div>
  )
}