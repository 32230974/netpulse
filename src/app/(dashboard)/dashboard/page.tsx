'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Users, CreditCard, DollarSign, MessageSquare,
  TrendingUp, AlertTriangle, Brain,
  ArrowUpRight, ArrowDownRight, Activity, Zap,
  CheckCircle2, Clock, ShieldCheck
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
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'CUSTOMER'
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 580,
    activeSubscriptions: 520,
    monthlyRevenue: 62000,
    openTickets: 23,
    customerGrowth: 12.5,
    revenueGrowth: 8.3,
    churnRate: 3.2,
  })
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (userRole === 'CUSTOMER') {
          const res = await fetch('/api/dashboard/customer-stats')
          if (res.ok) setCustomerData(await res.json())
        } else {
          const res = await fetch('/api/dashboard/stats')
          if (res.ok) setStats(await res.json())
        }
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchData()
  }, [session, userRole])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
    </div>
  )

  if (userRole === 'CUSTOMER') {
    return <CustomerDashboard data={customerData} />
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customerGrowth,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500/20 to-blue-600/5',
      href: '/customers',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      change: 5.2,
      icon: CreditCard,
      color: 'purple',
      gradient: 'from-purple-500/20 to-purple-600/5',
      href: '/subscriptions',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      change: stats.revenueGrowth,
      icon: DollarSign,
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/5',
      href: '/billing',
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets.toString(),
      change: -2.1,
      icon: MessageSquare,
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-600/5',
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
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className={`stat-card block hover:scale-105 transition-transform bg-gradient-to-br ${card.gradient}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/20 flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 text-${card.color}-400`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                card.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {card.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {Math.abs(card.change)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-slate-500">{card.title}</p>
          </Link>
        ))}
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
              <div key={i} className={`p-3 rounded-xl border ${
                insight.type === 'positive' ? 'bg-emerald-500/5 border-emerald-500/10' :
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'customer' ? 'bg-blue-500/10 text-blue-400' :
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
    </div>
  )
}

function CustomerDashboard({ data }: { data: any }) {
  if (!data) return null

  const stats = [
    { label: 'Service Status', value: 'Active', icon: ShieldCheck, color: 'emerald', href: '/dashboard' },
    { label: 'Unpaid Invoices', value: data.unpaidInvoices, icon: CreditCard, color: data.unpaidInvoices > 0 ? 'red' : 'emerald', href: '/billing' },
    { label: 'Support Tickets', value: data.totalTickets, icon: MessageSquare, color: 'blue', href: '/tickets' },
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
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="stat-card block bg-white/5 hover:scale-105 hover:bg-white/10 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">My Subscription</h2>
          {data.activeSubscription ? (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-white">{data.activeSubscription.plan.name}</p>
                  <p className="text-xs text-slate-400">{data.activeSubscription.plan.speed} Speed</p>
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
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  ticket.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
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
