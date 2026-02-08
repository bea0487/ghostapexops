import { clsx } from "clsx"

/**
 * Utility function to merge class names
 * Combines clsx for conditional classes with basic string concatenation
 */
export function cn(...inputs) {
  return clsx(inputs)
}

/**
 * Format currency values
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

/**
 * Format dates consistently
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  
  return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date))
}

/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate random ID for components
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Convert tier names to display format
 */
export function formatTierName(tier) {
  if (!tier) return 'Unknown'
  
  const tierMap = {
    wingman: 'The Wingman',
    guardian: 'The Guardian', 
    apex_command: 'Apex Command',
    virtual_dispatcher: 'Virtual Dispatcher',
    ala_carte: 'A La Carte',
    eld_monitoring_only: 'ELD Monitoring Only',
    back_office_command: 'Back Office Command',
    dot_readiness_audit: 'DOT Readiness Audit'
  }
  
  return tierMap[tier] || capitalize(tier.replace(/_/g, ' '))
}