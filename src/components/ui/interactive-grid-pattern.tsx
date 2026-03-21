"use client"

import React, { useState, useRef, useEffect } from "react"

import { cn } from "@/lib/utils"

/**
 * InteractiveGridPattern is a component that renders a grid pattern with interactive squares.
 */
interface InteractiveGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  squares?: [number, number] // [horizontal, vertical] (fallback)
  className?: string
  squaresClassName?: string
}

export function InteractiveGridPattern({
  width = 40,
  height = 40,
  squares = [24, 24],
  className,
  squaresClassName,
  ...props
}: InteractiveGridPatternProps) {
  const [hoveredSquare, setHoveredSquare] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        setDimensions({
          width: svgRef.current.clientWidth,
          height: svgRef.current.clientHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const horizontal = dimensions.width > 0 ? Math.ceil(dimensions.width / width) : squares[0]
  const vertical = dimensions.height > 0 ? Math.ceil(dimensions.height / height) : squares[1]

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return
      
      const rect = svgRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setHoveredSquare(null)
        return
      }

      const col = Math.floor(x / width)
      const row = Math.floor(y / height)
      
      if (col >= 0 && col < horizontal && row >= 0 && row < vertical) {
        setHoveredSquare(row * horizontal + col)
      } else {
        setHoveredSquare(null)
      }
    }
    
    const handleMouseLeave = () => setHoveredSquare(null)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [width, height, horizontal, vertical])

  return (
    <svg
      ref={svgRef}
      width={width * horizontal}
      height={height * vertical}
      className={cn(
        "absolute inset-0 h-full w-full border border-neutral-200/50 dark:border-neutral-800/50",
        className
      )}
      {...props}
    >
      {Array.from({ length: horizontal * vertical }).map((_, index) => {
        const x = (index % horizontal) * width
        const y = Math.floor(index / horizontal) * height
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            className={cn(
              "stroke-neutral-200/50 dark:stroke-neutral-800/50 transition-all duration-100 ease-in-out not-[&:hover]:duration-1000",
              hoveredSquare === index ? "fill-neutral-300 dark:fill-neutral-700 opacity-50" : "fill-transparent",
              squaresClassName
            )}
          />
        )
      })}
    </svg>
  )
}
