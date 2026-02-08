import React from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="bg-grid min-h-screen py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-fuchsia-500/20 flex items-center justify-center">
              <FileText className="w-7 h-7 text-fuchsia-400" />
            </div>
            <div>
              <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient">
                Terms of Service
              </h1>
              <p className="text-gray-400 mt-1">Last updated: January 2025</p>
            </div>
          </div>
          
          <div className="bg-[#0d0d14] border border-fuchsia-500/20 rounded-2xl p-8 lg:p-12 space-y-8">
            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                1. Services Provided
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Ghost Rider: Apex Operations provides DOT compliance consulting services including but not limited to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Hours of Service (HOS) log audits and violation identification</li>
                  <li>Driver qualification (DQ) file management</li>
                  <li>IFTA quarterly filing assistance</li>
                  <li>CSA score monitoring and improvement consulting</li>
                  <li>DataQ dispute filing assistance</li>
                  <li>DOT audit preparation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                2. Service Tiers
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-4">
                <p>We offer three service tiers with different levels of support:</p>
                <div className="space-y-3">
                  <div className="p-4 bg-[#0a0a0f] rounded-lg border border-cyan-500/10">
                    <p className="text-cyan-400 font-medium">The Wingman - $150/month</p>
                    <p className="text-gray-400 text-sm mt-1">Weekly HOS audits, violation identification, and email/phone support</p>
                  </div>
                  <div className="p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10">
                    <p className="text-fuchsia-400 font-medium">The Guardian - $275/month</p>
                    <p className="text-gray-400 text-sm mt-1">All Wingman features plus DQ file management and IFTA filing</p>
                  </div>
                  <div className="p-4 bg-[#0a0a0f] rounded-lg border border-cyan-500/10">
                    <p className="text-cyan-400 font-medium">Apex Command - $450/month</p>
                    <p className="text-gray-400 text-sm mt-1">All Guardian features plus CSA monitoring, DataQ disputes, and DOT audit prep</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                3. Client Responsibilities
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>As a client, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Provide accurate and complete information</li>
                  <li>Grant necessary access to ELD systems and portals</li>
                  <li>Respond to requests for documents or information in a timely manner</li>
                  <li>Notify us of any changes to your operation (new drivers, vehicles, etc.)</li>
                  <li>Review and sign documents when requested</li>
                  <li>Maintain valid DOT and MC authority</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                4. Fees and Payment
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Monthly fees are billed in advance on the first of each month</li>
                  <li>Payment is due within 7 days of invoice date</li>
                  <li>We accept credit cards, ACH transfers, and check payments</li>
                  <li>Late payments may result in service suspension</li>
                  <li>Prices are subject to change with 30 days notice</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                5. Cancellation
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>You may cancel your subscription at any time with 30 days written notice</li>
                  <li>Cancellation notice must be sent to ghostrider.apexops@zohomail.com</li>
                  <li>No refunds will be issued for partial months</li>
                  <li>Upon cancellation, we will provide copies of all documents in your file</li>
                  <li>We reserve the right to cancel service for non-payment or violation of these terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                6. Limitation of Liability
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Ghost Rider: Apex Operations provides consulting services only. We are not liable for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Fines, penalties, or citations issued by any regulatory agency</li>
                  <li>Results of DOT audits or roadside inspections</li>
                  <li>Loss of operating authority</li>
                  <li>Business losses resulting from compliance issues</li>
                  <li>Errors in information provided by client</li>
                </ul>
                <p className="mt-4">Our total liability shall not exceed the fees paid for services in the preceding 12 months.</p>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                7. Governing Law
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>These terms shall be governed by and construed in accordance with applicable federal and state laws. Any disputes shall be resolved through binding arbitration.</p>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-fuchsia-400 mb-4">
                8. Contact
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>For questions about these Terms of Service:</p>
                <div className="mt-4 p-4 bg-[#0a0a0f] rounded-lg border border-fuchsia-500/10">
                  <p className="text-fuchsia-400 font-medium">Ghost Rider: Apex Operations</p>
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
