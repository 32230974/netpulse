'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Wifi,
  ArrowRight,
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  description: string
  price: number
  speed: string
  features: string
}

interface Bundle {
  id: string
  name: string
  description: string
  discount: number
  totalPrice: number
  plans: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BundleFormState {
  name: string
  description: string
  discount: string
  totalPrice: string
  isActive: boolean
  planIds: string[]
}

const emptyForm: BundleFormState = {
  name: '',
  description: '',
  discount: '',
  totalPrice: '',
  isActive: true,
  planIds: [],
}

function parseBundlePlans(bundlePlans: string): string[] {
  try {
    const parsed = JSON.parse(bundlePlans)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function OffersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const userRole = session?.user?.role || 'CUSTOMER'
  const isAdmin = userRole === 'ADMIN' || userRole === 'EMPLOYEE'

  const [bundles, setBundles] = useState<Bundle[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState<BundleFormState>(emptyForm)

  const planLookup = useMemo(() => {
    return new Map(plans.map(plan => [plan.id, plan]))
  }, [plans])

  const loadData = async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const [bundlesResponse, plansResponse] = await Promise.all([
        fetch('/api/bundles'),
        fetch('/api/plans'),
      ])

      const bundlesData = bundlesResponse.ok ? await bundlesResponse.json() : []
      const plansData = plansResponse.ok ? await plansResponse.json() : []

      setBundles(Array.isArray(bundlesData) ? bundlesData : [])
      setPlans(Array.isArray(plansData) ? plansData : [])
    } catch (error) {
      console.error('Failed to load offers data:', error)
      setErrorMessage('Failed to load internet offers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingBundleId(null)
  }

  const startEdit = (bundle: Bundle) => {
    setEditingBundleId(bundle.id)
    setForm({
      name: bundle.name,
      description: bundle.description,
      discount: String(bundle.discount),
      totalPrice: String(bundle.totalPrice),
      isActive: bundle.isActive,
      planIds: parseBundlePlans(bundle.plans),
    })
    setSuccessMessage('')
    setErrorMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlanToggle = (planId: string) => {
    setForm(prev => ({
      ...prev,
      planIds: prev.planIds.includes(planId)
        ? prev.planIds.filter(id => id !== planId)
        : [...prev.planIds, planId],
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const payload = {
        ...form,
        discount: Number(form.discount),
        totalPrice: Number(form.totalPrice),
        plans: form.planIds,
      }

      const response = await fetch(editingBundleId ? `/api/bundles/${editingBundleId}` : '/api/bundles', {
        method: editingBundleId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save offer')
      }

      setSuccessMessage(editingBundleId ? 'Offer updated successfully' : 'Offer created successfully')
      resetForm()
      await loadData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save offer:', error)
      setErrorMessage('Failed to save offer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bundleId: string) => {
    if (!window.confirm('Delete this internet offer?')) {
      return
    }

    setDeletingId(bundleId)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const response = await fetch(`/api/bundles/${bundleId}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete offer')
      }

      if (editingBundleId === bundleId) {
        resetForm()
      }

      setSuccessMessage('Offer deleted successfully')
      await loadData()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to delete offer:', error)
      setErrorMessage('Failed to delete offer')
    } finally {
      setDeletingId(null)
    }
  }

  const visibleBundles = isAdmin ? bundles : bundles.filter(bundle => bundle.isActive)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-3">
            <Gift className="w-3.5 h-3.5" />
            Internet Offers
          </div>
          <h1 className="text-2xl font-bold text-white">{isAdmin ? 'Manage Offers' : 'Special Offers'}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {isAdmin
              ? 'Create, edit, and remove internet bundle offers for customers.'
              : 'Choose a bundle offer to save on your internet service.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={resetForm}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Offer
          </button>
        )}
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400" />
          <p className="text-emerald-300">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}

      {isAdmin && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingBundleId ? 'Edit Offer' : 'Create Offer'}
              </h2>
              <p className="text-sm text-slate-400">
                Build a bundle of internet plans and set the discounted price.
              </p>
            </div>
            {editingBundleId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Offer Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  placeholder="Family Fiber Bundle"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.discount}
                  onChange={(e) => setForm(prev => ({ ...prev, discount: e.target.value }))}
                  className="input-field"
                  placeholder="15"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bundle Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalPrice}
                  onChange={(e) => setForm(prev => ({ ...prev, totalPrice: e.target.value }))}
                  className="input-field"
                  placeholder="109.99"
                  required
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-500 bg-slate-800"
                  />
                  Active offer
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-field min-h-28 resize-y"
                placeholder="Describe what this offer includes and why it is valuable."
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-slate-300">Included Plans</label>
                <p className="text-xs text-slate-500">Select the internet plans that belong in this bundle.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {plans.map(plan => {
                  const checked = form.planIds.includes(plan.id)
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanToggle(plan.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${checked
                        ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/40'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-white">{plan.name}</h3>
                          <p className="text-xs text-slate-400 mt-1">{plan.speed}</p>
                        </div>
                        <span className="text-sm font-semibold text-white">${plan.price}/mo</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-3 line-clamp-2">{plan.description}</p>
                      <div className="mt-3 text-xs font-medium text-blue-300">
                        {checked ? 'Included' : 'Click to include'}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingBundleId ? 'Update Offer' : 'Create Offer'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={isAdmin ? 'xl:col-span-2 space-y-4' : 'xl:col-span-3 space-y-4'}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {isAdmin ? 'All Bundle Offers' : 'Available Bundle Offers'}
            </h2>
            <p className="text-sm text-slate-400">{visibleBundles.length} offer{visibleBundles.length === 1 ? '' : 's'}</p>
          </div>

          {loading ? (
            <div className="glass-card p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          ) : visibleBundles.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Wifi className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No internet offers available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleBundles.map(bundle => {
                const planIds = parseBundlePlans(bundle.plans)
                const bundlePlans = planIds
                  .map(planId => planLookup.get(planId))
                  .filter((plan): plan is Plan => Boolean(plan))

                return (
                  <div key={bundle.id} className={`glass-card p-6 border transition-all ${bundle.isActive ? 'border-white/10' : 'border-white/5 opacity-70'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5 text-blue-400" />
                          <h3 className="text-lg font-semibold text-white">{bundle.name}</h3>
                        </div>
                        <p className="text-sm text-slate-400">{bundle.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">${Number(bundle.totalPrice).toFixed(2)}</div>
                        <div className="text-xs text-emerald-400 font-medium">Save {bundle.discount}%</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {bundle.isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/15 text-slate-300 border border-slate-500/20">
                          Hidden
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/20">
                        {bundlePlans.length} plan{bundlePlans.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {bundlePlans.length > 0 ? (
                        bundlePlans.map(plan => (
                          <div key={plan.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                            <div>
                              <p className="text-white font-medium">{plan.name}</p>
                              <p className="text-xs text-slate-500">{plan.speed}</p>
                            </div>
                            <p className="text-slate-300">${plan.price}/mo</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">No plans assigned to this offer yet.</p>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/checkout?bundle=${bundle.id}`)}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        Choose Offer
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(bundle)}
                            className="px-4 py-2.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition inline-flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(bundle.id)}
                            disabled={deletingId === bundle.id}
                            className="px-4 py-2.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition inline-flex items-center gap-2 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deletingId === bundle.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <ToggleRight className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Offer Status</h2>
              </div>
              <p className="text-sm text-slate-400">
                Toggle an offer active or hidden from customer browsing. Hidden offers stay in the admin list.
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Customer View</h2>
              </div>
              <p className="text-sm text-slate-400">
                Customers can browse these internet bundles and jump straight to checkout with the selected offer.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
