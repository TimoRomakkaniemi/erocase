'use client'

import type { CSSProperties } from 'react'

interface Props {
  size?: number
  className?: string
  style?: CSSProperties
}

export default function SolviaLogo({ size = 28, className = '', style }: Props) {
  return (
    <img
      src="/solvia-logo.png"
      alt="Solvia"
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
      style={{ minWidth: size, minHeight: size, ...style }}
    />
  )
}
