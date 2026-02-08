import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, widthClass = 'max-w-lg' }) {
  React.useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${widthClass} rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl`}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="font-orbitron text-sm text-white">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
