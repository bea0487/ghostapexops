import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'

export default function Services() {
  return (
    <div className="bg-grid min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/Cover_Photo.png"
            alt="Ghost Rider background"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-[#0a0a0f]/60 to-[#0a0a0f]" />
        </div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <SectionHeader
              title="Our Service Tiers"
              subtitle="From Weekly Audits to Full Compliance Management — Pick the Route That Fits Your Operation."
            />

            <p className="font-orbitron text-cyan-400 tracking-wider mt-8 text-lg">CHOOSE YOUR COMPLIANCE ROUTE:</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Service Tiers */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 items-start mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/TheWingman" className="block">
                <div className="relative bg-[#0d0d14] rounded-2xl p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-500 card-hover group">
                  <div className="text-center mb-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">THE WINGMAN</h3>
                    <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
                      $150<span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      'Weekly ELD log reviews',
                      'Violation identification & correction guidance',
                      'Compliance trend tracking',
                      'Monthly summary reports',
                      'Email & phone support',
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-orbitron text-sm font-semibold group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Link to="/TheGuardian" className="block">
                <div className="relative bg-[#0d0d14] rounded-2xl p-8 border-2 border-fuchsia-500/30 hover:border-fuchsia-500/60 hover:shadow-[0_0_40px_rgba(255,0,255,0.15)] transition-all duration-500 card-hover group scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-1.5 rounded-full font-orbitron text-xs font-bold tracking-wider">
                    MOST POPULAR
                  </div>

                  <div className="text-center mb-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">THE GUARDIAN</h3>
                    <div className="font-orbitron text-4xl font-bold text-fuchsia-400 mb-1">
                      $275<span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      'Everything in Wingman, PLUS:',
                      'Driver qualification file management',
                      'Medical card & CDL expiration tracking',
                      'Annual MVR pulls',
                      'Clearinghouse queries',
                      'Quarterly IFTA filing',
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-2 shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center gap-2 text-fuchsia-400 font-orbitron text-sm font-semibold group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/ApexCommand" className="block">
                <div className="relative bg-[#0d0d14] rounded-2xl p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-500 card-hover group">
                  <div className="text-center mb-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">APEX COMMAND</h3>
                    <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
                      $450<span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      'Everything in Guardian, PLUS:',
                      'Monthly CSA score reviews',
                      'DataQ dispute filing',
                      'DOT audit preparation',
                      'Roadside inspection support hotline',
                      'Priority same-day response',
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center gap-2 text-cyan-400 font-orbitron text-sm font-semibold group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
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
              <h3 className="font-orbitron text-3xl font-bold text-gradient mb-4">SPECIALIZED SERVICES</h3>
              <p className="text-gray-400 max-w-3xl mx-auto text-lg">
                Need something more specific? We offer specialized services and custom solutions tailored to your unique operational needs.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {[
                {
                  title: "Virtual Dispatcher",
                  price: "Custom Pricing",
                  description: "Complete dispatch operations management",
                  features: [
                    "Load scheduling & optimization",
                    "Broker packet management",
                    "Weekly revenue reports",
                    "Lane analysis & optimization",
                    "Customer relationship management"
                  ],
                  color: "purple"
                },
                {
                  title: "Back Office Command",
                  price: "Custom Pricing", 
                  description: "Full back-office operations support",
                  features: [
                    "All compliance services included",
                    "DOT readiness audits",
                    "Complete file management",
                    "Priority support & consultation",
                    "Custom reporting & analytics"
                  ],
                  color: "pink"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`bg-[#0d0d14] rounded-2xl p-8 border-2 transition-all duration-500 card-hover h-full ${
                    service.color === 'purple' ? 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]' :
                    'border-pink-500/30 hover:border-pink-500/60 hover:shadow-[0_0_40px_rgba(236,72,153,0.15)]'
                  }`}>
                    <div className="text-center mb-8">
                      <h4 className={`font-orbitron text-2xl font-bold text-white mb-2`}>
                        {service.title}
                      </h4>
                      <div className={`font-orbitron text-3xl font-bold mb-2 ${
                        service.color === 'purple' ? 'text-purple-400' : 'text-pink-400'
                      }`}>
                        {service.price}
                      </div>
                      <p className="text-gray-400 mb-6">{service.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                            service.color === 'purple' ? 'bg-purple-400' : 'bg-pink-400'
                          }`} />
                          <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "A La Carte Services",
                  price: "Variable Pricing",
                  description: "Pick and choose specific compliance services based on your needs",
                  features: ["ELD Monitoring", "IFTA Filing", "CSA Score Reviews", "DataQ Disputes", "Custom Reports"],
                  color: "teal"
                },
                {
                  title: "ELD Monitoring Only",
                  price: "$75/month",
                  description: "Basic ELD compliance monitoring for budget-conscious operators",
                  features: ["Monthly ELD brief reports", "Basic violation alerts", "Email support", "Compliance summaries"],
                  color: "blue"
                },
                {
                  title: "DOT Readiness Audit",
                  price: "One-time Service",
                  description: "Comprehensive DOT audit preparation and compliance review",
                  features: ["Full compliance review", "DQ file gap analysis", "Prioritized action plan", "Audit preparation"],
                  color: "emerald"
                }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`bg-[#0d0d14] rounded-xl p-6 border-2 transition-all duration-500 card-hover h-full ${
                    service.color === 'teal' ? 'border-teal-500/30 hover:border-teal-500/60' :
                    service.color === 'blue' ? 'border-blue-500/30 hover:border-blue-500/60' :
                    'border-emerald-500/30 hover:border-emerald-500/60'
                  }`}>
                    <div className="text-center mb-6">
                      <h4 className={`font-orbitron text-lg font-bold mb-2 ${
                        service.color === 'teal' ? 'text-teal-400' :
                        service.color === 'blue' ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>
                        {service.title}
                      </h4>
                      <div className={`font-orbitron text-xl font-bold mb-3 ${
                        service.color === 'teal' ? 'text-teal-400' :
                        service.color === 'blue' ? 'text-blue-400' :
                        'text-emerald-400'
                      }`}>
                        {service.price}
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                    </div>

                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <div className={`w-1 h-1 rounded-full mt-2 shrink-0 ${
                            service.color === 'teal' ? 'bg-teal-400' :
                            service.color === 'blue' ? 'bg-blue-400' :
                            'bg-emerald-400'
                          }`} />
                          <span className="text-gray-300 text-xs leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0 }} 
              whileInView={{ opacity: 1 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-16 p-8 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 rounded-2xl border border-cyan-500/20"
            >
              <h4 className="font-orbitron text-xl font-bold text-white mb-4">Need a Custom Solution?</h4>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Every operation is unique. Contact us to discuss a custom compliance package tailored specifically to your needs and budget.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="font-orbitron font-semibold tracking-wide rounded-lg transition-all duration-300 text-center px-8 py-3 text-sm bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                  Get Custom Quote
                </button>
                <button className="font-orbitron font-semibold tracking-wide rounded-lg transition-all duration-300 text-center px-8 py-3 text-sm border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  Schedule Consultation
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
