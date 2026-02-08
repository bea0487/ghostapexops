import React from "react";
import { Check } from "lucide-react";
import CTAButton from "./CTAButton";

export default function ServiceCard({ 
  name, 
  price, 
  description, 
  features = [], 
  accent = "cyan", 
  popular = false 
}) {
  const accentClasses = {
    cyan: {
      border: "border-cyan-500/30 hover:border-cyan-500/60",
      glow: "hover:shadow-[0_0_40px_rgba(0,255,255,0.15)]",
      icon: "text-cyan-400",
      price: "text-cyan-400"
    },
    magenta: {
      border: "border-fuchsia-500/30 hover:border-fuchsia-500/60",
      glow: "hover:shadow-[0_0_40px_rgba(255,0,255,0.15)]",
      icon: "text-fuchsia-400",
      price: "text-fuchsia-400"
    }
  };

  const colors = accentClasses[accent];

  return (
    <div 
      className={`
        relative bg-[#0d0d14] rounded-2xl p-8 border-2 
        ${colors.border} ${colors.glow}
        transition-all duration-500 card-hover
        ${popular ? 'scale-105 z-10' : ''}
      `}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white px-6 py-1.5 rounded-full font-orbitron text-xs font-bold tracking-wider">
          MOST POPULAR
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
          {name}
        </h3>
        <div className={`font-orbitron text-4xl font-bold ${colors.price} mb-1`}>
          ${price}
          <span className="text-lg text-gray-500">/mo</span>
        </div>
        {description && (
          <p className="text-gray-400 text-sm mt-2">{description}</p>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={`${colors.icon} shrink-0 mt-0.5`} size={18} />
            <span className="text-gray-300 text-sm leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>

      <CTAButton 
        text="Book Consultation" 
        variant={accent} 
        className="w-full"
      />
    </div>
  );
}
