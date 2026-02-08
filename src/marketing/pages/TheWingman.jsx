import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, Target, Shield, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import FeatureList from '../components/FeatureList'

export default function TheWingman() {
  const includedFeatures = [
    'Weekly ELD Log Reviews — We audit your logs every week, not once a month',
    'Violation Identification — We flag HOS violations before they become CSA points',
    'Correction Guidance — Clear instructions on how to fix issues and avoid repeat violations',
    'Compliance Trend Tracking — See patterns in your logs so you can improve over time',
    'Monthly Summary Report — Easy-to-read report showing your compliance status',
    'Email Support — Get your questions answered within one business day',
    'Phone Support — Direct line during business hours',
    'Violation Alerts — Immediate notification when we spot serious issues',
  ]

  const notIncluded = [
    'Driver qualification (DQ) file management',
    'Medical card & CDL expiration tracking',
    'MVR pulls and Clearinghouse queries',
    'IFTA quarterly filing',
    'CSA score monitoring',
    'DataQ dispute filing',
    'DOT audit preparation',
  ]

  const idealFor = [
    'Owner-operators who manage their own DQ files but want expert eyes on their logs',
    "Drivers who've had HOS violations and want to clean up their record",
    'Small fleets that handle paperwork in-house but need weekly audit support',
  ]

  return (
    <div className="bg-grid min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full px-4 py-2 mb-6">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-medium tracking-wide">WEEKLY HOS AUDITS</span>
              </div>

              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-gradient">THE WINGMAN</span>
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-orbitron text-5xl font-bold text-cyan-400">$150</span>
                <span className="text-gray-400 text-xl">/month</span>
              </div>

              <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-2xl">
                Your eyes on the logs. We catch violations before FMCSA does, so you can focus on running loads.
              </p>

              <CTAButton text="Book FREE Consultation" size="large" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 rounded-3xl blur-3xl" />
              <img
                src="/images/wingman-cab.png"
                alt="Truck cab interior"
                className="relative rounded-3xl border border-cyan-500/30 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="font-orbitron text-2xl font-bold text-white">What's Included</h2>
              </div>

              <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8">
                <FeatureList items={includedFeatures} included={true} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  <X className="w-6 h-6 text-gray-500" />
                </div>
                <h2 className="font-orbitron text-2xl font-bold text-white">What's NOT Included</h2>
              </div>

              <div className="bg-[#0d0d14] border border-gray-800 rounded-2xl p-8">
                <FeatureList items={notIncluded} included={false} />
              </div>

              <p className="text-gray-400 text-sm mt-4 italic">
                Need these features? Check out{' '}
                <Link to="/TheGuardian" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  The Guardian
                </Link>{' '}
                or{' '}
                <Link to="/ApexCommand" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Apex Command
                </Link>{' '}
                tiers.
              </p>
            </motion.div>
          </div>
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient mb-6">Ready to Get Your Wingman?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Start with a free 15-minute consultation. We'll review your current situation and show you exactly how we can help.
            </p>
            <CTAButton text="Book FREE Consultation" variant="cyan" size="large" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
