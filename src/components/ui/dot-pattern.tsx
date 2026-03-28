"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
  patternId?: string
  [key: string]: unknown
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  patternId = "dot-pattern",
  ...props
}: DotPatternProps) {
  const id = patternId

  // Static (no glow): use an SVG <pattern> — renders instantly, no JS measurement needed
  if (!glow) {
    return (
      <svg
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
          className
        )}
        {...props}
      >
        <defs>
          <pattern
            id={`${id}-pattern`}
            x={x}
            y={y}
            width={width}
            height={height}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}-pattern)`} />
      </svg>
    )
  }

  // Glow mode: needs JS measurement for individual animated dots
  return <DotPatternGlow
    id={id}
    width={width}
    height={height}
    x={x}
    y={y}
    cx={cx}
    cy={cy}
    cr={cr}
    className={className}
    {...props}
  />
}

function DotPatternGlow({
  id,
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps & { id: string }) {
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const dots = Array.from(
    {
      length:
        Math.ceil(dimensions.width / width) *
        Math.ceil(dimensions.height / height),
    },
    (_, i) => {
      const col = i % Math.ceil(dimensions.width / width)
      const row = Math.floor(i / Math.ceil(dimensions.width / width))
      const delaySeed = pseudoRandom(i * 13 + width + height)
      const durationSeed = pseudoRandom(i * 29 + cx + cy)
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        delay: delaySeed * 5,
        duration: durationSeed * 3 + 2,
      }
    }
  )

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <motion.circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={`url(#${id}-gradient)`}
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            repeatType: "reverse",
            delay: dot.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  )
}
