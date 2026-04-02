"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-0 flex min-h-screen flex-col overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 flex items-start justify-center z-[-2]">
        <div className="h-[40rem] w-[40rem] mt-[-10rem] bg-rose-500/[0.04] dark:bg-blue-500/[0.06] rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      </div>

      {/* Dot grid */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "fixed inset-0 z-[-1] opacity-60 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen pointer-events-none",
          "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]"
        )}
      />

      <Header />

      <main className="box-border min-w-0 flex-1 overflow-x-hidden pt-14">
        {children}
      </main>
    </div>
  );
}
