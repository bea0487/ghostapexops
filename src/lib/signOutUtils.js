import { supabase } from './supabaseClient'

// Comprehensive sign out function that clears everything
export async function performCompleteSignOut() {
  try {
    console.log('Starting complete sign out process...')
    
    // Step 1: Clear all local storage
    localStorage.clear()
    sessionStorage.clear()
    console.log('Local storage cleared')
    
    // Step 2: Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('Service worker caches cleared')
    }
    
    // Step 3: Notify service worker to clear its caches
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SIGN_OUT' })
    }
    
    // Step 4: Sign out from Supabase with local scope to avoid affecting other tabs
    await supabase.auth.signOut({ scope: 'local' })
    console.log('Supabase sign out completed')
    
    // Step 5: Small delay to ensure everything is cleared
    await new Promise(resolve => setTimeout(resolve, 200))
    
    console.log('Complete sign out finished successfully')
    return true
    
  } catch (error) {
    console.error('Error during sign out:', error)
    // Even if there's an error, clear what we can
    localStorage.clear()
    sessionStorage.clear()
    return false
  }
}

// Force redirect to login with cache busting
export function redirectToLogin() {
  // Add cache buster to ensure fresh login page
  const loginUrl = `/login?_cb=${Date.now()}`
  
  // Use href instead of replace to ensure complete navigation
  window.location.href = loginUrl
}

// Complete sign out and redirect
export async function signOutAndRedirect() {
  await performCompleteSignOut()
  redirectToLogin()
}