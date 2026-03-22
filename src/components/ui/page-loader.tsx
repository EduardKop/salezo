"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
  spinnerClassName?: string;
  label?: string;
};

export function PageLoader({ className, spinnerClassName, label }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex w-full min-h-[60vh] items-center justify-center",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? "Loading content"}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-black/10 dark:border-white/12"
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 rounded-full opacity-70 blur-[2px] motion-reduce:animate-none animate-spin [animation-duration:0.9s] [animation-timing-function:linear]",
              spinnerClassName
            )}
            style={{
              background:
                "conic-gradient(from 18deg, rgba(34,211,238,0) 0deg, rgba(34,211,238,0) 220deg, #22d3ee 262deg, #3b82f6 300deg, #8b5cf6 332deg, #ec4899 352deg, rgba(34,211,238,0) 360deg)",
            }}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-[1px] rounded-full motion-reduce:animate-none animate-spin [animation-duration:0.9s] [animation-timing-function:linear]",
              spinnerClassName
            )}
            style={{
              background:
                "conic-gradient(from 28deg, rgba(56,189,248,0) 0deg, rgba(56,189,248,0) 214deg, #67e8f9 252deg, #60a5fa 288deg, #a78bfa 320deg, #f472b6 346deg, rgba(56,189,248,0) 360deg)",
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-[5px] rounded-full border border-black/10 bg-white/90 dark:border-white/10 dark:bg-black/85"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 motion-reduce:animate-none animate-spin [animation-duration:0.9s] [animation-timing-function:linear]"
          >
            <span className="absolute left-1/2 top-[1px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.9)] dark:bg-cyan-200" />
          </span>
        </div>
        {label ? (
          <span className="text-[12px] text-black/55 dark:text-white/55">{label}</span>
        ) : null}
      </div>
    </div>
  );
}
