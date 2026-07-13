"use client";

import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSlider />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FinTech Platform</h3>
              <p className="text-gray-400 text-sm">
                Making banking simple, secure, and accessible for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="/" className="hover:text-white transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/about" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xl"
                >
                  🐦
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xl"
                >
                  📘
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition text-xl"
                >
                  📸
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; 2024 FinTech Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
