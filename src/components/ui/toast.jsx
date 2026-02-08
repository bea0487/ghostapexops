import React from 'react'
import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-300",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }