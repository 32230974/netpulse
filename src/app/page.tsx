'use client'

import Link from 'next/link'
import { 
  Wifi, Shield, BarChart3, Brain, MessageSquare, 
  Zap, Users, CreditCard, ArrowRight, Star,
  Globe, Cpu, ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen animated-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300"
           style={{ 
             background: scrollY > 50 ? 'rgba(10, 14, 26, 0.9)' : 'transparent',
             backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
             borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.05)' : 'none'
           }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Net<span className="gradient-text">Pulse</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#ai" className="text-sm text-slate-400 hover:text-white transition-colors">AI Intelligence</a>
            <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm py-2 px-4">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">AI-Powered ISP Management</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Internet Service<br />
            <span className="gradient-text">Management System</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Streamline your ISP operations with AI-driven customer management, 
            automated billing, intelligent support, and predictive analytics — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary text-base py-3 px-8">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base py-3 px-8">
              <Globe className="w-5 h-5" /> View Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: '10K+', label: 'Active Customers' },
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '50%', label: 'Less Churn' },
              { value: '24/7', label: 'AI Support' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4">
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Core Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="gradient-text">Run Your ISP</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From customer onboarding to billing automation — manage your entire operation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Customer Management', desc: 'Complete customer lifecycle management with profiles, status tracking, and history.', color: 'blue' },
              { icon: CreditCard, title: 'Subscription System', desc: 'Flexible plans, auto-renewal, expiry tracking, and seamless plan upgrades.', color: 'purple' },
              { icon: BarChart3, title: 'Billing & Revenue', desc: 'Automated invoicing, payment tracking, and real-time revenue dashboards.', color: 'emerald' },
              { icon: MessageSquare, title: 'Support Tickets', desc: 'Streamlined ticket system with status tracking and team assignment.', color: 'amber' },
              { icon: Shield, title: 'Role-Based Access', desc: 'Granular permissions for admins, employees, and customers.', color: 'red' },
              { icon: Brain, title: 'AI Intelligence', desc: 'Predictive analytics, smart chatbot, and automated insights.', color: 'cyan' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 group cursor-default">
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">AI Intelligence</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Powered by <span className="gradient-text">Artificial Intelligence</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Our AI engine analyzes your data to predict churn, suggest actions, and automate support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: MessageSquare, title: 'AI Chatbot', desc: 'Intelligent customer support assistant that answers billing questions, checks subscription status, and troubleshoots issues 24/7.', gradient: 'from-blue-500/20 to-purple-500/20' },
              { icon: BarChart3, title: 'Churn Prediction', desc: 'ML-powered risk scoring (0-100) analyzing payment patterns, complaint history, and inactivity to identify at-risk customers.', gradient: 'from-red-500/20 to-amber-500/20' },
              { icon: Star, title: 'Business Insights', desc: 'Auto-generated reports on profitable plans, revenue predictions, customer trends, and actionable improvement suggestions.', gradient: 'from-emerald-500/20 to-cyan-500/20' },
              { icon: Zap, title: 'Auto-Suggestions', desc: 'When employees open tickets, AI suggests response templates and step-by-step solutions based on similar resolved issues.', gradient: 'from-amber-500/20 to-orange-500/20' },
            ].map((item, i) => (
              <div key={i} className={`glass-card p-8 bg-gradient-to-br ${item.gradient}`}>
                <item.icon className="w-8 h-8 text-white mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Internet <span className="gradient-text">Plans</span>
            </h2>
            <p className="text-slate-400">Choose the perfect plan for your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Basic', price: 29, speed: '50 Mbps', features: ['50 Mbps Download', '10 Mbps Upload', 'Email Support', '500GB Data Cap'] },
              { name: 'Standard', price: 49, speed: '100 Mbps', features: ['100 Mbps Download', '25 Mbps Upload', 'Priority Support', 'Unlimited Data'], popular: true },
              { name: 'Premium', price: 99, speed: '500 Mbps', features: ['500 Mbps Download', '100 Mbps Upload', '24/7 Dedicated Support', 'Unlimited Data', 'Static IP', 'Business SLA'] },
            ].map((plan, i) => (
              <div key={i} className={`glass-card p-6 relative ${plan.popular ? 'border-blue-500/30 scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 gradient-bg rounded-full text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{plan.speed}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${plan.price}</span>
                  <span className="text-slate-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">NetPulse</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 NetPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
