'use client'

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Shield, FileCheck, Clock, ChevronRight, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-wider">
                <span className="text-cyan-400">GHOST</span>{' '}
                <span className="text-fuchsia-400">RIDER</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link href="/" className="text-xs font-medium tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors uppercase">
                HOME
              </Link>
              <Link href="/Services" className="text-xs font-medium tracking-widest text-gray-400 hover:text-cyan-400 transition-colors uppercase">
                SERVICES
              </Link>
              <Link href="/TheWingman" className="text-xs font-medium tracking-widest text-gray-400 hover:text-cyan-400 transition-colors uppercase">
                THE WINGMAN
              </Link>
              <Link href="/TheGuardian" className="text-xs font-medium tracking-widest text-gray-400 hover:text-cyan-400 transition-colors uppercase">
                THE GUARDIAN
              </Link>
              <Link href="/ApexCommand" className="text-xs font-medium tracking-widest text-gray-400 hover:text-cyan-400 transition-colors uppercase">
                APEX COMMAND
              </Link>
              <Link href="/login" className="text-xs font-medium tracking-widest text-fuchsia-400 hover:text-fuchsia-300 transition-colors uppercase">
                CLIENT PORTAL
              </Link>
              <a
                href="https://zbooking.us/xmUt9"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-cyan-400 text-black font-bold px-6 py-2 rounded text-xs tracking-widest hover:bg-cyan-300 transition-colors uppercase"
              >
                BOOK NOW
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f]">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Gradient orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-3 py-1.5 mb-8">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 text-xs font-medium tracking-widest uppercase">DOT COMPLIANCE EXPERTS</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-wider">
                  <span className="text-cyan-400">GHOST RIDER:</span>
                  <br />
                  <span className="text-white">APEX</span>
                  <br />
                  <span className="text-white">OPERATIONS</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-cyan-400 tracking-[0.3em] mb-8 font-light uppercase">
                  YOUR WINGMAN ON THE ROAD
                </p>
                
                <p className="text-gray-400 text-base leading-relaxed mb-4">
                  DOT compliance made simple for owner-operators and small fleets.
                </p>
                <p className="text-white text-base font-semibold mb-10">
                  Stop worrying about audits.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://zbooking.us/xmUt9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-cyan-400 text-black font-bold px-8 py-3.5 rounded text-sm tracking-wider hover:bg-cyan-300 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] uppercase"
                  >
                    Book FREE Consultation
                  </a>
                  <Link
                    href="/Services"
                    className="border-2 border-cyan-500 text-cyan-400 font-bold px-8 py-3.5 rounded text-sm tracking-wider hover:bg-cyan-500/10 transition-all uppercase"
                  >
                    View Services
                  </Link>
                </div>
              </div>
              
              {/* Right Content - Hero Image */}
              <div className="hidden lg:block relative">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-2xl blur-3xl" />
                  <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20">
                    <Image 
                      src="/images/hero-truck.png" 
                      alt="Semi truck at night"
                      width={600}
                      height={400}
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                  
                  {/* 24/7 Badge */}
                  <div className="absolute -top-4 -right-4 bg-[#0d0d14] border border-fuchsia-500/30 rounded-xl p-3 shadow-xl">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-fuchsia-400" />
                      <div>
                        <div className="text-xl font-bold text-white">24/7</div>
                        <div className="text-[10px] text-gray-400 uppercase">Support Available</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 100% Badge */}
                  <div className="absolute -bottom-4 -left-4 bg-[#0d0d14] border border-cyan-500/30 rounded-xl p-3 shadow-xl">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-xl font-bold text-white">100%</div>
                        <div className="text-[10px] text-gray-400 uppercase">Compliance Focused</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-wider">
                <span className="text-cyan-400">How It</span>{' '}
                <span className="text-fuchsia-400">Works</span>
              </h2>
              <p className="text-gray-400 text-sm tracking-wide">
                Get your compliance on track in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[
                {
                  step: "01",
                  icon: Clock,
                  title: "Book Your Consultation",
                  description: "Book a FREE 15-minute consultation to route your way to compliance success."
                },
                {
                  step: "02",
                  icon: FileCheck,
                  title: "Secure Portal Access",
                  description: "Log in to our secure portal, provide required docs and ELD access. From there your wingman takes over."
                },
                {
                  step: "03",
                  icon: Shield,
                  title: "Ride With Confidence",
                  description: "You'll receive weekly and monthly reports, plus the peace of mind that your co-pilot has your six."
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="bg-[#0d0d14]/50 border border-cyan-500/20 rounded-xl p-8 h-full hover:border-cyan-500/40 transition-all duration-300">
                    <div className="text-5xl font-bold text-cyan-500/20 mb-6 tracking-wider">
                      {item.step}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6">
                      <item.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-cyan-500/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-16">
              <p className="text-sm tracking-[0.3em] uppercase">
                <span className="text-cyan-400">EMPOWERING TRUCKERS TO SUCCEED ON THE</span>{' '}
                <span className="text-fuchsia-400">ROAD</span>
              </p>
            </div>
          </div>
        </section>

        {/* Service Tiers Section */}
        <section id="services" className="py-24 relative bg-[#0a0a0f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-wider">
                <span className="text-cyan-400">Our Service</span>{' '}
                <span className="text-fuchsia-400">Tiers</span>
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                From Weekly Audits to Full Compliance Management — Pick the Route That Fits Your Operation.
              </p>
              <p className="text-cyan-400 text-xs tracking-[0.3em] uppercase font-semibold">
                CHOOSE YOUR COMPLIANCE ROUTE:
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6 items-start mt-16">
              {/* The Wingman */}
              <Link href="/TheWingman" className="block group">
                <div className="relative rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 bg-black">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src="/images/wingman-cab.png" 
                      alt="The Wingman"
                      width={400}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest uppercase">
                      THE WINGMAN
                    </h3>
                    <div className="text-3xl font-bold text-cyan-400">
                      $150<span className="text-base text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* The Guardian */}
              <Link href="/TheGuardian" className="block group">
                <div className="relative rounded-xl overflow-hidden border-2 border-fuchsia-500/50 hover:border-fuchsia-500/80 transition-all duration-300 bg-black transform lg:scale-105">
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-4 py-1 rounded-b-lg text-[10px] font-bold tracking-widest z-20 uppercase">
                    MOST POPULAR
                  </div>
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src="/images/guardian-truck.png" 
                      alt="The Guardian"
                      width={400}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-fuchsia-400 mb-4 tracking-widest uppercase">
                      THE GUARDIAN
                    </h3>
                    <div className="text-3xl font-bold text-fuchsia-400">
                      $275<span className="text-base text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Apex Command */}
              <Link href="/ApexCommand" className="block group">
                <div className="relative rounded-xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 bg-black">
                  <div className="relative h-48 overflow-hidden">
                    <Image 
                      src="/images/apex-truck.png" 
                      alt="Apex Command"
                      width={400}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 tracking-widest uppercase">
                      APEX COMMAND
                    </h3>
                    <div className="text-3xl font-bold text-cyan-400">
                      $450<span className="text-base text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f]">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-[150px]" />
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-wider">
              <span className="text-cyan-400">Ready to Coast With Your</span>{' '}
              <span className="text-fuchsia-400">Wingman?</span>
            </h2>
            <p className="text-gray-400 text-base mb-10 max-w-2xl mx-auto">
              Take the first step towards stress-free compliance. Book your free consultation today and discover how Ghost Rider can keep you rolling.
            </p>
            <a
              href="https://zbooking.us/xmUt9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500 text-white font-bold px-10 py-4 rounded text-sm tracking-widest hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all uppercase"
            >
              Book Now
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050508] border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="text-xl font-bold mb-4 tracking-wider">
                <span className="text-cyan-400">GHOST</span>{' '}
                <span className="text-fuchsia-400">RIDER</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your Wingman on the Road. Professional DOT compliance consulting for owner-operators and small fleets.
              </p>
            </div>

            <div>
              <h4 className="text-cyan-400 text-xs font-bold mb-4 tracking-widest uppercase">CONTACT</h4>
              <div className="space-y-2">
                <a
                  href="mailto:ghostrider.apexops@zohomail.com"
                  className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  ghostrider.apexops@zohomail.com
                </a>
                <a
                  href="tel:5515742992"
                  className="block text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                >
                  (551) 574-2992
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-cyan-400 text-xs font-bold mb-4 tracking-widest uppercase">LEGAL</h4>
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
            <p className="text-gray-500 text-xs">© 2026 Ghost Rider: Apex Operations. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
