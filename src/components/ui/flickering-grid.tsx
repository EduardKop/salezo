"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FlickeringGridProps = React.HTMLAttributes<HTMLDivElement> & {
  squareSize?: number;
  gridGap?: number;
  color?: string;
  maxOpacity?: number;
  flickerChance?: number;
};

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 8,
  color = "rgb(56, 189, 248)",
  maxOpacity = 0.22,
  flickerChance = 0.06,
  className,
  ...props
}: FlickeringGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const frameRef = React.useRef<number | null>(null);
  const colsRef = React.useRef(0);
  const rowsRef = React.useRef(0);
  const opacitiesRef = React.useRef<number[][]>([]);
  const sizeRef = React.useRef({ width: 0, height: 0 });

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cell = squareSize + gridGap;

    const rebuildGrid = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      sizeRef.current = { width, height };

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      colsRef.current = cols;
      rowsRef.current = rows;
      opacitiesRef.current = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random() * maxOpacity * 0.55)
      );
    };

    const draw = () => {
      const { width, height } = sizeRef.current;
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const opacities = opacitiesRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const shouldFlicker = Math.random() < flickerChance;

          if (shouldFlicker) {
            opacities[row][col] = Math.random() * maxOpacity;
          } else {
            opacities[row][col] = Math.max(0, opacities[row][col] - 0.008);
          }

          ctx.globalAlpha = opacities[row][col];
          ctx.fillRect(col * cell, row * cell, squareSize, squareSize);
        }
      }

      ctx.globalAlpha = 1;
      frameRef.current = window.requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(() => {
      rebuildGrid();
    });
    resizeObserver.observe(container);

    rebuildGrid();
    draw();

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [color, flickerChance, gridGap, maxOpacity, squareSize]);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 h-full w-full", className)}
      {...props}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

