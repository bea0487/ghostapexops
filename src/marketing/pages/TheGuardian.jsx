import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, Target, Shield, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import FeatureList from '../components/FeatureList'

export default function TheGuardian() {
  const wingmanFeatures = [
    'Weekly ELD Log Reviews',
    'Violation Identification',
    'Correction Guidance',
    'Compliance Trend Tracking',
    'Monthly Summary Report',
    'Email & Phone Support',
    'Violation Alerts',
  ]

  const guardianFeatures = [
    'Complete DQ File Setup & Maintenance',
    'Medical Card Tracking (60, 30, 14 day reminders)',
    'CDL Expiration Tracking',
    'Annual MVR Pulls',
    'Clearinghouse Queries (pre-employment and annual)',
    'Previous Employer Verifications',
    'Driver Application Review',
    'Road Test Documentation',
    'Quarterly IFTA Returns',
    'Mileage Tracking Assistance',
    'Fuel Tax Calculations',
    'Renewal Reminders & Deadline Alerts',
  ]

  const notIncluded = [
    'Monthly CSA score reviews',
    'DataQ dispute filing',
    'DOT audit preparation',
    'Roadside inspection support',
    'Priority same-day response',
  ]

  const idealFor = [
    'Owner-operators who want compliance completely handled',
    'Small fleets (1-10 trucks) without a dedicated compliance person',
    "Anyone who's missed a medical card renewal or IFTA deadline before",
  ]

  return (
    <div className="bg-grid min-h-screen">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-fuchsia-400 text-sm font-medium tracking-wide">FULL COMPLIANCE MANAGEMENT</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full px-4 py-2">
                  <Star className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-bold tracking-wide">MOST POPULAR</span>
                </div>
              </div>

              <h1 className="font-orbitron text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                <span className="text-gradient">THE GUARDIAN</span>
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-orbitron text-5xl font-bold text-fuchsia-400">$275</span>
                <span className="text-gray-400 text-xl">/month</span>
              </div>

              <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-2xl">
                Everything in Wingman, plus complete driver qualification file management and IFTA filing.
              </p>

              <CTAButton text="Book FREE Consultation" variant="magenta" size="large" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/10 rounded-3xl blur-3xl" />
              <img
                src="/images/guardian-truck.png"
                alt="Truck at sunset"
                className="relative rounded-3xl border border-fuchsia-500/30 shadow-2xl"
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
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-fuchsia-400" />
                </div>
                <h2 className="font-orbitron text-2xl font-bold text-white">What's Included</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="font-orbitron text-lg text-cyan-400 mb-4">Everything in Wingman:</h3>
                  <FeatureList items={wingmanFeatures} included={true} />
                </div>

                <div className="bg-[#0d0d14] border border-fuchsia-500/30 rounded-2xl p-6">
                  <h3 className="font-orbitron text-lg text-fuchsia-400 mb-4">PLUS Guardian Features:</h3>
                  <FeatureList items={guardianFeatures} included={true} />
                </div>
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
                Need complete protection including CSA monitoring and DOT audit prep? Check out{' '}
                <Link to="/ApexCommand" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                  Apex Command
                </Link>
                .
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h2 className="font-orbitron text-2xl font-bold text-white">Ideal For</h2>
            </div>

            <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-2xl p-8">
              <ul className="space-y-4 text-left">
                {idealFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient mb-6">
              Ready for Complete Compliance Coverage?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the most popular tier chosen by owner-operators and small fleets.
            </p>
            <CTAButton text="Book FREE Consultation" variant="magenta" size="large" />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
