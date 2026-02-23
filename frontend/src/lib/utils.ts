import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { th } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return format(d, 'dd MMM yyyy HH:mm', { locale: th })
  } catch {
    return 'Invalid date'
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: th })
  } catch {
    return 'Unknown'
  }
}

export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (!secret || secret.length <= visibleChars) return secret
  return '•'.repeat(secret.length - visibleChars) + secret.slice(-visibleChars)
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validateChatId(chatId: string): boolean {
  return /^-?\d+$/.test(chatId)
}

export function getStatusColor(
  status: 'running' | 'stopped' | 'error' | 'success'
): string {
  const colors = {
    running: 'text-cyan-400',
    stopped: 'text-muted-foreground',
    error: 'text-destructive',
    success: 'text-accent',
  }
  return colors[status] || colors.stopped
}

export function getLogLevelColor(level: string): string {
  const colors = {
    DEBUG: 'text-muted-foreground',
    INFO: 'text-cyan-400',
    WARNING: 'text-amber-400',
    ERROR: 'text-destructive',
  }
  return colors[level as keyof typeof colors] || colors.INFO
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}
