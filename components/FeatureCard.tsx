"use client";

import React from "react";

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard;
