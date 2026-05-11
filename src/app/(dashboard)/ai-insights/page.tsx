'use client'

import { useState, useEffect } from 'react'
import {
  Brain, Sparkles, TrendingUp, AlertTriangle,
  Users, DollarSign, Target, Loader2,
  BarChart3, Bell
} from 'lucide-react'
import {
  Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { getRiskColor, getRiskBgColor } from '@/lib/utils'

interface Insight {
  id: string
  type: string
  title: string
  content: string
  createdAt: string
}

interface RiskCustomer {
  id: string
  firstName: string
  lastName: string
  score: number
  level: string
  factors: string[]
}



export default function AIInsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [riskCustomers, setRiskCustomers] = useState<RiskCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingChurn, setGeneratingChurn] = useState(false)
  const [runningReminders, setRunningReminders] = useState(false)
  const [sendingUsage50, setSendingUsage50] = useState(false)
  const [sendingUsage100, setSendingUsage100] = useState(false)

  const fetchData = async () => {
    try {
      const [insightsRes, churnRes] = await Promise.all([
        fetch('/api/ai/insights'),
        fetch('/api/ai/churn'),
      ])
      if (insightsRes.ok) {
        const data = await insightsRes.json()
        setInsights(data.insights || [])
      }
      if (churnRes.ok) {
        const data = await churnRes.json()
        setRiskCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const generateInsights = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/insights', { method: 'POST' })
      if (res.ok) {
        await fetchData()
        // Assuming there's a toast function available, if not we'll use a simple alert or just rely on the UI update
        // Let's check if there's a toast utility
      }
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setGenerating(false)
    }
  }

  const runChurnAnalysis = async () => {
    setGeneratingChurn(true)
    try {
      const res = await fetch('/api/ai/churn', { method: 'POST' })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to run churn analysis:', error)
    } finally {
      setGeneratingChurn(false)
    }
  }

  const runReminders = async () => {
    setRunningReminders(true)
    try {
      const res = await fetch('/api/notifications/renewal', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`Successfully sent ${data.sent} renewal notifications!`)
      }
    } catch (error) {
      console.error('Failed to run reminders:', error)
    } finally {
      setRunningReminders(false)
    }
  }

  const runUsageAlerts = async (threshold: 50 | 100) => {
    if (threshold === 50) setSendingUsage50(true)
    else setSendingUsage100(true)

    try {
      const res = await fetch('/api/notifications/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(`Successfully sent ${data.sent} ${threshold}% data usage notifications!`)
      }
    } catch (error) {
      console.error('Failed to send usage alerts:', error)
    } finally {
      if (threshold === 50) setSendingUsage50(false)
      else setSendingUsage100(false)
    }
  }

  const riskDistribution = [
    { name: 'Low Risk', value: riskCustomers.filter(c => c.level === 'LOW').length, color: '#10b981' },
    { name: 'Medium Risk', value: riskCustomers.filter(c => c.level === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'High Risk', value: riskCustomers.filter(c => c.level === 'HIGH').length, color: '#ef4444' },
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'revenue': return DollarSign
      case 'churn': return AlertTriangle
      case 'growth': return TrendingUp
      case 'recommendation': return Target
      default: return Sparkles
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
      case 'churn': return 'text-red-400 bg-red-500/10 border-red-500/15'
      case 'growth': return 'text-blue-400 bg-blue-500/10 border-blue-500/15'
      case 'recommendation': return 'text-purple-400 bg-purple-500/10 border-purple-500/15'
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/15'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-7 h-7 text-purple-400" />
            AI Insights
          </h1>
          <p className="text-sm text-slate-400 mt-1">AI-powered business intelligence and predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => runUsageAlerts(50)}
            disabled={sendingUsage50}
            className="btn-secondary"
          >
            {sendingUsage50 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Send 50% Alerts
          </button>
          <button
            onClick={() => runUsageAlerts(100)}
            disabled={sendingUsage100}
            className="btn-secondary"
          >
            {sendingUsage100 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Send 100% Alerts
          </button>
          <button
            onClick={runChurnAnalysis}
            disabled={generatingChurn}
            className="btn-secondary"
          >
            {generatingChurn ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Analyze Churn
          </button>
          <button
            onClick={generateInsights}
            disabled={generating}
            className="btn-primary"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Insights
          </button>
          <button
            onClick={runReminders}
            disabled={runningReminders}
            className="btn-secondary"
            title="Send renewal notifications"
          >
            {runningReminders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Send Renewal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Analyzing your data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card bg-gradient-to-br from-red-500/15 to-red-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">
                    {riskCustomers.filter(c => c.level === 'HIGH').length}
                  </p>
                  <p className="text-xs text-slate-500">High Risk Customers</p>
                </div>
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-amber-500/15 to-amber-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">
                    {riskCustomers.filter(c => c.level === 'MEDIUM').length}
                  </p>
                  <p className="text-xs text-slate-500">Medium Risk Customers</p>
                </div>
              </div>
            </div>
            <div className="stat-card bg-gradient-to-br from-emerald-500/15 to-emerald-600/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{insights.length}</p>
                  <p className="text-xs text-slate-500">AI Generated Insights</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Churn Risk Distribution Chart */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Churn Risk Distribution</h2>
              {riskCustomers.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={riskDistribution.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#1a1f2e',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-2">
                    {riskDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Run churn analysis to see distribution</p>
                </div>
              )}
            </div>

            {/* High Risk Customers */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">At-Risk Customers</h2>
              {riskCustomers.filter(c => c.level !== 'LOW').length > 0 ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {riskCustomers
                    .filter(c => c.level !== 'LOW')
                    .sort((a, b) => b.score - a.score)
                    .map((customer) => (
                      <div key={customer.id} className={`p-3 rounded-xl border ${getRiskBgColor(customer.level)}`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-white">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <span className={`text-sm font-bold ${getRiskColor(customer.level)}`}>
                            {customer.score}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(customer.factors) ? customer.factors : (customer.factors as string || '').split(',').filter(Boolean)).map((factor, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                              {factor.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No at-risk customers detected</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Insights Grid */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Business Insights</h2>
            {insights.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type)
                  return (
                    <div key={insight.id} className={`glass-card p-5 border ${getInsightColor(insight.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-1">{insight.title}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{insight.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No insights generated yet</p>
                <p className="text-sm text-slate-500 mt-1">Click &ldquo;Generate Insights&rdquo; to get AI-powered business intelligence</p>
                <button onClick={generateInsights} disabled={generating} className="btn-primary mt-4">
                  <Sparkles className="w-4 h-4" /> Generate Now
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
