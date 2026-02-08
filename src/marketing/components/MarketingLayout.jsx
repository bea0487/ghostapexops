import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, Mail } from 'lucide-react'

export default function MarketingLayout({ children }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/Services' },
    { name: 'The Wingman', path: '/TheWingman' },
    { name: 'The Guardian', path: '/TheGuardian' },
    { name: 'Apex Command', path: '/ApexCommand' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-rajdhani">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3">
              <div className="font-orbitron text-xl sm:text-2xl font-bold text-gradient">GHOST RIDER</div>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={
                    `text-sm font-medium tracking-wider transition-all duration-300 hover:text-cyan-400 ${
                      location.pathname === link.path ? 'text-cyan-400 glow-text-cyan' : 'text-gray-300'
                    }`
                  }
                >
                  {link.name.toUpperCase()}
                </Link>
              ))}
              <Link
                to="/login"
                className="text-sm font-medium tracking-wider text-fuchsia-400 hover:text-fuchsia-300 transition-all duration-300"
              >
                CLIENT PORTAL
              </Link>
              <a
                href="https://zbooking.us/xmUt9"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold px-6 py-2.5 rounded-lg btn-glow font-orbitron text-sm tracking-wide"
              >
                BOOK NOW
              </a>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-cyan-400"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-cyan-500/20">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    `block text-lg font-medium tracking-wider ${
                      location.pathname === link.path ? 'text-cyan-400' : 'text-gray-300'
                    }`
                  }
                >
                  {link.name.toUpperCase()}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-lg font-medium tracking-wider text-fuchsia-400"
              >
                CLIENT PORTAL
              </Link>
              <a
                href="https://zbooking.us/xmUt9"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold px-6 py-3 rounded-lg font-orbitron text-sm tracking-wide mt-6"
              >
                BOOK NOW
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      <main className="pt-20">{children}</main>

      <footer className="bg-[#050508] border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="font-orbitron text-2xl font-bold text-gradient mb-4">GHOST RIDER</div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your Wingman on the Road. Professional DOT compliance consulting for owner-operators and small fleets.
              </p>
            </div>

            <div>
              <h4 className="font-orbitron text-cyan-400 text-sm font-semibold mb-4 tracking-wider">CONTACT</h4>
              <div className="space-y-3">
                <a
                  href="mailto:ghostrider.apexops@zohomail.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Mail size={16} className="text-cyan-500" />
                  ghostrider.apexops@zohomail.com
                </a>
                <a
                  href="tel:5515742992"
                  className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  <Phone size={16} className="text-cyan-500" />
                  (551) 574-2992
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-orbitron text-cyan-400 text-sm font-semibold mb-4 tracking-wider">LEGAL</h4>
              <div className="space-y-2">
                <a className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm" href="#">
                  Privacy Policy
                </a>
                <a className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm" href="#">
                  Terms of Service
                </a>
                <a className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm" href="#">
                  Disclaimer
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-500/10 mt-10 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2026 Ghost Rider: Apex Operations. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
