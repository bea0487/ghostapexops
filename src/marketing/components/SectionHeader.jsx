import React from 'react'

export default function SectionHeader({ title, subtitle, align = 'center' }) {
  const alignClasses = {
    center: 'text-center',
    left: 'text-left',
    right: 'text-right',
  }

  return (
    <div className={`mb-8 ${alignClasses[align]}`}>
      <h2 className="font-orbitron text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-4">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
      ) : null}
    </div>
  )
}
