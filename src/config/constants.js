// Ghost Rider Apex Operations - Configuration Constants

export const SITE_CONFIG = {
  name: 'Ghost Rider Apex Operations',
  domain: 'ghostapexops.com',
  url: 'https://ghostapexops.com',
  description: 'Professional DOT compliance and trucking operations management',
  tagline: 'Your Virtual Wingman on the Road',
  
  // Contact Information
  contact: {
    email: 'support@ghostapexops.com',
    phone: '+1 (555) 123-4567',
    address: 'Professional Trucking Services',
  },
  
  // Admin Configuration
  admin: {
    email: 'britneymstovall@gmail.com',
    name: 'Britney Stovall',
  },
  
  // Service Tiers
  tiers: {
    wingman: {
      name: 'The Wingman',
      price: 150,
      description: 'Essential ELD compliance monitoring',
      features: ['Weekly ELD log reviews', 'Violation alerts', 'Monthly reports', 'Email support']
    },
    guardian: {
      name: 'The Guardian',
      price: 275,
      description: 'Comprehensive compliance management',
      features: ['Everything in Wingman', 'IFTA filing', 'Driver file management', 'Medical card tracking']
    },
    apex_command: {
      name: 'Apex Command',
      price: 450,
      description: 'Complete compliance solution',
      features: ['Everything in Guardian', 'CSA score monitoring', 'DataQ disputes', 'DOT audit prep']
    },
    virtual_dispatcher: {
      name: 'Virtual Dispatcher',
      price: 'Custom',
      description: 'Full dispatch operations',
      features: ['Load scheduling', 'Broker packets', 'Revenue reports', 'Lane optimization']
    },
    ala_carte: {
      name: 'A La Carte',
      price: 'Variable',
      description: 'Pick specific services',
      features: ['Custom service selection', 'Flexible pricing', 'Scalable solutions']
    },
    eld_monitoring_only: {
      name: 'ELD Monitoring Only',
      price: 75,
      description: 'Basic ELD compliance',
      features: ['Monthly ELD reports', 'Basic alerts', 'Email support']
    },
    back_office_command: {
      name: 'Back Office Command',
      price: 'Custom',
      description: 'Complete back-office management',
      features: ['All compliance services', 'Invoice management', 'Payroll integration', 'Permit management']
    },
    dot_readiness_audit: {
      name: 'DOT Readiness Audit',
      price: 'One-time',
      description: 'Comprehensive audit preparation',
      features: ['Full compliance review', 'Gap analysis', 'Action plan', 'Audit support']
    }
  }
}

export const ROUTES = {
  // Public routes
  HOME: '/',
  SERVICES: '/services',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  
  // Client portal routes
  CLIENT_DASHBOARD: '/portal',
  CLIENT_ELD_REPORTS: '/portal/eld-reports',
  CLIENT_IFTA: '/portal/ifta',
  CLIENT_CSA_SCORES: '/portal/csa-scores',
  CLIENT_DATAQ: '/portal/dataq',
  CLIENT_DRIVER_FILES: '/portal/driver-files',
  CLIENT_SUPPORT: '/portal/support',
  CLIENT_FILES: '/portal/files',
  CLIENT_SETTINGS: '/portal/settings',
  
  // Admin portal routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SUPPORT: '/admin/support',
  ADMIN_FILES: '/admin/files',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
}

export const API_ENDPOINTS = {
  // Supabase configuration will be loaded from environment variables
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

export const THEME = {
  colors: {
    primary: {
      teal: '#14b8a6',
      purple: '#a855f7',
      pink: '#ec4899',
    },
    cyberpunk: {
      neon: '#00ffff',
      glow: '#ff00ff',
      accent: '#ff0080',
    }
  },
  fonts: {
    title: 'Black Ops One',
    subtitle: 'Sirin Stencil',
    body: 'Big Shoulders Stencil',
    heading: 'Allerta Stencil',
  }
}