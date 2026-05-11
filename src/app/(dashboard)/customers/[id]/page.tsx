'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, MapPin, Calendar,
  CreditCard, Receipt, Shield,
  AlertTriangle, Plus, X, Check
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getRiskColor, getRiskBgColor } from '@/lib/utils'

interface CustomerDetail {
  id: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  status: string
  createdAt: string
  user: { email: string; role: string }
  subscriptions: Array<{
    id: string
    status: string
    startDate: string
    endDate: string
    plan: { name: string; price: number; speed: string }
  }>
  invoices: Array<{
    id: string
    amount: number
    total: number
    status: string
    dueDate: string
    description: string
  }>
  riskScores: Array<{
    score: number
    level: string
    factors: string[]
    calculatedAt: string
  }>
}

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSubModal, setShowSubModal] = useState(false)

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCustomer(data)
      }
    } catch (error) {
      console.error('Failed to fetch customer:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Customer not found</p>
        <Link href="/customers" className="btn-secondary mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
      </div>
    )
  }

  const latestRisk = customer.riskScores?.[0]
  const activeSubscription = customer.subscriptions?.find(s => s.status === 'ACTIVE')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{customer.firstName} {customer.lastName}</h1>
          <p className="text-sm text-slate-400">Customer Profile</p>
        </div>
        <span className={`badge ${getStatusColor(customer.status)}`}>{customer.status}</span>
      </div>

      {/* Profile Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white">
              {customer.firstName[0]}{customer.lastName[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{customer.firstName} {customer.lastName}</h2>
              <p className="text-sm text-slate-400">{customer.user.email}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{customer.user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{customer.address}, {customer.city}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">Joined {formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Subscription</h3>
            </div>
            <button
              onClick={() => setShowSubModal(true)}
              className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              {activeSubscription ? 'Change Plan' : 'Add Plan'}
            </button>
          </div>
          {activeSubscription ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/15">
                <p className="text-lg font-bold text-white">{activeSubscription.plan.name} Plan</p>
                <p className="text-2xl font-bold gradient-text mt-1">
                  {formatCurrency(activeSubscription.plan.price)}<span className="text-sm text-slate-500">/mo</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{activeSubscription.plan.speed}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`badge ${getStatusColor(activeSubscription.status)}`}>{activeSubscription.status}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Start Date</span>
                <span className="text-slate-300">{formatDate(activeSubscription.startDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">End Date</span>
                <span className="text-slate-300">{formatDate(activeSubscription.endDate)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No active subscription</p>
            </div>
          )}
        </div>

        {/* Risk Score Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Churn Risk</h3>
          </div>
          {latestRisk ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getRiskBgColor(latestRisk.level)}`}>
                  <div>
                    <p className={`text-3xl font-bold ${getRiskColor(latestRisk.level)}`}>{latestRisk.score}</p>
                    <p className="text-xs text-slate-500">/ 100</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold mt-3 ${getRiskColor(latestRisk.level)}`}>
                  {latestRisk.level} Risk
                </p>
              </div>
              {latestRisk.factors.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Risk Factors</p>
                  <div className="space-y-1.5">
                    {(Array.isArray(latestRisk.factors) ? latestRisk.factors : (latestRisk.factors as string || '').split(',').filter(Boolean)).map((factor, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        {factor.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-600">Last calculated: {formatDate(latestRisk.calculatedAt)}</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No risk assessment yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Invoice History</h3>
        </div>
        {customer.invoices.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customer.invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="text-sm text-white font-mono">#{invoice.id.slice(-6).toUpperCase()}</td>
                  <td className="text-sm text-slate-400">{invoice.description}</td>
                  <td className="text-sm text-white font-medium">{formatCurrency(invoice.total)}</td>
                  <td className="text-sm text-slate-400">{formatDate(invoice.dueDate)}</td>
                  <td><span className={`badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-sm text-slate-500 py-6">No invoices yet</p>
        )}
      </div>

      {showSubModal && (
        <SubscriptionModal
          customerId={customer.id}
          onClose={() => setShowSubModal(false)}
          onSave={() => { fetchCustomer(); setShowSubModal(false) }}
        />
      )}
    </div>
  )
}

function SubscriptionModal({ customerId, onClose, onSave }: { customerId: string; onClose: () => void; onSave: () => void }) {
  const [plans, setPlans] = useState<Array<{ id: string; name: string; price: number; speed: string; features: string[] }>>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/plans').then(res => res.json()).then(setPlans).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan) return
    setSaving(true)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, planId: selectedPlan }),
      })
      if (res.ok) onSave()
    } catch (error) {
      console.error('Failed to create subscription:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Manage Subscription</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-xs text-slate-500">{plan.speed}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${plan.price}</p>
                    <p className="text-[10px] text-slate-500">/month</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving || !selectedPlan} className="btn-primary flex-1">
              {saving ? 'Processing...' : 'Assign Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
