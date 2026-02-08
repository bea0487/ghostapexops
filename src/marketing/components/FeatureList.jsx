import React from 'react'
import { Check, X } from 'lucide-react'

export default function FeatureList({ items, included }) {
  return (
    <ul className="space-y-3">
      {items.map((text, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <div
            className={
              `mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border ${
                included
                  ? 'border-cyan-500/30 bg-cyan-500/10'
                  : 'border-white/10 bg-black/20'
              }`
            }
          >
            {included ? (
              <Check className="h-4 w-4 text-cyan-400" />
            ) : (
              <X className="h-4 w-4 text-gray-500" />
            )}
          </div>
          <span className="text-gray-300 text-sm leading-relaxed">{text}</span>
        </li>
      ))}
    </ul>
  )
}
