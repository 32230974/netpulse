export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return formatDate(date)
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'LOW':
      return 'text-emerald-400'
    case 'MEDIUM':
      return 'text-amber-400'
    case 'HIGH':
      return 'text-red-400'
    default:
      return 'text-slate-400'
  }
}

export function getRiskBgColor(level: string): string {
  switch (level) {
    case 'LOW':
      return 'bg-emerald-500/10 border-emerald-500/20'
    case 'MEDIUM':
      return 'bg-amber-500/10 border-amber-500/20'
    case 'HIGH':
      return 'bg-red-500/10 border-red-500/20'
    default:
      return 'bg-slate-500/10 border-slate-500/20'
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'INACTIVE':
    case 'EXPIRED':
    case 'CANCELLED':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'PENDING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'PAID':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'UNPAID':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'OVERDUE':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    case 'OPEN':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    case 'IN_PROGRESS':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    case 'CLOSED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}
