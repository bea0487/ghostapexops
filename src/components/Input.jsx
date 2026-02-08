import React from 'react'

export default function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed " +
        (props.className || '')
      }
    />
  )
}