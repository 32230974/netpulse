'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  MessageSquare, Plus, Search, X,
  Clock, CheckCircle, AlertCircle, ChevronRight
} from 'lucide-react'
import { getRelativeTime, getStatusColor } from '@/lib/utils'

interface Ticket {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  creator: { name: string; email: string }
  messages: Array<{ id: string }>
}

export default function TicketsPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'CUSTOMER'
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = `${t.subject} ${t.description} ${t.creator?.name}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    closed: tickets.filter(t => t.status === 'CLOSED').length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-slate-400 bg-slate-500/10'
      case 'MEDIUM': return 'text-blue-400 bg-blue-500/10'
      case 'HIGH': return 'text-amber-400 bg-amber-500/10'
      case 'URGENT': return 'text-red-400 bg-red-500/10'
      default: return 'text-slate-400 bg-slate-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {userRole === 'CUSTOMER' ? 'My Support Tickets' : 'Support Tickets'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{tickets.length} {userRole === 'CUSTOMER' ? 'tickets' : 'total tickets'}</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500/15 to-blue-600/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats.open}</p>
            <p className="text-xs text-slate-500">Open</p>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-purple-500/15 to-purple-600/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats.inProgress}</p>
            <p className="text-xs text-slate-500">In Progress</p>
          </div>
        </div>
        <div className="stat-card bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{stats.closed}</p>
            <p className="text-xs text-slate-500">Closed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="ALL">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {loading ? (
          <div className="glass-card p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No tickets found</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="glass-card p-5 block group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    {userRole !== 'CUSTOMER' && <span>by {ticket.creator?.name || 'Unknown'}</span>}
                    <span>{getRelativeTime(ticket.createdAt)}</span>
                    <span>{ticket.messages?.length || 0} replies</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0 mt-2" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => { fetchTickets(); setShowCreateModal(false) }}
        />
      )}
    </div>
  )
}

function CreateTicketModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'MEDIUM',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) onSave()
    } catch (error) {
      console.error('Failed to create ticket:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Create Ticket</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input-field"
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="Detailed description..."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Submit Ticket'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
