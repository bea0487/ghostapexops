import React from 'react'
import { motion } from 'framer-motion'
import { Check, Target, Shield, Crown, Zap } from 'lucide-react'
import CTAButton from '../components/CTAButton'
import FeatureList from '../components/FeatureList'

export default function ApexCommand() {
  const guardianFeatures = [
    'Weekly ELD Log Reviews & Violation Identification',
    'Correction Guidance & Compliance Trend Tracking',
    'Monthly Summary Reports',
    'Email & Phone Support',
    'Complete DQ File Setup & Maintenance',
    'Medical Card & CDL Expiration Tracking',
    'Annual MVR Pulls & Clearinghouse Queries',
    'Driver Application Review & Road Test Documentation',
    'Quarterly IFTA Returns & Fuel Tax Calculations',
    'Renewal Reminders & Deadline Alerts',
  ]

  const apexFeatures = [
    'Monthly CSA Score Reviews',
    'CSA Improvement Consulting',
    'DataQ Challenge Filing',
    'DOT Audit Preparation',
    'Audit Document Organization',
    'Roadside Inspection Support Hotline',
    'Priority Same-Day Response',
    'Dedicated Compliance Wingman',
    'Quarterly Compliance Reviews',
    'New Entrant Audit Support',
  ]

  const idealFor = [
    'Carriers with elevated CSA scores who need to bring them down',
    "Anyone who's been through a DOT audit and never wants to feel unprepared again",
    'New authorities in their 18-month new entrant safety period',
    'Operators who want complete peace of mind',
  ]

  return (
    <div className="bg-grid min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-full px-4 py-2">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-sm font-medium tracking-wide">TOTAL DOT COMPLIANCE</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full px-4 py-2">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold tracking-wide">COMPLETE PROTECTION</span>
                </div>
              </div>

              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-gradient">APEX COMMAND</span>
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-orbitron text-5xl font-bold text-gradient">$450</span>
                <span className="text-gray-400 text-xl">/month</span>
              </div>

              <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-2xl">
                The ultimate compliance package. Everything in Guardian, plus CSA monitoring, DataQ disputes, DOT audit preparation, and priority support.
              </p>

              <CTAButton text="Book FREE Consultation" variant="gradient" size="large" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-3xl blur-3xl" />
              <img
                src="/images/apex-truck.png"
                alt="Truck at night"
                className="relative rounded-3xl border border-cyan-500/30 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="font-orbitron text-2xl font-bold text-white">What's Included</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-2xl p-8">
                <h3 className="font-orbitron text-lg text-fuchsia-400 mb-6">Everything in Guardian:</h3>
                <FeatureList items={guardianFeatures} included={true} />
              </div>

              <div className="bg-[#0d0d14] border border-cyan-500/30 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 rounded-full blur-2xl" />
                <h3 className="font-orbitron text-lg text-cyan-400 mb-6 flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  PLUS Apex Command Features:
                </h3>
                <FeatureList items={apexFeatures} included={true} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="font-orbitron text-2xl font-bold text-white">Ideal For</h2>
            </div>

            <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8">
              <ul className="space-y-4 text-left">
                {idealFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient mb-6">Ready for Complete Peace of Mind?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Take command of your compliance with the ultimate protection package.
            </p>
            <CTAButton text="Book FREE Consultation" variant="gradient" size="large" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
