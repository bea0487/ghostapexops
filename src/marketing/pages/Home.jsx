import React from 'react'
import { motion } from 'framer-motion'
import { Shield, FileCheck, Clock, ChevronRight, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import SectionHeader from '../components/SectionHeader'

export default function Home() {
  return (
    <div className="bg-grid">
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium tracking-wide">DOT COMPLIANCE EXPERTS</span>
              </div>

              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="text-gradient">GHOST RIDER:</span>
                <br />
                <span className="text-white">APEX OPERATIONS</span>
              </h1>

              <p className="font-orbitron text-xl sm:text-2xl text-cyan-400 tracking-[0.2em] mb-6 glow-text-cyan">
                YOUR WINGMAN ON THE ROAD
              </p>

              <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
                DOT compliance made simple for owner-operators and small fleets.
                <span className="text-white font-medium"> Stop worrying about audits.</span>
              </p>

              <div className="flex flex-wrap gap-4">
                <CTAButton text="Book FREE Consultation" size="large" />
                <Link
                  to="/Services"
                  className="inline-block font-orbitron font-semibold tracking-wide rounded-lg transition-all duration-300 text-center px-10 py-4 text-base border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                >
                  View Services
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-3xl blur-3xl" />
                <img
                  src="/images/hero-truck.png"
                  alt="Semi truck at night"
                  className="relative rounded-3xl border border-cyan-500/20 shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-[#0d0d14] border border-cyan-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron font-bold text-white">100%</div>
                      <div className="text-xs text-gray-400">Compliance Focused</div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-[#0d0d14] border border-fuchsia-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron font-bold text-white">24/7</div>
                      <div className="text-xs text-gray-400">Support Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-fuchsia-500/5 to-cyan-500/5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title="How It Works" subtitle="Get your compliance on track in three simple steps" />

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                step: '01',
                icon: Clock,
                title: 'Book Your Consultation',
                description: 'Book a FREE 15-minute consultation to route your way to compliance success.',
              },
              {
                step: '02',
                icon: FileCheck,
                title: 'Secure Portal Access',
                description:
                  'Log in to our secure portal, provide required docs and ELD access. From there your wingman takes over.',
              },
              {
                step: '03',
                icon: Shield,
                title: 'Ride With Confidence',
                description:
                  "You'll receive weekly and monthly reports, plus the peace of mind that your co-pilot has your six.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative group"
              >
                <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8 h-full hover:border-cyan-500/40 transition-all duration-500 card-hover">
                  <div className="font-orbitron text-5xl font-bold text-cyan-500/20 mb-4">{item.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="font-orbitron text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 ? (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-cyan-500/30" />
                  </div>
                ) : null}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="font-orbitron text-lg sm:text-xl text-gradient tracking-[0.15em]">
              EMPOWERING TRUCKERS TO SUCCEED ON THE ROAD
            </p>
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Service Tiers"
            subtitle="From Weekly Audits to Full Compliance Management — Pick the Route That Fits Your Operation."
          />

          <p className="text-center font-orbitron text-cyan-400 tracking-wider mt-6 mb-16">
            CHOOSE YOUR COMPLIANCE ROUTE:
          </p>

          {/* Main Service Tiers */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 items-start mb-20">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <Link to="/TheWingman" className="block group">
                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-500 card-hover">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/images/wingman-cab.png"
                      alt="The Wingman"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-orbitron text-2xl font-bold text-cyan-400 drop-shadow-lg">THE WINGMAN</h3>
                    </div>
                  </div>
                  <div className="bg-[#0d0d14] p-6 text-center">
                    <div className="font-orbitron text-3xl font-bold text-cyan-400">
                      $150<span className="text-lg text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}>
              <Link to="/TheGuardian" className="block group">
                <div className="relative rounded-2xl overflow-hidden border-2 border-fuchsia-500/30 hover:border-fuchsia-500/60 transition-all duration-500 card-hover scale-105 z-10">
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-1.5 rounded-b-full font-orbitron text-xs font-bold tracking-wider z-20">
                    MOST POPULAR
                  </div>
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/images/guardian-truck.png"
                      alt="The Guardian"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-orbitron text-2xl font-bold text-fuchsia-400 drop-shadow-lg">THE GUARDIAN</h3>
                    </div>
                  </div>
                  <div className="bg-[#0d0d14] p-6 text-center">
                    <div className="font-orbitron text-3xl font-bold text-fuchsia-400">
                      $275<span className="text-lg text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
              <Link to="/ApexCommand" className="block group">
                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-500 card-hover">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src="/images/apex-truck.png"
                      alt="Apex Command"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-orbitron text-2xl font-bold text-cyan-400 drop-shadow-lg">APEX COMMAND</h3>
                    </div>
                  </div>
                  <div className="bg-[#0d0d14] p-6 text-center">
                    <div className="font-orbitron text-3xl font-bold text-cyan-400">
                      $450<span className="text-lg text-gray-500">/month</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Additional Services Section */}
          <div className="border-t border-cyan-500/20 pt-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h3 className="font-orbitron text-2xl font-bold text-gradient mb-4">SPECIALIZED SERVICES</h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Need something more specific? We offer specialized services tailored to your unique operational needs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Virtual Dispatcher",
                  price: "Custom",
                  description: "Load scheduling, broker packets, revenue tracking",
                  color: "purple"
                },
                {
                  title: "A La Carte",
                  price: "Variable",
                  description: "Pick and choose specific compliance services",
                  color: "teal"
                },
                {
                  title: "ELD Monitoring Only",
                  price: "$75",
                  description: "Monthly ELD brief reports and basic support",
                  color: "blue"
                },
                {
                  title: "Back Office Command",
                  price: "Custom",
                  description: "Complete back-office operations management",
                  color: "pink"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className={`bg-[#0d0d14] rounded-xl p-6 border-2 transition-all duration-500 card-hover h-full ${
                    service.color === 'purple' ? 'border-purple-500/30 hover:border-purple-500/60' :
                    service.color === 'teal' ? 'border-teal-500/30 hover:border-teal-500/60' :
                    service.color === 'blue' ? 'border-blue-500/30 hover:border-blue-500/60' :
                    'border-pink-500/30 hover:border-pink-500/60'
                  }`}>
                    <div className="text-center">
                      <h4 className={`font-orbitron text-lg font-bold mb-2 ${
                        service.color === 'purple' ? 'text-purple-400' :
                        service.color === 'teal' ? 'text-teal-400' :
                        service.color === 'blue' ? 'text-blue-400' :
                        'text-pink-400'
                      }`}>
                        {service.title}
                      </h4>
                      <div className={`font-orbitron text-2xl font-bold mb-3 ${
                        service.color === 'purple' ? 'text-purple-400' :
                        service.color === 'teal' ? 'text-teal-400' :
                        service.color === 'blue' ? 'text-blue-400' :
                        'text-pink-400'
                      }`}>
                        {service.price}
                        {service.price !== 'Custom' && service.price !== 'Variable' && (
                          <span className="text-sm text-gray-500">/mo</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-12"
            >
              <Link 
                to="/Services" 
                className="inline-flex items-center gap-2 font-orbitron font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                View All Services & Pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 relative bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient mb-6">Why Ghost Rider?</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                We understand the road. We know that every hour you spend worrying about compliance is an hour you're not
                earning. That's why we've designed our services to be your silent partner.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Users,
                    title: 'Owner-Operator Focused',
                    desc: 'Built specifically for small operations that need big-fleet compliance',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Proactive Monitoring',
                    desc: "We catch issues before FMCSA does, saving you from costly violations",
                  },
                  {
                    icon: Shield,
                    title: 'Complete Protection',
                    desc: "From HOS logs to DOT audits, we've got every angle covered",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-orbitron font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <img
                src="/images/sunset-road.png"
                alt="Sunset road view"
                className="relative rounded-3xl border border-fuchsia-500/20 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-6">
              Ready to Coast With Your Wingman?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Take the first step towards stress-free compliance. Book your free consultation today.
            </p>
            <CTAButton text="Book Now" variant="gradient" size="large" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
