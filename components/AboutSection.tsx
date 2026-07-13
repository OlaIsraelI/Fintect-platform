"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              About FinTech Platform
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              FinTech is a modern financial platform designed to make banking
              simple, secure, and accessible to everyone.
            </p>
            <p className="text-gray-600 mb-4">
              Our mission is to provide innovative financial solutions that
              empower individuals and businesses to take control of their money.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-gray-800">10+ Years</p>
                  <p className="text-sm text-gray-500">Experience</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xl">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-gray-800">1M+ Users</p>
                  <p className="text-sm text-gray-500">Trust Us</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-blue-50 rounded-2xl p-8"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Create Account
                  </h4>
                  <p className="text-gray-600 text-sm">Sign up in minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    Verify Identity
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Secure verification process
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Start Banking</h4>
                  <p className="text-gray-600 text-sm">
                    Send, receive, and grow
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
