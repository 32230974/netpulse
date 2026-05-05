'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react'

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (id?: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        if (id) {
          setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
        } else {
          setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        }
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />
      case 'error': return <X className="w-4 h-4 text-red-400" />
      default: return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                    onClick={() => !n.isRead && markAsRead(n.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium mb-0.5 ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-600">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(new Date(n.createdAt))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2 opacity-20" />
                <p className="text-xs text-slate-500">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
