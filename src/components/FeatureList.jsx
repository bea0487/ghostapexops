import React from "react";
import { Check, X } from "lucide-react";

export default function FeatureList({ items = [], included = true }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          {included ? (
            <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          ) : (
            <X className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
          )}
          <span className={included ? "text-gray-300 leading-relaxed" : "text-gray-500 leading-relaxed"}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
