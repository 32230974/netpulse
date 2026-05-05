'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Receipt, DollarSign, Plus, Search,
  TrendingUp, Clock, X,
  AlertCircle, Download
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

interface Invoice {
  id: string
  amount: number
  tax: number
  total: number
  status: string
  dueDate: string
  description: string
  createdAt: string
  customer: {
    firstName: string
    lastName: string
    user: { email: string }
  }
  payments: Array<{ amount: number; paidAt: string; method: string }>
}

const revenueData = [
  { month: 'Jan', revenue: 32000 },
  { month: 'Feb', revenue: 35000 },
  { month: 'Mar', revenue: 38000 },
  { month: 'Apr', revenue: 36000 },
  { month: 'May', revenue: 42000 },
  { month: 'Jun', revenue: 45000 },
  { month: 'Jul', revenue: 48000 },
  { month: 'Aug', revenue: 52000 },
  { month: 'Sep', revenue: 49000 },
  { month: 'Oct', revenue: 55000 },
  { month: 'Nov', revenue: 58000 },
  { month: 'Dec', revenue: 62000 },
]

export default function BillingPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'CUSTOMER'
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) {
        const data = await res.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [])

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = `${inv.customer?.firstName} ${inv.customer?.lastName} ${inv.description}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0)
  const pendingRevenue = invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.total, 0)
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0)

  const togglePaymentStatus = async (invoiceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID'
    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchInvoices()
    } catch (error) {
      console.error('Failed to update invoice:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {userRole === 'CUSTOMER' ? 'My Invoices' : 'Billing'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {userRole === 'CUSTOMER' ? 'View and manage your service payments' : 'Manage invoices and revenue'}
          </p>
        </div>
        {userRole !== 'CUSTOMER' && (
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      {/* Revenue Summary Cards - Only for Admin/Employee */}
      {userRole !== 'CUSTOMER' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card bg-gradient-to-br from-emerald-500/15 to-emerald-600/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Revenue</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="w-3 h-3" /> +8.3% from last month
              </div>
            </div>

            <div className="stat-card bg-gradient-to-br from-amber-500/15 to-amber-600/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(pendingRevenue)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{invoices.filter(i => i.status === 'UNPAID').length} unpaid invoices</p>
            </div>

            <div className="stat-card bg-gradient-to-br from-red-500/15 to-red-600/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Overdue</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(overdueAmount)}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">{invoices.filter(i => i.status === 'OVERDUE').length} overdue invoices</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="billingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1f2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: unknown) => [formatCurrency(Number(value)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#billingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No invoices found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  {userRole !== 'CUSTOMER' && <th>Customer</th>}
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="text-sm text-white font-mono">#{invoice.id.slice(-6).toUpperCase()}</td>
                    {userRole !== 'CUSTOMER' && (
                      <td>
                        <p className="text-sm text-white">{invoice.customer?.firstName} {invoice.customer?.lastName}</p>
                        <p className="text-xs text-slate-500">{invoice.customer?.user?.email}</p>
                      </td>
                    )}
                    <td className="text-sm text-slate-400">{invoice.description}</td>
                    <td className="text-sm text-white font-medium">{formatCurrency(invoice.total)}</td>
                    <td className="text-sm text-slate-400">{formatDate(invoice.dueDate)}</td>
                    <td>
                      <span className={`badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                    </td>
                    <td>
                      {userRole !== 'CUSTOMER' ? (
                        <button
                          onClick={() => togglePaymentStatus(invoice.id, invoice.status)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            invoice.status === 'PAID'
                              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {invoice.status === 'PAID' ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      ) : (
                        <button className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => { fetchInvoices(); setShowCreateModal(false) }}
        />
      )}
    </div>
  )
}

function CreateInvoiceModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    tax: '0',
    description: '',
    dueDate: '',
  })
  const [customers, setCustomers] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const amount = parseFloat(formData.amount)
    const tax = parseFloat(formData.tax)

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: formData.customerId,
          amount,
          tax,
          total: amount + tax,
          description: formData.description,
          dueDate: new Date(formData.dueDate).toISOString(),
        }),
      })

      if (res.ok) onSave()
    } catch (error) {
      console.error('Failed to create invoice:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Create Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Customer</label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Amount ($)</label>
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Tax ($)</label>
              <input type="number" step="0.01" value={formData.tax} onChange={e => setFormData({...formData, tax: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Description</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" placeholder="Monthly internet service" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Due Date</label>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="input-field" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
