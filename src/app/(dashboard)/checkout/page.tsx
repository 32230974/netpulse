'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function CheckoutForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planName = searchParams.get('plan') || 'Basic'
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  })

  // Mock plan details
  const plans: Record<string, { price: number, speed: string }> = {
    'Basic': { price: 29, speed: '50 Mbps' },
    'Standard': { price: 49, speed: '100 Mbps' },
    'Premium': { price: 99, speed: '500 Mbps' }
  }

  const planDetails = plans[planName as keyof typeof plans] || plans['Basic']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        router.push('/subscriptions')
      }, 3000)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="glass-card p-8 text-center space-y-4 border-emerald-500/30 ring-1 ring-emerald-500/50">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
          <p className="text-slate-400">
            You have successfully subscribed to the {planName} plan.
          </p>
          <p className="text-sm text-slate-500 pt-4">
            Redirecting to your subscriptions...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/subscriptions" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Subscriptions
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Checkout</h1>
            <p className="text-sm text-slate-400 mt-1">Enter your payment details below</p>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name on Card</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleInputChange}
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">CVC</label>
                  <input 
                    type="text" 
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    required
                    placeholder="123"
                    maxLength={4}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className="btn-primary w-full flex items-center justify-center py-3 text-base"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay ${planDetails.price}.00
                </>
              )}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4 flex items-center justify-center">
              <Lock className="w-3 h-3 mr-1" /> Payments are secure and encrypted
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Plan</span>
                <span className="font-medium text-white">{planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Speed</span>
                <span className="font-medium text-white">{planDetails.speed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Billing Cycle</span>
                <span className="font-medium text-white">Monthly</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 my-4" />

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">${planDetails.price}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tax</span>
                <span className="text-white">$0.00</span>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 my-4" />

            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-white">Total</span>
              <span className="text-2xl font-bold text-blue-400">${planDetails.price}.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" /></div>}>
      <CheckoutForm />
    </Suspense>
  )
}
