'use client'

import { useState, useEffect, useRef, use, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, Send, Bot, User, Clock,
  Sparkles, CheckCircle, Loader2
} from 'lucide-react'
import { formatDateTime, getStatusColor } from '@/lib/utils'

interface TicketDetail {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  creator: { id: string; name: string; email: string; role: string }
  messages: Array<{
    id: string
    content: string
    isAiGenerated: boolean
    createdAt: string
    sender: { name: string; role: string }
  }>
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'CUSTOMER'
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTicket(data)
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchTicket() }, [fetchTicket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket?.messages])

  const sendReply = async () => {
    if (!reply.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply }),
      })
      if (res.ok) {
        setReply('')
        fetchTicket()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchTicket()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getAiSuggestion = async () => {
    setLoadingSuggestion(true)
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: ticket?.subject,
          description: ticket?.description,
          messages: ticket?.messages?.map(m => m.content) || [],
        }),
      })
      const data = await res.json()
      setAiSuggestion(data.suggestion || 'Unable to generate suggestion.')
    } catch {
      setAiSuggestion('AI suggestion unavailable. Please try again.')
    } finally {
      setLoadingSuggestion(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Ticket not found</p>
        <Link href="/tickets" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Tickets
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/tickets" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all mt-1">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${getStatusColor(ticket.status)}`}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500">#{ticket.id.slice(-6).toUpperCase()}</span>
          </div>
          <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Created by {ticket.creator?.name} • {formatDateTime(ticket.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRole !== 'CUSTOMER' && (
            <>
              {ticket.status !== 'IN_PROGRESS' && ticket.status !== 'CLOSED' && (
                <button onClick={() => updateStatus('IN_PROGRESS')} className="btn-secondary text-sm py-2">
                  <Clock className="w-3.5 h-3.5" /> In Progress
                </button>
              )}
              {ticket.status !== 'CLOSED' && (
                <button onClick={() => updateStatus('CLOSED')} className="btn-primary text-sm py-2">
                  <CheckCircle className="w-3.5 h-3.5" /> Close
                </button>
              )}
              {ticket.status === 'CLOSED' && (
                <button onClick={() => updateStatus('OPEN')} className="btn-secondary text-sm py-2">
                  Reopen
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Original Description */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{ticket.creator?.name}</p>
                <p className="text-xs text-slate-500">{formatDateTime(ticket.createdAt)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Messages */}
          {ticket.messages?.map((msg) => (
            <div key={msg.id} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.isAiGenerated ? 'gradient-bg' :
                  msg.sender?.role === 'ADMIN' || msg.sender?.role === 'EMPLOYEE'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {msg.isAiGenerated ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{msg.sender?.name || 'Unknown'}</p>
                    {msg.isAiGenerated && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">AI</span>
                    )}
                    {(msg.sender?.role === 'ADMIN' || msg.sender?.role === 'EMPLOYEE') && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Staff</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{formatDateTime(msg.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {/* Reply Box */}
          {ticket.status !== 'CLOSED' && (
            <div className="glass-card p-5">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write your reply..."
                className="input-field min-h-[100px] resize-y mb-3"
              />
              <div className="flex items-center justify-between">
                <div>
                  {userRole !== 'CUSTOMER' && (
                    <button
                      onClick={getAiSuggestion}
                      disabled={loadingSuggestion}
                      className="btn-secondary text-sm py-2"
                    >
                      {loadingSuggestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      AI Suggest
                    </button>
                  )}
                </div>
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="btn-primary text-sm py-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestion Panel - Only for Staff */}
        <div className="space-y-4">
          {userRole !== 'CUSTOMER' && (
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              </div>

              {aiSuggestion ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                  <button
                    onClick={() => setReply(aiSuggestion)}
                    className="btn-secondary text-xs py-1.5 w-full"
                  >
                    Use as Reply
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">Get AI-powered response suggestions</p>
                  <button
                    onClick={getAiSuggestion}
                    disabled={loadingSuggestion}
                    className="btn-primary text-xs py-2"
                  >
                    {loadingSuggestion ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    Generate Suggestion
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Ticket Info */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Ticket Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`badge ${getStatusColor(ticket.status)}`}>{ticket.status.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Priority</span>
                <span className="text-white">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-300">{formatDateTime(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Messages</span>
                <span className="text-white">{(ticket.messages?.length || 0) + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
