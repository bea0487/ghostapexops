import React from 'react'

export default function Field({ label, hint, error, children, htmlFor, required }) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label 
          htmlFor={htmlFor} 
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>
        {hint ? (
          <div id={hintId} className="text-xs text-gray-500">
            {hint}
          </div>
        ) : null}
      </div>
      <div className="mt-1">
        {React.cloneElement(children, {
          'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : 'false',
          'aria-required': required ? 'true' : undefined,
        })}
      </div>
      {error ? (
        <div id={errorId} role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </div>
      ) : null}
    </div>
  )
}