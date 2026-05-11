'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, Plus, Search, Filter,
  Phone, MapPin, Edit2, Trash2, Eye, X, ChevronLeft, ChevronRight,
  AlertTriangle, Shield, Loader2
} from 'lucide-react'
import { getStatusColor, formatDate } from '@/lib/utils'

interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  status: string
  createdAt: string
  user: { email: string }
  subscriptions: Array<{ plan: { name: string }; status: string }>
  riskScores: Array<{ score: number; level: string }>
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [page, setPage] = useState(1)
  const [showHighRiskModal, setShowHighRiskModal] = useState(false)
  const [highRiskCustomers, setHighRiskCustomers] = useState<any[]>([])
  const [loadingHighRisk, setLoadingHighRisk] = useState(false)
  const [suspending, setSuspending] = useState<string | null>(null)
  const [suspendingAll, setSuspendingAll] = useState(false)

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCustomers() }, [])

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = `${c.firstName} ${c.lastName} ${c.phone} ${c.user.email}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const perPage = 10
  const totalPages = Math.ceil(filteredCustomers.length / perPage)
  const paginatedCustomers = filteredCustomers.slice((page - 1) * perPage, page * perPage)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      fetchCustomers()
    } catch (error) {
      console.error('Failed to delete customer:', error)
    }
  }

  const fetchHighRisk = async () => {
    setLoadingHighRisk(true)
    try {
      const res = await fetch('/api/customers/high-risk')
      if (res.ok) {
        const data = await res.json()
        setHighRiskCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch high-risk customers:', error)
    } finally {
      setLoadingHighRisk(false)
    }
  }

  const suspendCustomer = async (customerId: string) => {
    setSuspending(customerId)
    try {
      const res = await fetch('/api/customers/high-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })
      if (res.ok) {
        setHighRiskCustomers(prev => prev.filter(c => c.id !== customerId))
        fetchCustomers()
      }
    } catch (error) {
      console.error('Failed to suspend customer:', error)
    } finally {
      setSuspending(null)
    }
  }

  const suspendAllHighRisk = async () => {
    if (!confirm(`Are you sure you want to suspend all ${highRiskCustomers.length} high-risk customers?`)) return
    setSuspendingAll(true)
    try {
      const res = await fetch('/api/customers/high-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        setHighRiskCustomers([])
        fetchCustomers()
      }
    } catch (error) {
      console.error('Failed to suspend all:', error)
    } finally {
      setSuspendingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-slate-400 mt-1">{customers.length} total customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowHighRiskModal(true); fetchHighRisk() }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
          >
            <AlertTriangle className="w-4 h-4" /> Remove High-Risk
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Customer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search customers..."
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="input-field w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading customers...</p>
          </div>
        ) : paginatedCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No customers found</p>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white">
                          {customer.firstName[0]}{customer.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-slate-500">{customer.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{customer.city}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-white">
                        {customer.subscriptions?.[0]?.plan?.name || 'No Plan'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      {customer.riskScores?.[0] ? (
                        <span className={`badge ${getStatusColor(
                          customer.riskScores[0].level === 'LOW' ? 'ACTIVE' :
                          customer.riskScores[0].level === 'MEDIUM' ? 'PENDING' : 'INACTIVE'
                        )}`}>
                          {customer.riskScores[0].score}% {customer.riskScores[0].level}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">N/A</span>
                      )}
                    </td>
                    <td className="text-sm text-slate-400">{formatDate(customer.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setEditCustomer(customer)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, filteredCustomers.length)} of {filteredCustomers.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-2 px-3 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-2 px-3 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editCustomer) && (
        <CustomerModal
          customer={editCustomer}
          onClose={() => { setShowAddModal(false); setEditCustomer(null) }}
          onSave={() => { fetchCustomers(); setShowAddModal(false); setEditCustomer(null) }}
        />
      )}

      {/* High-Risk Customers Modal */}
      {showHighRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">High-Risk Customers</h2>
                  <p className="text-xs text-slate-500">Customers with churn risk above 87%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {highRiskCustomers.length > 0 && (
                  <button
                    onClick={suspendAllHighRisk}
                    disabled={suspendingAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    {suspendingAll ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Suspending...</>
                    ) : (
                      <><AlertTriangle className="w-3.5 h-3.5" /> Remove All ({highRiskCustomers.length})</>
                    )}
                  </button>
                )}
                <button onClick={() => setShowHighRiskModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {loadingHighRisk ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Scanning for high-risk customers...</p>
                </div>
              ) : highRiskCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">All Clear!</h3>
                  <p className="text-sm text-slate-500">No customers with a risk score above 87%.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {highRiskCustomers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center text-xs font-bold text-red-400">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-400">{c.riskScore}%</p>
                          <p className="text-[10px] uppercase font-bold text-red-500/60">Risk Score</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-slate-400">{c.plan}</p>
                          <p className="text-[10px] text-slate-600">Current Plan</p>
                        </div>
                        <button
                          onClick={() => suspendCustomer(c.id)}
                          disabled={suspending === c.id}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          {suspending === c.id ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Removing...</>
                          ) : (
                            <><Trash2 className="w-3.5 h-3.5" /> Remove</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Customer | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.user?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    status: customer?.status || 'ACTIVE',
    password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = customer ? `/api/customers/${customer.id}` : '/api/customers'
      const method = customer ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save customer')
        return
      }

      onSave()
    } catch {
      setError('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {customer ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {!customer && (
            <>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving...' : customer ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
