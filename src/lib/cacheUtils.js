// Cache management utilities

// Force reload the app by clearing all caches
export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    )
  }
  
  // Clear localStorage and sessionStorage
  localStorage.clear()
  sessionStorage.clear()
  
  // Reload the page
  window.location.reload(true)
}

// Check if a new version is available
export async function checkForUpdates() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      registration.update()
    }
  }
}

// Add version info to help with debugging
export function getAppVersion() {
  return {
    buildTime: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
}

// Add cache-busting parameter to URLs
export function addCacheBuster(url) {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}_cb=${Date.now()}`
}