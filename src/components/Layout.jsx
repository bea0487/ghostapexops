import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, Mail } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", page: "Home", path: "/" },
    { name: "Services", page: "Services", path: "/Services" },
    { name: "The Wingman", page: "TheWingman", path: "/TheWingman" },
    { name: "The Guardian", page: "TheGuardian", path: "/TheGuardian" },
    { name: "Apex Command", page: "ApexCommand", path: "/ApexCommand" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-['Rajdhani',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        .font-orbitron {
          font-family: 'Orbitron', sans-serif;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #00FFFF 0%, #FF00FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-cyan {
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(0, 255, 255, 0.1);
        }
        
        .glow-magenta {
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.3), 0 0 40px rgba(255, 0, 255, 0.1);
        }
        
        .glow-text-cyan {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3);
        }
        
        .border-glow-cyan {
          border-color: #00FFFF;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05);
        }
        
        .border-glow-magenta {
          border-color: #FF00FF;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.2), inset 0 0 15px rgba(255, 0, 255, 0.05);
        }
        
        .btn-glow {
          transition: all 0.3s ease;
        }
        
        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3);
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .bg-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="font-orbitron text-xl sm:text-2xl font-bold text-gradient">
                GHOST RIDER
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={link.path}
                  className={`text-sm font-medium tracking-wider transition-all duration-300 hover:text-cyan-400 ${
                    currentPageName === link.page ? "text-cyan-400 glow-text-cyan" : "text-gray-300"
                  }`}
                >
                  {link.name.toUpperCase()}
                </Link>
              ))}
              <Link
                to="/portal/login"
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-cyan-400"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-cyan-500/20">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block text-lg font-medium tracking-wider ${
                    currentPageName === link.page ? "text-cyan-400" : "text-gray-300"
                  }`}
                >
                  {link.name.toUpperCase()}
                </Link>
              ))}
              <Link
                to="/portal/login"
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
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#050508] border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="font-orbitron text-2xl font-bold text-gradient mb-4">
                GHOST RIDER
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your Wingman on the Road. Professional DOT compliance consulting for owner-operators and small fleets.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-orbitron text-cyan-400 text-sm font-semibold mb-4 tracking-wider">
                CONTACT
              </h4>
              <div className="space-y-3">
                <a href="mailto:ghostrider.apexops@zohomail.com" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  <Mail size={16} className="text-cyan-500" />
                  ghostrider.apexops@zohomail.com
                </a>
                <a href="tel:5515742992" className="flex items-center gap-3 text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  <Phone size={16} className="text-cyan-500" />
                  (551) 574-2992
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-orbitron text-cyan-400 text-sm font-semibold mb-4 tracking-wider">
                LEGAL
              </h4>
              <div className="space-y-2">
                <Link to="/PrivacyPolicy" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link to="/TermsOfService" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Terms of Service
                </Link>
                <Link to="/Disclaimer" className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-500/10 mt-10 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 Ghost Rider: Apex Operations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
