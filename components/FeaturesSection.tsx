"use client";

import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";

// FeatureCard is a default export from ./FeatureCard

const features = [
  {
    icon: "💳",
    title: "Instant Payments",
    description: "Send and receive money instantly with just a few taps",
  },
  {
    icon: "🔒",
    title: "Bank-Grade Security",
    description: "Your money and data are protected with advanced encryption",
  },
  {
    icon: "📱",
    title: "Mobile First",
    description: "Manage your finances on the go with our mobile app",
  },
  {
    icon: "💰",
    title: "Low Fees",
    description: "Transparent pricing with competitive rates",
  },
  {
    icon: "🌍",
    title: "Global Reach",
    description: "Send money to anyone, anywhere in the world",
  },
  {
    icon: "📊",
    title: "Smart Insights",
    description: "Track your spending and get personalized financial advice",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose FinTech?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of banking with our powerful features
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
