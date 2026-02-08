import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="bg-grid min-h-screen py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-orbitron text-3xl sm:text-4xl font-bold text-gradient">
                Disclaimer
              </h1>
              <p className="text-gray-400 mt-1">Important Information About Our Services</p>
            </div>
          </div>
          
          <div className="bg-[#0d0d14] border border-cyan-500/20 rounded-2xl p-8 lg:p-12 space-y-8">
            
            {/* Main Disclaimer Box */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 rounded-xl p-6">
              <h2 className="font-orbitron text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cyan-400" />
                Important Notice
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Ghost Rider: Apex Operations is a <strong className="text-white">consulting service only</strong>. 
                We provide guidance, education, and administrative support for DOT compliance matters. 
                We are not a law firm, accounting firm, or government agency.
              </p>
            </div>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Not Legal Advice
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>We are <strong className="text-white">NOT attorneys</strong>. The information and services we provide:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Do not constitute legal advice</li>
                  <li>Should not be relied upon as a substitute for legal counsel</li>
                  <li>Do not create an attorney-client relationship</li>
                </ul>
                <p className="mt-4">If you require legal advice regarding DOT regulations, FMCSA enforcement actions, or any legal matters, please consult with a qualified transportation attorney.</p>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Not Tax or Accounting Advice
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>We are <strong className="text-white">NOT certified public accountants (CPAs)</strong>. Our IFTA filing assistance:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Is based on information you provide</li>
                  <li>Does not constitute tax advice</li>
                  <li>Should be reviewed by your accountant or tax professional</li>
                </ul>
                <p className="mt-4">For complex tax matters or tax planning, please consult with a qualified accountant or tax advisor.</p>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Not Government Representatives
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>We are <strong className="text-white">NOT government employees or officials</strong>. We:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Have no authority to grant, modify, or revoke operating authority</li>
                  <li>Cannot influence audit outcomes or enforcement decisions</li>
                  <li>Cannot guarantee any specific result with regulatory agencies</li>
                  <li>Are not affiliated with FMCSA, any state DOT, or other regulatory bodies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                No Guarantee of Results
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>While we strive to help you achieve and maintain compliance, we <strong className="text-white">cannot guarantee</strong>:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>That you will pass any DOT audit or inspection</li>
                  <li>Specific CSA score improvements</li>
                  <li>Successful DataQ challenge outcomes</li>
                  <li>Avoidance of fines, penalties, or out-of-service orders</li>
                  <li>Any particular regulatory outcome</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Client Responsibility
              </h2>
              <div className="text-gray-300 leading-relaxed space-y-3">
                <p>Ultimately, <strong className="text-white">you are responsible for your own compliance</strong>. This includes:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-gray-400">
                  <li>Ensuring all information you provide is accurate and complete</li>
                  <li>Following through on recommendations we provide</li>
                  <li>Maintaining valid operating authority and insurance</li>
                  <li>Training and supervising your drivers</li>
                  <li>Making final decisions about your operation</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Information Accuracy
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>DOT regulations change frequently. While we strive to stay current with all regulatory updates, the information we provide is based on our understanding at the time of service. Always verify current regulations with official FMCSA sources or qualified legal counsel.</p>
              </div>
            </section>

            {/* Contact */}
            <section className="pt-4">
              <h2 className="font-orbitron text-xl font-bold text-cyan-400 mb-4">
                Questions?
              </h2>
              <div className="text-gray-300 leading-relaxed">
                <p>If you have questions about this disclaimer or our services:</p>
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
