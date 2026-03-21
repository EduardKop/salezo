"use client"

import React from "react"

import { cn } from "@/lib/utils"

interface MeteorsProps {
  number?: number
  minDelay?: number
  maxDelay?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

function formatCssValue(value: number, unit: string, decimals = 4) {
  return `${value.toFixed(decimals)}${unit}`
}

export const Meteors = ({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) => {
  const meteorStyles = Array.from({ length: number }, (_, idx) => {
    const positionSeed = pseudoRandom(idx * 17 + angle)
    const delaySeed = pseudoRandom(idx * 29 + number)
    const durationSeed = pseudoRandom(idx * 43 + angle + number)

    return {
      "--angle": `${-angle}deg`,
      top: "-5%",
      left: formatCssValue(positionSeed * 100, "%"),
      animationDelay: formatCssValue(delaySeed * (maxDelay - minDelay) + minDelay, "s", 5),
      animationDuration: formatCssValue(durationSeed * (maxDuration - minDuration) + minDuration, "s", 5),
    } as React.CSSProperties
  })

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-500 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-12.5 -translate-y-1/2 bg-linear-to-r from-zinc-500 to-transparent" />
        </span>
      ))}
    </>
  )
}
