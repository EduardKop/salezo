"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimatedBeamProps = {
  className?: string;
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  straight?: boolean;
  fromAnchor?: "center" | "top" | "right" | "bottom" | "left";
  toAnchor?: "center" | "top" | "right" | "bottom" | "left";
  fromInset?: number;
  toInset?: number;
  curvature?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
  movingDasharray?: string;
  movingPathWidth?: number;
};

type BeamGeometry = {
  width: number;
  height: number;
  path: string;
};

function getElementCenter(
  element: HTMLElement,
  containerRect: DOMRect,
  anchor: "center" | "top" | "right" | "bottom" | "left",
  inset = 0,
  xOffset = 0,
  yOffset = 0
) {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left - containerRect.left + rect.width / 2;
  const centerY = rect.top - containerRect.top + rect.height / 2;
  let x = centerX;
  let y = centerY;

  if (anchor === "top") {
    y = rect.top - containerRect.top + inset;
  } else if (anchor === "bottom") {
    y = rect.bottom - containerRect.top - inset;
  } else if (anchor === "left") {
    x = rect.left - containerRect.left + inset;
  } else if (anchor === "right") {
    x = rect.right - containerRect.left - inset;
  }

  return {
    x: x + xOffset,
    y: y + yOffset,
  };
}

function buildPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  curvature: number,
  straight: boolean
) {
  if (straight) {
    return `M ${start.x},${start.y} L ${end.x},${end.y}`;
  }

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);

  if (horizontal) {
    const controlX1 = start.x + deltaX * 0.45;
    const controlX2 = start.x + deltaX * 0.55;

    return `M ${start.x},${start.y} C ${controlX1},${start.y + curvature} ${controlX2},${end.y - curvature} ${end.x},${end.y}`;
  }

  const controlY1 = start.y + deltaY * 0.45;
  const controlY2 = start.y + deltaY * 0.55;

  return `M ${start.x},${start.y} C ${start.x + curvature},${controlY1} ${end.x - curvature},${controlY2} ${end.x},${end.y}`;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  straight = false,
  fromAnchor = "center",
  toAnchor = "center",
  fromInset = 0,
  toInset = 0,
  curvature = 0,
  pathColor = "currentColor",
  pathWidth = 2,
  pathOpacity = 0.16,
  gradientStartColor = "#60a5fa",
  gradientStopColor = "#7c3aed",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  duration = 4,
  delay = 0,
  reverse = false,
  movingDasharray = "18 82",
  movingPathWidth,
}: AnimatedBeamProps) {
  const gradientId = React.useId();
  const [geometry, setGeometry] = React.useState<BeamGeometry | null>(null);

  React.useEffect(() => {
    const updateGeometry = () => {
      const container = containerRef.current;
      const fromElement = fromRef.current;
      const toElement = toRef.current;

      if (!container || !fromElement || !toElement) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const start = getElementCenter(
        fromElement,
        containerRect,
        fromAnchor,
        fromInset,
        startXOffset,
        startYOffset
      );
      const end = getElementCenter(
        toElement,
        containerRect,
        toAnchor,
        toInset,
        endXOffset,
        endYOffset
      );

      setGeometry({
        width: containerRect.width,
        height: containerRect.height,
        path: buildPath(start, end, curvature, straight),
      });
    };

    updateGeometry();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => updateGeometry())
        : null;

    if (resizeObserver) {
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      if (fromRef.current) resizeObserver.observe(fromRef.current);
      if (toRef.current) resizeObserver.observe(toRef.current);
    }

    window.addEventListener("resize", updateGeometry);
    window.addEventListener("scroll", updateGeometry, true);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateGeometry);
      window.removeEventListener("scroll", updateGeometry, true);
    };
  }, [
    containerRef,
    curvature,
    endXOffset,
    endYOffset,
    fromAnchor,
    fromInset,
    fromRef,
    startXOffset,
    startYOffset,
    straight,
    toAnchor,
    toInset,
    toRef,
  ]);

  if (!geometry) {
    return null;
  }

  return (
    <svg
      width={geometry.width}
      height={geometry.height}
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className={cn("pointer-events-none absolute inset-0 overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={geometry.width} y2={geometry.height}>
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="35%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="65%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={geometry.path}
        fill="none"
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />

      <motion.path
        d={geometry.path}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={movingPathWidth ?? pathWidth + 0.5}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={movingDasharray}
        initial={{ strokeDashoffset: reverse ? -100 : 0 }}
        animate={{ strokeDashoffset: reverse ? 0 : -100 }}
        transition={{
          duration,
          delay,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
        }}
      />
    </svg>
  );
}
