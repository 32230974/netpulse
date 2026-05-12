'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Users, CreditCard, DollarSign, MessageSquare,
  TrendingUp, AlertTriangle, Brain,
  ArrowUpRight, ArrowDownRight, Activity, Zap,
  CheckCircle2, Clock, ShieldCheck,
  HardDrive, Sparkles, Rocket, Headphones, Monitor, Loader2, Gift,
  BatteryCharging, Package, X, Lock, Tag
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface DashboardStats {
  totalCustomers: number
  activeSubscriptions: number
  monthlyRevenue: number
  openTickets: number
  customerGrowth: number
  revenueGrowth: number
  churnRate: number
}

const revenueData = [
  { month: 'Jan', revenue: 32000, customers: 280 },
  { month: 'Feb', revenue: 35000, customers: 300 },
  { month: 'Mar', revenue: 38000, customers: 325 },
  { month: 'Apr', revenue: 36000, customers: 340 },
  { month: 'May', revenue: 42000, customers: 380 },
  { month: 'Jun', revenue: 45000, customers: 410 },
  { month: 'Jul', revenue: 48000, customers: 445 },
  { month: 'Aug', revenue: 52000, customers: 480 },
  { month: 'Sep', revenue: 49000, customers: 490 },
  { month: 'Oct', revenue: 55000, customers: 520 },
  { month: 'Nov', revenue: 58000, customers: 550 },
  { month: 'Dec', revenue: 62000, customers: 580 },
]

const churnData = [
  { name: 'Low Risk', value: 65, color: '#10b981' },
  { name: 'Medium Risk', value: 25, color: '#f59e0b' },
  { name: 'High Risk', value: 10, color: '#ef4444' },
]

const planDistribution = [
  { name: 'Basic', customers: 180, revenue: 5220 },
  { name: 'Standard', customers: 250, revenue: 12250 },
  { name: 'Premium', customers: 150, revenue: 14850 },
]

const recentActivity = [
  { type: 'customer', message: 'New customer Sarah Johnson signed up', time: '2m ago', icon: Users },
  { type: 'payment', message: 'Payment received from Mike Chen - $49.00', time: '15m ago', icon: DollarSign },
  { type: 'ticket', message: 'Ticket #1042 - Internet outage reported', time: '32m ago', icon: MessageSquare },
  { type: 'subscription', message: 'Premium upgrade by Alex Rivera', time: '1h ago', icon: CreditCard },
  { type: 'ai', message: 'AI detected 3 new high-risk churn customers', time: '2h ago', icon: Brain },
]

const aiInsights = [
  { title: 'Revenue Forecast', content: 'Projected 12% growth next month based on current trends', type: 'positive' },
  { title: 'Churn Alert', content: '8 customers showing high churn risk - immediate attention needed', type: 'warning' },
  { title: 'Plan Optimization', content: 'Standard plan has highest conversion. Consider marketing push.', type: 'info' },
]

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f2e] border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-white">{formatCurrency(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    openTickets: 0,
    customerGrowth: 0,
    revenueGrowth: 0,
    churnRate: 0,
  })
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userRole = session?.user?.role || 'CUSTOMER'

  const fetchData = async () => {
    if (status !== 'authenticated') return

    setLoading(true)
    setError(null)
    try {
      if (userRole === 'CUSTOMER') {
        const res = await fetch('/api/dashboard/customer-stats')
        if (!res.ok) throw new Error('Failed to fetch customer data')
        setCustomerData(await res.json())
      } else {
        const res = await fetch('/api/dashboard/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        setStats(await res.json())
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Something went wrong while loading the dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, userRole])

  if (status === 'loading' || loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-slate-400 animate-pulse font-medium">Loading your dashboard...</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h2>
      <p className="text-slate-400 max-w-md mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Try Again
      </button>
    </div>
  )

  if (userRole === 'CUSTOMER') {
    return <CustomerDashboard data={customerData} onRefresh={fetchData} />
  }

  // Color mapping for Tailwind classes (ensures they are correctly detected/safelisted)
  const colorMap: Record<string, { bg: string, text: string, iconBg: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-600/5', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-600/5', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/5', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    amber: { bg: 'from-amber-500/20 to-amber-600/5', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: (stats.totalCustomers || 0).toLocaleString(),
      change: stats.customerGrowth,
      icon: Users,
      color: 'blue',
      href: '/customers',
    },
    {
      title: 'Active Subscriptions',
      value: (stats.activeSubscriptions || 0).toLocaleString(),
      change: 5.2,
      icon: CreditCard,
      color: 'purple',
      href: '/subscriptions',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue || 0),
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'emerald',
      href: '/billing',
    },
    {
      title: 'Open Tickets',
      value: (stats.openTickets || 0).toString(),
      change: -2.1,
      icon: MessageSquare,
      color: 'amber',
      href: '/tickets',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your ISP operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all text-xs font-medium"
          >
            <Tag className="w-3.5 h-3.5" /> Manage Data Offers
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const colors = colorMap[card.color] || colorMap.blue
          return (
            <Link key={i} href={card.href} className={`stat-card block hover:scale-[1.02] transition-all bg-gradient-to-br ${colors.bg}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${card.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(card.change)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-xs text-slate-500">{card.title}</p>
            </Link>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly revenue trend</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +{stats.revenueGrowth}%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Churn Risk Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Churn Risk</h2>
          <p className="text-xs text-slate-500 mb-4">Customer risk distribution</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={churnData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {churnData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {churnData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}</span>
                </div>
                <span className="text-xs font-medium text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Plan Distribution</h2>
          <p className="text-xs text-slate-500 mb-4">Customers by plan</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={planDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="customers" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">AI Insights</h2>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className={`p-3 rounded-xl border ${insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/10' :
                insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/10' :
                  'bg-blue-500/5 border-blue-500/10'
                }`}>
                <div className="flex items-center gap-2 mb-1">
                  {insight.type === 'positive' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                    insight.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> :
                      <Zap className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="text-xs font-semibold text-white">{insight.title}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{insight.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === 'customer' ? 'bg-blue-500/10 text-blue-400' :
                  activity.type === 'payment' ? 'bg-emerald-500/10 text-emerald-400' :
                    activity.type === 'ticket' ? 'bg-amber-500/10 text-amber-400' :
                      activity.type === 'subscription' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-cyan-500/10 text-cyan-400'
                  }`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showOfferModal && <DataOfferModal onClose={() => setShowOfferModal(false)} />}
    </div>
  )
}

interface MarketplaceItem {
  id: string
  name: string
  dataCostGb: number
  description: string
}

interface DataBundle {
  id: string
  name: string
  dataGb: number
  price: number
  offerPrice?: number | null
  description: string
  popular: boolean
}

const MARKETPLACE_ICONS: Record<string, any> = {
  ai_insights: Sparkles,
  priority_support: Headphones,
  speed_boost: Rocket,
  extra_device: Monitor,
}

const MARKETPLACE_COLORS: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  ai_insights: { bg: 'bg-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', iconBg: 'bg-purple-500/15' },
  priority_support: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-500/15' },
  speed_boost: { bg: 'bg-cyan-500/5', border: 'border-cyan-500/20', text: 'text-cyan-400', iconBg: 'bg-cyan-500/15' },
  extra_device: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/15' },
}

function CustomerDashboard({ data, onRefresh }: { data: any; onRefresh?: () => void }) {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([])
  const [dataBundles, setDataBundles] = useState<DataBundle[]>([])
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [recharging, setRecharging] = useState<string | null>(null)
  const [successItem, setSuccessItem] = useState<string | null>(null)
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [rechargeError, setRechargeError] = useState<string | null>(null)
  const [liveDataUsed, setLiveDataUsed] = useState<number | null>(null)
  const [liveDataCap, setLiveDataCap] = useState<number | null>(null)
  const [localUnlocked, setLocalUnlocked] = useState<string[]>([])
  const [isLoadingBundles, setIsLoadingBundles] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedBundleForPayment, setSelectedBundleForPayment] = useState<DataBundle | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({ name: '', cardNumber: '', expiry: '', cvc: '' })

  useEffect(() => {
    fetch('/api/marketplace/purchase')
      .then(res => res.ok ? res.json() : [])
      .then(items => setMarketplaceItems(Array.isArray(items) ? items : []))
      .catch(() => setMarketplaceItems([]))

    setIsLoadingBundles(true)
    fetch('/api/data-bundles/purchase')
      .then(res => res.ok ? res.json() : [])
      .then(bundles => {
        setDataBundles(Array.isArray(bundles) ? bundles : [])
        setIsLoadingBundles(false)
      })
      .catch(() => {
        setDataBundles([])
        setIsLoadingBundles(false)
      })
  }, [])

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-slate-500" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">No data available</h2>
      <p className="text-slate-400 max-w-md">We couldn&apos;t find any information for your account. Please contact support if you believe this is an error.</p>
    </div>
  )

  let persistedFeatures: string[] = []
  try {
    persistedFeatures = JSON.parse(data.activeSubscription?.unlockedFeatures || '[]')
  } catch (e) {
    console.error('Failed to parse unlocked features:', e)
  }

  const activeFeatures = [
    ...persistedFeatures,
    ...localUnlocked
  ]

  const dataCapGb: number = liveDataCap !== null ? liveDataCap : (data.dataCapGb || 0)
  const dataUsedGb: number = liveDataUsed !== null ? liveDataUsed : (data.dataUsedGb || 0)
  const dataRemainingGb = Math.max(0, dataCapGb - dataUsedGb)
  const usagePercent = dataCapGb > 0 ? Math.min(100, (dataUsedGb / dataCapGb) * 100) : 0
  const usageColor = usagePercent > 85 ? 'text-red-400' : usagePercent > 60 ? 'text-amber-400' : 'text-emerald-400'
  const usageBarColor = usagePercent > 85 ? 'bg-red-500' : usagePercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'

  const handleRecharge = (bundle: DataBundle) => {
    const finalBundle = {
      ...bundle,
      price: bundle.offerPrice ?? bundle.price
    }
    setSelectedBundleForPayment(finalBundle)
    setPaymentSuccess(false)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBundleForPayment) return

    setPaymentProcessing(true)
    setRechargeError(null)

    // 1. Simulate Payment Gateway (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const res = await fetch('/api/data-bundles/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId: selectedBundleForPayment.id }),
      })

      const result = await res.json()

      if (!res.ok) {
        setRechargeError(result.error || 'Payment failed')
        setPaymentProcessing(false)
        return
      }

      // 2. Success!
      setPaymentProcessing(false)
      setPaymentSuccess(true)
      setLiveDataUsed(result.dataUsedGb)
      setLiveDataCap(result.dataCapGb)

      // Refresh parent data to ensure consistency across the whole dashboard
      if (onRefresh) onRefresh()

      // 3. Close modal after success animation
      setTimeout(() => {
        setShowPaymentModal(false)
        setPaymentSuccess(false)
        setSelectedBundleForPayment(null)
      }, 3000)
    } catch {
      setRechargeError('Payment network error. Please try again.')
      setPaymentProcessing(false)
    }
  }

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId)
    setErrorMsg(null)
    setSuccessItem(null)

    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const result = await res.json()

      if (!res.ok) {
        setErrorMsg(result.error || 'Purchase failed')
        return
      }

      setSuccessItem(itemId)
      setLocalUnlocked(prev => [...prev, itemId])
      setLiveDataUsed(result.dataUsedGb)
      if (result.dataCapGb !== undefined) setLiveDataCap(result.dataCapGb)
      setTimeout(() => setSuccessItem(null), 4000)
    } catch {
      setErrorMsg('Network error. Please try again.')
    } finally {
      setPurchasing(null)
    }
  }

  const colorMap: Record<string, { bg: string, text: string, iconBg: string }> = {
    emerald: { bg: 'bg-emerald-500/5', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    red: { bg: 'bg-red-500/5', text: 'text-red-400', iconBg: 'bg-red-500/20' },
    blue: { bg: 'bg-blue-500/5', text: 'text-blue-400', iconBg: 'bg-blue-500/20' },
    purple: { bg: 'bg-purple-500/5', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
  }

  const stats = [
    { label: 'Service Status', value: 'Active', icon: ShieldCheck, color: 'emerald', href: '/dashboard' },
    { label: 'Unpaid Invoices', value: data.unpaidInvoices || 0, icon: CreditCard, color: (data.unpaidInvoices || 0) > 0 ? 'red' : 'emerald', href: '/billing' },
    { label: 'Support Tickets', value: data.totalTickets || 0, icon: MessageSquare, color: activeFeatures.includes('priority_support') ? 'purple' : 'blue', href: '/tickets', badge: activeFeatures.includes('priority_support') ? 'PRIORITY' : null },
    { label: 'Next Payment', value: data.recentInvoices?.[0] ? new Date(data.recentInvoices[0].dueDate).toLocaleDateString() : 'N/A', icon: Clock, color: 'purple', href: '/billing' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="text-sm text-slate-400 mt-1">Here is an overview of your internet service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const colors = (stat.color && colorMap.hasOwnProperty(stat.color)) ? colorMap[stat.color] : colorMap.blue
          return (
            <Link key={i} href={stat.href} className={`stat-card block ${colors.bg} hover:scale-[1.02] hover:bg-white/10 transition-all`}>
              <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center mb-4 relative`}>
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
                {stat.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-purple-500 text-[8px] font-bold text-white">
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Data Usage Card */}
      {dataCapGb > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Data Usage</h2>
                <p className="text-xs text-slate-500">Your current billing period</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${usageColor}`}>{dataRemainingGb.toFixed(1)} GB</p>
              <p className="text-[10px] text-slate-500">remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
              <div
                className={`h-full rounded-full ${usageBarColor} transition-all duration-700 ease-out`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{dataUsedGb.toFixed(1)} GB used</span>
            <span className="text-slate-500">{dataCapGb} GB total</span>
          </div>

          {/* Usage Breakdown Summary */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/5">
            <div className="text-center">
              <p className="text-lg font-bold text-white">{usagePercent.toFixed(0)}%</p>
              <p className="text-[10px] text-slate-500">Used</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{dataCapGb} GB</p>
              <p className="text-[10px] text-slate-500">Data Cap</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${usageColor}`}>{(100 - usagePercent).toFixed(0)}%</p>
              <p className="text-[10px] text-slate-500">Available</p>
            </div>
          </div>
        </div>
      )}

      {/* Recharge Data Bundles */}
      <div id="recharge-section" className="glass-card p-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Recharge Data</h2>
            <p className="text-xs text-slate-500">Buy a data bundle to top up your balance</p>
          </div>
        </div>

        {rechargeSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-300">Data recharged successfully! Your balance has been updated.</p>
          </div>
        )}
        {rechargeError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{rechargeError}</p>
          </div>
        )}

        {isLoadingBundles ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading data bundles...</p>
          </div>
        ) : dataBundles.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            {dataBundles.map((bundle) => {
              const isRecharging = recharging === bundle.id
              const justRecharged = rechargeSuccess === bundle.id

              return (
                <div
                  key={bundle.id}
                  className={`relative p-4 rounded-xl border transition-all ${justRecharged
                      ? 'border-emerald-500/40 bg-emerald-500/5 ring-2 ring-emerald-500/30'
                      : bundle.popular
                        ? 'border-blue-500/30 bg-blue-500/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                >
                  {bundle.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-blue-500 text-[10px] font-bold text-white">
                      POPULAR
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <Package className={`w-4 h-4 ${bundle.popular ? 'text-blue-400' : 'text-slate-400'}`} />
                    <h3 className="text-sm font-semibold text-white">{bundle.name}</h3>
                  </div>

                  <p className="text-2xl font-bold text-white mb-0.5">{bundle.dataGb} <span className="text-sm font-normal text-slate-400">GB</span></p>

                  <div className="flex items-center gap-2 mb-4">
                    {bundle.offerPrice ? (
                      <>
                        <span className="text-lg font-bold text-emerald-400">${bundle.offerPrice.toFixed(2)}</span>
                        <span className="text-xs text-slate-500 line-through">${bundle.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-white">${bundle.price.toFixed(2)}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRecharge(bundle)}
                    disabled={paymentProcessing}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${bundle.offerPrice
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                        : 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-white border border-emerald-500/20 hover:scale-[1.02] active:scale-95'
                      }`}
                  >
                    <BatteryCharging className="w-3.5 h-3.5" /> Buy for ${(bundle.offerPrice ?? bundle.price).toFixed(2)}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No data bundles available at the moment.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBundleForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300">
            {paymentSuccess ? (
              <div className="p-8 text-center space-y-4 py-12">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 scale-in-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                <p className="text-slate-400">
                  Your balance has been topped up with {selectedBundleForPayment.dataGb} GB.
                </p>
                <div className="pt-4">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-[progress_3s_linear]" />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400" /> Complete Purchase
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-400">Selected Bundle</span>
                    <span className="text-xs font-bold text-white">{selectedBundleForPayment.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Total Amount</span>
                    <span className="text-sm font-bold text-blue-400">${selectedBundleForPayment.price.toFixed(2)}</span>
                  </div>
                </div>

                {rechargeError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {rechargeError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Cardholder Name</label>
                    <input
                      type="text" required
                      className="input-field bg-white/5 border-white/10"
                      placeholder="JOHN DOE"
                      value={paymentFormData.name}
                      onChange={e => setPaymentFormData({ ...paymentFormData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text" required maxLength={19}
                        className="input-field bg-white/5 border-white/10 pl-10"
                        placeholder="0000 0000 0000 0000"
                        value={paymentFormData.cardNumber}
                        onChange={e => setPaymentFormData({ ...paymentFormData, cardNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">Expiry</label>
                      <input
                        type="text" required maxLength={5}
                        className="input-field bg-white/5 border-white/10"
                        placeholder="MM/YY"
                        value={paymentFormData.expiry}
                        onChange={e => setPaymentFormData({ ...paymentFormData, expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5 ml-1">CVC</label>
                      <input
                        type="password" required maxLength={4}
                        className="input-field bg-white/5 border-white/10"
                        placeholder="***"
                        value={paymentFormData.cvc}
                        onChange={e => setPaymentFormData({ ...paymentFormData, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4"
                >
                  {paymentProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Pay ${selectedBundleForPayment.price.toFixed(2)}</>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> SECURE ENCRYPTED TRANSACTION
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* AI Connection Insights - Only visible if unlocked */}
      {activeFeatures.includes('ai_insights') && (
        <div className="glass-card p-6 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Connection Report</h2>
                <p className="text-xs text-slate-500">Real-time performance analysis</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300">
              OPTIMIZED
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Signal Quality</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Excellent</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider">Latency (Ping)</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">12ms</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-white mb-2">AI Recommendation</h3>
                <p className="text-xs text-purple-200/70 leading-relaxed mb-4">
                  Your connection is performing in the top 5% of your neighborhood. Based on your usage patterns, your peak activity is between 8 PM and 11 PM. Your Turbo Speed Boost is currently maintaining a stable 1Gbps throughput.
                </p>
                <button className="text-[10px] font-bold text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                  DOWNLOAD FULL ANALYSIS <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-purple-500/10 rotate-12" />
            </div>
          </div>
        </div>
      )}

      {/* Data Marketplace */}
      {marketplaceItems.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Data Marketplace</h2>
              <p className="text-xs text-slate-500">Use your data quota to unlock premium features</p>
            </div>
          </div>

          {/* Success / Error Banners */}
          {successItem && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-sm text-emerald-300">Successfully unlocked! Your data balance has been updated.</p>
            </div>
          )}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {marketplaceItems.map((item) => {
              const Icon = (item.id && MARKETPLACE_ICONS.hasOwnProperty(item.id)) ? MARKETPLACE_ICONS[item.id] : Sparkles
              const colors = (item.id && MARKETPLACE_COLORS.hasOwnProperty(item.id)) ? MARKETPLACE_COLORS[item.id] : MARKETPLACE_COLORS.ai_insights
              const canAfford = dataRemainingGb >= item.dataCostGb
              const isPurchasing = purchasing === item.id
              const justBought = successItem === item.id

              return (
                <div
                  key={item.id}
                  className={`relative p-5 rounded-xl border transition-all ${colors.bg} ${colors.border} ${justBought ? 'ring-2 ring-emerald-500/40' : ''}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-sm font-bold text-white">{item.dataCostGb} GB</span>
                      <span className="text-[10px] text-slate-500">required</span>
                    </div>

                    <button
                      onClick={() => handlePurchase(item.id)}
                      disabled={!canAfford || isPurchasing || !!successItem || activeFeatures.includes(item.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeFeatures.includes(item.id)
                          ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                          : canAfford
                            ? 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 active:scale-95'
                            : 'bg-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                    >
                      {isPurchasing ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</>
                      ) : activeFeatures.includes(item.id) ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Active</>
                      ) : canAfford ? (
                        'Unlock Now'
                      ) : (
                        'Not Enough Data'
                      )}
                    </button>
                  </div>

                  {!canAfford && !isPurchasing && !justBought && !activeFeatures.includes(item.id) && (
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-red-400/70">You need {(item.dataCostGb - dataRemainingGb).toFixed(1)} GB more data</p>
                      <button
                        onClick={() => document.getElementById('recharge-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <BatteryCharging className="w-2.5 h-2.5" /> Recharge Now
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">My Subscription</h2>
          {data.activeSubscription ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{data.activeSubscription.plan.name}</p>
                  <p className="text-xs text-slate-400">
                    {activeFeatures.includes('speed_boost') ? (
                      <span className="flex items-center gap-1 text-cyan-400 font-medium">
                        <Rocket className="w-3 h-3" /> 1 Gbps Turbo
                      </span>
                    ) : (
                      `${data.activeSubscription.plan.speed} Speed`
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">${data.activeSubscription.plan.price}</p>
                  <p className="text-[10px] text-slate-500">per month</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="text-emerald-400 font-medium">{data.activeSubscription.status}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Next Renewal</span>
                  <span className="text-white">{new Date(data.activeSubscription.endDate).toLocaleDateString()}</span>
                </div>
                {activeFeatures.includes('extra_device') && (
                  <div className="flex justify-between text-xs pt-2 border-t border-white/5 mt-2">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> Bonus Slot Active
                    </span>
                    <span className="text-white">+1 Device</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No active subscription</p>
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Support Tickets</h2>
          <div className="space-y-3">
            {data.recentTickets?.length > 0 ? data.recentTickets.map((ticket: any) => (
              <div key={ticket.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{ticket.subject}</p>
                  <p className="text-[10px] text-slate-500">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                  ticket.status === 'CLOSED' ? 'bg-slate-500/20 text-slate-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                  {ticket.status}
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent tickets</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DataOfferModal({ onClose }: { onClose: () => void }) {
  const [bundles, setBundles] = useState<DataBundle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/data-bundles/offers')
      .then(res => res.json())
      .then(data => {
        setBundles(data)
        setLoading(false)
      })
  }, [])

  const handleUpdateOffer = async (bundleId: string, offerPrice: string) => {
    setSaving(bundleId)
    try {
      const res = await fetch('/api/data-bundles/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId,
          offerPrice: offerPrice === '' ? null : parseFloat(offerPrice)
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setBundles(prev => prev.map(b => b.id === bundleId ? result.bundle : b))
      }
    } catch (error) {
      console.error('Failed to update offer:', error)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl overflow-hidden shadow-2xl border-white/10">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-400" /> Data Bundle Offers
            </h2>
            <p className="text-sm text-slate-400 mt-1">Set promotional prices for data recharge packages</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{bundle.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                        {bundle.dataGb} GB
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{bundle.description}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Regular Price</p>
                      <p className="text-sm font-bold text-white">${bundle.price.toFixed(2)}</p>
                    </div>

                    <div className="w-32">
                      <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Offer Price</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="None"
                          className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 pl-6 pr-3 text-sm text-white focus:outline-none focus:border-blue-500/50"
                          defaultValue={bundle.offerPrice || ''}
                          onBlur={(e) => {
                            if (parseFloat(e.target.value) !== bundle.offerPrice) {
                              handleUpdateOffer(bundle.id, e.target.value)
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-8 flex items-center justify-center">
                      {saving === bundle.id && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-500/5 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

