import React from 'react'

export default function CTAButton({
  text = 'Book FREE Consultation',
  href = 'https://zbooking.us/xmUt9',
  variant = 'cyan',
  size = 'default',
  className = '',
}) {
  const sizeClasses = {
    default: 'px-8 py-3 text-sm',
    large: 'px-10 py-4 text-base',
  }

  const variantClasses = {
    cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:-translate-y-1',
    magenta: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] hover:-translate-y-1',
    gradient: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-pink-500 text-white hover:shadow-[0_0_30px_rgba(255,0,255,0.4)] hover:-translate-y-1',
    outline: 'border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]',
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        `inline-block font-orbitron font-semibold tracking-wide rounded-lg transition-all duration-300 text-center ${
          sizeClasses[size]
        } ${variantClasses[variant]} ${className}`
      }
    >
      {text}
    </a>
  )
}
