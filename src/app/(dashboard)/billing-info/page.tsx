'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CreditCard, Building2, DollarSign, Edit2, Save, X, Check, AlertCircle } from 'lucide-react'

interface BillingInfo {
  id: string
  customerId: string
  billingAddress: string
  billingCity: string
  billingState: string
  billingZipCode: string
  billingCountry: string
  paymentMethod: string
  cardHolderName?: string
  cardLastFour?: string
  cardExpiry?: string
  bankAccountHolderName?: string
  bankAccountLastFour?: string
  bankRoutingNumber?: string
  taxId?: string
  businessName?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  customer?: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

export default function BillingPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'CUSTOMER'
  
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States',
    paymentMethod: 'card',
    cardHolderName: '',
    cardLastFour: '',
    cardExpiry: '',
    bankAccountHolderName: '',
    bankAccountLastFour: '',
    bankRoutingNumber: '',
    taxId: '',
    businessName: '',
  })

  useEffect(() => {
    fetchBillingInfo()
  }, [session])

  const fetchBillingInfo = async () => {
    try {
      const res = await fetch('/api/billing')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const info = data[0] as BillingInfo
          setBillingInfo(info)
          setFormData({
            billingAddress: info.billingAddress || '',
            billingCity: info.billingCity || '',
            billingState: info.billingState || '',
            billingZipCode: info.billingZipCode || '',
            billingCountry: info.billingCountry || 'United States',
            paymentMethod: info.paymentMethod || 'card',
            cardHolderName: info.cardHolderName || '',
            cardLastFour: info.cardLastFour || '',
            cardExpiry: info.cardExpiry || '',
            bankAccountHolderName: info.bankAccountHolderName || '',
            bankAccountLastFour: info.bankAccountLastFour || '',
            bankRoutingNumber: info.bankRoutingNumber || '',
            taxId: info.taxId || '',
            businessName: info.businessName || '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing info:', error)
      setErrorMessage('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setBillingInfo(data)
        setEditing(false)
        setSuccessMessage('Billing information saved successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setErrorMessage('Failed to save billing information')
      }
    } catch (error) {
      console.error('Failed to save billing info:', error)
      setErrorMessage('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const createEmptyBillingInfo = (): BillingInfo => ({
    id: '',
    customerId: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States',
    paymentMethod: 'card',
    cardHolderName: '',
    cardLastFour: '',
    cardExpiry: '',
    bankAccountHolderName: '',
    bankAccountLastFour: '',
    bankRoutingNumber: '',
    taxId: '',
    businessName: '',
    isDefault: true,
    createdAt: '',
    updatedAt: '',
  })

  const handleCancel = () => {
    setEditing(false)
    if (billingInfo) {
      setFormData({
        billingAddress: billingInfo.billingAddress || '',
        billingCity: billingInfo.billingCity || '',
        billingState: billingInfo.billingState || '',
        billingZipCode: billingInfo.billingZipCode || '',
        billingCountry: billingInfo.billingCountry || 'United States',
        paymentMethod: billingInfo.paymentMethod || 'card',
        cardHolderName: billingInfo.cardHolderName || '',
        cardLastFour: billingInfo.cardLastFour || '',
        cardExpiry: billingInfo.cardExpiry || '',
        bankAccountHolderName: billingInfo.bankAccountHolderName || '',
        bankAccountLastFour: billingInfo.bankAccountLastFour || '',
        bankRoutingNumber: billingInfo.bankRoutingNumber || '',
        taxId: billingInfo.taxId || '',
        businessName: billingInfo.businessName || '',
      })
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing Information</h1>
          <p className="text-sm text-slate-400 mt-1">
            {userRole === 'CUSTOMER' ? 'Manage your billing and payment details' : 'View customer billing information'}
          </p>
        </div>
        {userRole === 'CUSTOMER' && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit Information
          </button>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}

      {!billingInfo ? (
        <div className="glass-card p-12 text-center">
          <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-6">No billing information on file</p>
          {userRole === 'CUSTOMER' && (
            <button
              onClick={() => {
                const empty = createEmptyBillingInfo()
                setBillingInfo(empty)
                setFormData({
                  billingAddress: empty.billingAddress || '',
                  billingCity: empty.billingCity || '',
                  billingState: empty.billingState || '',
                  billingZipCode: empty.billingZipCode || '',
                  billingCountry: empty.billingCountry || 'United States',
                  paymentMethod: empty.paymentMethod || 'card',
                  cardHolderName: empty.cardHolderName || '',
                  cardLastFour: empty.cardLastFour || '',
                  cardExpiry: empty.cardExpiry || '',
                  bankAccountHolderName: empty.bankAccountHolderName || '',
                  bankAccountLastFour: empty.bankAccountLastFour || '',
                  bankRoutingNumber: empty.bankRoutingNumber || '',
                  taxId: empty.taxId || '',
                  businessName: empty.businessName || '',
                })
                setEditing(true)
              }}
              className="btn-primary"
            >
              Add Billing Information
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Billing Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Address */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Billing Address</h2>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Street Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Main Street"
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        required
                        placeholder="Austin"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">State</label>
                      <input
                        type="text"
                        name="billingState"
                        value={formData.billingState}
                        onChange={handleInputChange}
                        required
                        placeholder="Texas"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Zip Code</label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        required
                        placeholder="73301"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                      <input
                        type="text"
                        name="billingCountry"
                        value={formData.billingCountry}
                        onChange={handleInputChange}
                        placeholder="United States"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-md font-semibold text-white mb-4">Payment Method</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Payment Type</label>
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="card">Credit/Debit Card</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                      </select>
                    </div>

                    {formData.paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Cardholder Name</label>
                          <input
                            type="text"
                            name="cardHolderName"
                            value={formData.cardHolderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="input-field"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Last 4 Digits</label>
                            <input
                              type="text"
                              name="cardLastFour"
                              value={formData.cardLastFour}
                              onChange={handleInputChange}
                              placeholder="1234"
                              maxLength={4}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleInputChange}
                              placeholder="12/25"
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.paymentMethod === 'bank_transfer' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Account Holder Name</label>
                          <input
                            type="text"
                            name="bankAccountHolderName"
                            value={formData.bankAccountHolderName}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="input-field"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Last 4 Digits</label>
                            <input
                              type="text"
                              name="bankAccountLastFour"
                              value={formData.bankAccountLastFour}
                              onChange={handleInputChange}
                              placeholder="1234"
                              maxLength={4}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Routing Number</label>
                            <input
                              type="text"
                              name="bankRoutingNumber"
                              value={formData.bankRoutingNumber}
                              onChange={handleInputChange}
                              placeholder="123456789"
                              className="input-field"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tax Information */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-md font-semibold text-white mb-4">Tax Information (Optional)</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Business Name</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Your Business Name"
                        className="input-field"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax ID / EIN</label>
                      <input
                        type="text"
                        name="taxId"
                        value={formData.taxId}
                        onChange={handleInputChange}
                        placeholder="00-0000000"
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-6 pt-6 border-t border-white/10 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {billingInfo?.id ? 'Save Changes' : 'Save Information'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-white">
                    {formData.billingAddress}<br />
                    {formData.billingCity}, {formData.billingState} {formData.billingZipCode}<br />
                    {formData.billingCountry}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Summary */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Payment Method</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p className="text-white font-medium capitalize">
                    {formData.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : formData.paymentMethod === 'card' ? 'Credit Card' : 'Check'}
                  </p>
                </div>

                {formData.paymentMethod === 'card' && formData.cardLastFour && (
                  <>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Card</p>
                      <p className="text-white font-medium">•••• {formData.cardLastFour}</p>
                    </div>
                    {formData.cardExpiry && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Expires</p>
                        <p className="text-white font-medium">{formData.cardExpiry}</p>
                      </div>
                    )}
                  </>
                )}

                {formData.paymentMethod === 'bank_transfer' && formData.bankAccountLastFour && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Account</p>
                    <p className="text-white font-medium">•••• {formData.bankAccountLastFour}</p>
                  </div>
                )}

                {formData.businessName && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Business</p>
                    <p className="text-white font-medium">{formData.businessName}</p>
                  </div>
                )}
              </div>
            </div>

            {billingInfo?.id && (
              <div className="glass-card p-6">
                <p className="text-xs text-slate-500 mb-2">Last Updated</p>
                <p className="text-sm text-slate-400">
                  {new Date(billingInfo.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
