'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Shield, Bell, Palette, Check } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { darkMode, toggleDarkMode } = useTheme()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [notifications, setNotifications] = useState({
    'Billing alerts': true,
    'Subscription reminders': true,
    'Support ticket updates': true,
    'AI insights': true,
  })

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('netpulse-email-notifications')
    if (savedEmail !== null) setEmailNotifications(savedEmail === 'true')

    const savedNotifs = localStorage.getItem('netpulse-notifications')
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)) } catch { /* ignore */ }
    }
  }, [])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDarkModeToggle = () => {
    toggleDarkMode()
    showToast(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode')
  }

  const handleEmailToggle = () => {
    const newVal = !emailNotifications
    setEmailNotifications(newVal)
    localStorage.setItem('netpulse-email-notifications', String(newVal))
    showToast(newVal ? 'Email notifications enabled' : 'Email notifications disabled')
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('netpulse-notifications', JSON.stringify(updated))
    showToast(`${key} ${updated[key] ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type} flex items-center gap-2`}>
          <Check className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white">
              {session?.user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{session?.user?.name || 'User'}</p>
              <p className="text-sm text-slate-400">{session?.user?.email}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Shield className="w-3 h-3" /> {session?.user?.role || 'CUSTOMER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Dark Mode</p>
              <p className="text-xs text-slate-500">Application theme preference</p>
            </div>
            <button 
              onClick={handleDarkModeToggle}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${darkMode ? 'bg-blue-500' : 'bg-slate-400'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Email Notifications</p>
              <p className="text-xs text-slate-500">Receive email updates</p>
            </div>
            <button 
              onClick={handleEmailToggle}
              className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${emailNotifications ? 'bg-blue-500' : 'bg-slate-400'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
        </div>
        <div className="space-y-3">
          {(Object.keys(notifications) as Array<keyof typeof notifications>).map((item) => (
            <div key={item} className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">{item}</span>
              <button 
                onClick={() => toggleNotification(item)}
                className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${notifications[item] ? 'bg-blue-500' : 'bg-slate-400'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications[item] ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
