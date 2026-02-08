import React from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="bg-grid min-h-screen py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient">
                Privacy Policy
              </h1>
              <p className="text-gray-400 mt-1">Last updated: January 2025</p>
            </div>
          </div>
          
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8 lg:p-12 space-y-8">
            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                1. Information We Collect
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Ghost Rider: Apex Operations collects the following types of information:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li><strong className="text-gray-300">Personal Information:</strong> Name, email address, phone number, business name, and DOT/MC numbers</li>
                  <li><strong className="text-gray-300">Driver Information:</strong> CDL numbers, medical card information, MVR records, and Clearinghouse query results</li>
                  <li><strong className="text-gray-300">ELD/HOS Data:</strong> Electronic logging device records, hours of service logs, and violation history</li>
                  <li><strong className="text-gray-300">Business Documents:</strong> Driver qualification files, IFTA records, and other compliance-related documents</li>
                  <li><strong className="text-gray-300">Communication Records:</strong> Emails, phone call notes, and consultation records</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                2. How We Use Your Information
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Provide DOT compliance consulting services</li>
                  <li>Conduct HOS log audits and identify violations</li>
                  <li>Manage driver qualification files</li>
                  <li>File IFTA returns on your behalf</li>
                  <li>Monitor CSA scores and file DataQ disputes</li>
                  <li>Prepare for DOT audits</li>
                  <li>Send compliance reminders and alerts</li>
                  <li>Communicate with you about our services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                3. Information Sharing
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>We do not sell your personal information. We may share information only:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>With government agencies (FMCSA, state DOTs) as required for compliance filings</li>
                  <li>With the FMCSA Clearinghouse for drug and alcohol queries</li>
                  <li>With service providers who assist in delivering our services</li>
                  <li>When required by law or legal process</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                4. Data Retention
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>We retain your information for as long as required by DOT regulations:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400 mt-3">
                  <li>Driver qualification files: Duration of employment plus 3 years</li>
                  <li>ELD/HOS records: 6 months (as required by FMCSA)</li>
                  <li>Drug and alcohol records: 5 years</li>
                  <li>IFTA records: 4 years</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                5. Data Security
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>We implement appropriate technical and organizational security measures to protect your information, including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400 mt-3">
                  <li>Encrypted data transmission and storage</li>
                  <li>Secure client portal with password protection</li>
                  <li>Limited access controls for staff</li>
                  <li>Regular security assessments</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                6. Your Rights
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400 mt-3">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data (subject to legal retention requirements)</li>
                  <li>Withdraw consent for certain processing activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                7. Contact Information
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:</p>
                <div className="mt-4 p-4 bg-[#0a0a0f] rounded-lg border border-cyan-500/10">
                  <p className="text-cyan-400 font-medium">Ghost Rider: Apex Operations</p>
                  <p className="text-gray-400">Email: ghostrider.apexops@zohomail.com</p>
                  <p className="text-gray-400">Phone: (551) 574-2992</p>
                </div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
