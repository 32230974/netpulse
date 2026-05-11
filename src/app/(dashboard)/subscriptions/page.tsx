'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CreditCard, Zap, Star, Crown, Check, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Subscription {
  id: string
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  plan: { id: string; name: string; price: number; speed: string; features: string[] }
  bundle?: { id: string; name: string; totalPrice: number; discount: number } | null
  customer: { firstName: string; lastName: string }
}

export default function SubscriptionsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const userRole = session?.user?.role || 'CUSTOMER'
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetch('/api/subscriptions')
        .then(res => res.json())
        .then(data => {
          setSubscriptions(Array.isArray(data) ? data : [])
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [session])

  const plans = [
    { name: 'Basic', price: 29, speed: '50 Mbps', icon: Zap, color: 'blue', features: ['50 Mbps Download', '10 Mbps Upload', 'Email Support', '500GB Data Cap'] },
    { name: 'Standard', price: 49, speed: '100 Mbps', icon: Star, color: 'purple', features: ['100 Mbps Download', '25 Mbps Upload', 'Priority Support', 'Unlimited Data'], popular: true },
    { name: 'Premium', price: 99, speed: '500 Mbps', icon: Crown, color: 'amber', features: ['500 Mbps Download', '100 Mbps Upload', '24/7 Dedicated Support', 'Unlimited Data', 'Static IP', 'Business SLA'] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {userRole === 'CUSTOMER' ? 'My Subscription' : 'Subscriptions'}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {userRole === 'CUSTOMER' ? 'Manage your plan and billing cycles' : 'Manage plans and subscriptions'}
        </p>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = userRole === 'CUSTOMER' && Array.isArray(subscriptions) && subscriptions.some(s => s.plan?.name === plan.name)
            return (
              <div key={plan.name} className={`glass-card p-6 relative ${plan.popular ? 'border-purple-500/30' : ''} ${isCurrent ? 'ring-2 ring-emerald-500/50 border-emerald-500/30' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-bg rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-emerald-500 rounded-full text-xs font-semibold text-white">
                    Current Plan
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-${plan.color}-500/10 flex items-center justify-center mb-4`}>
                  <plan.icon className={`w-6 h-6 text-${plan.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.speed}</p>
                <div className="mt-3 mb-4">
                  <span className="text-3xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400" /> {f}
                    </li>
                  ))}
                </ul>
                {userRole === 'CUSTOMER' && !isCurrent && (
                  <button onClick={() => router.push(`/checkout?plan=${encodeURIComponent(plan.name)}`)} className="btn-primary w-full mt-6">
                    {subscriptions.length > 0 ? 'Switch to' : 'Subscribe to'} {plan.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {userRole === 'CUSTOMER' ? 'Billing Details' : 'Active Subscriptions'}
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No subscriptions found</p>
          </div>
        ) : (Array.isArray(subscriptions) ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Bundle</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Auto-Renew</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id}>
                  <td className="text-sm text-white">{sub.customer?.firstName} {sub.customer?.lastName}</td>
                  <td className="text-sm text-white font-medium">{sub.plan?.name}</td>
                  <td className="text-sm text-white">
                    {sub.bundle ? (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                        {sub.bundle.name}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="text-sm text-white">{formatCurrency(sub.bundle?.totalPrice || sub.plan?.price || 0)}/mo</td>
                  <td className="text-sm text-slate-400">{formatDate(sub.startDate)}</td>
                  <td className="text-sm text-slate-400">{formatDate(sub.endDate)}</td>
                  <td>
                    <span className={`text-xs font-medium ${sub.autoRenew ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {sub.autoRenew ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td><span className={`badge ${getStatusColor(sub.status)}`}>{sub.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-400">Error loading subscriptions</p>
          </div>
        ))}
      </div>
    </div>
  )
}
