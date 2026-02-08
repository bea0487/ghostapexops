import React from 'react'

export default function Shell({ title, subtitle, children, right }) {
  return (
    <div className="min-h-screen bg-[#05060a]">
      <div className="relative">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/images/sunset-road.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05060a]/80 via-[#05060a]/90 to-[#05060a]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-orbitron text-2xl tracking-wide text-white">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 font-rajdhani text-white/70">
                  {subtitle}
                </div>
              ) : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
