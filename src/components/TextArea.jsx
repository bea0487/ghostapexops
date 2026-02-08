import React from 'react'

export default function TextArea(props) {
  return (
    <textarea
      {...props}
      className={
        "min-h-[110px] w-full resize-y rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-rajdhani text-white placeholder:text-white/30 outline-none ring-0 focus:border-cyan-400/40 focus:shadow-[0_0_0_1px_rgba(34,211,238,0.25)] " +
        (props.className || '')
      }
    />
  )
}
