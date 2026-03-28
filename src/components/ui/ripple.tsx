"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RippleProps = React.HTMLAttributes<HTMLDivElement> & {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
};

export function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,black_26%,transparent_78%)]",
        className
      )}
      {...props}
    >
      {Array.from({ length: numCircles }).map((_, index) => {
        const size = mainCircleSize + index * 70;
        const style = {
          width: `${size}px`,
          height: `${size}px`,
          opacity: Math.max(mainCircleOpacity - index * 0.03, 0.04),
          "--i": index,
          "--duration": "7.5s",
        } as React.CSSProperties;

        return (
          <div
            key={index}
            style={style}
            className="animate-ripple absolute top-1/2 left-1/2 rounded-full border border-cyan-500/30 bg-transparent shadow-[0_0_0_1px_rgba(34,211,238,0.05)_inset] [animation-delay:calc(var(--i)*0.14s)] [animation-duration:var(--duration)] dark:border-cyan-300/35"
          />
        );
      })}
    </div>
  );
}
