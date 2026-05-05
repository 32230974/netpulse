'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { SessionProvider } from 'next-auth/react'
import {
  Wifi, LayoutDashboard, Users, CreditCard, Receipt,
  MessageSquare, Brain, Settings, LogOut, Menu, X,
  ChevronDown, Search
} from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'
import ChatWidget from '@/components/ChatWidget'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const userRole = session?.user?.role || 'CUSTOMER'

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/customers', icon: Users, label: 'Customers', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions', roles: ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/billing', icon: Receipt, label: 'Billing', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/tickets', icon: MessageSquare, label: 'Tickets', roles: ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] },
    { href: '/ai-insights', icon: Brain, label: 'AI Insights', roles: ['ADMIN', 'EMPLOYEE'] },
    { href: '/settings', icon: Settings, label: 'Settings', roles: ['ADMIN', 'EMPLOYEE', 'CUSTOMER'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(userRole))

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex" data-layout-bg>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        ${sidebarOpen ? 'w-64' : 'w-20'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-[#0f1320] border-r border-white/5
        transition-all duration-300 flex flex-col
      `} data-sidebar-bg>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="text-lg font-bold text-white">
                Net<span className="gradient-text">Pulse</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block text-slate-500 hover:text-white transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-3' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={`sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${!sidebarOpen ? 'justify-center px-3' : ''}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5" data-header-bg>
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 w-72">
                <Search className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <NotificationBell />

              {/* Profile */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white">
                    {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{session?.user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500">{userRole}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1f2e] border border-white/10 rounded-xl py-2 shadow-xl" data-dropdown-bg>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition-colors">
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* AI Chatbot Widget */}
      <ChatWidget />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  )
}
