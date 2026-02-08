import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SectionHeader from "../components/SectionHeader";

export default function Services() {
  return (
    <div className="bg-grid min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
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
            
            <p className="font-orbitron text-cyan-400 tracking-wider mt-8 text-lg">
              CHOOSE YOUR COMPLIANCE ROUTE:
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Tiers Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link to="/TheWingman" className="block">
                <div className="relative bg-[#0d0d14] rounded-2xl p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] transition-all duration-500 card-hover group">
                  <div className="text-center mb-8">
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                      THE WINGMAN
                    </h3>
                    <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
                      $150
                      <span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Weekly ELD log reviews",
                      "Violation identification & correction guidance",
                      "Compliance trend tracking",
                      "Monthly summary reports",
                      "Email & phone support"
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
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                      THE GUARDIAN
                    </h3>
                    <div className="font-orbitron text-4xl font-bold text-fuchsia-400 mb-1">
                      $275
                      <span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Wingman, PLUS:",
                      "Driver qualification file management",
                      "Medical card & CDL expiration tracking",
                      "Annual MVR pulls",
                      "Clearinghouse queries",
                      "Quarterly IFTA filing",
                      "Renewal reminders & deadline alerts"
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
                    <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                      APEX COMMAND
                    </h3>
                    <div className="font-orbitron text-4xl font-bold text-cyan-400 mb-1">
                      $450
                      <span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {[
                      "Everything in Guardian, PLUS:",
                      "Monthly CSA score reviews",
                      "DataQ dispute filing",
                      "DOT audit preparation",
                      "Roadside inspection support",
                      "Priority same-day response"
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
        </div>
      </section>

      {/* Comparison Note */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8"
          >
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Not sure which tier is right for you? 
              <span className="block mt-2 text-cyan-400 font-semibold">
                Click on any service above to see full details, or book a free consultation to discuss your needs.
              </span>
            </p>
            <a
              href="https://zbooking.us/xmUt9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-orbitron font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:-translate-y-1"
            >
              BOOK FREE CONSULTATION
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
