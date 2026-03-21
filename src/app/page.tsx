"use client";

import { ArrowRight, BarChart3, ChevronRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { AuthForm } from "@/components/auth/AuthForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Meteors } from "@/components/ui/meteors";
import { AuroraText } from "@/components/ui/aurora-text";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function Home() {
  const { theme } = useTheme();
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.4 } },
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] overflow-x-hidden bg-background relative z-0">
      {/* Background Effects */}
      <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none flex items-center justify-center">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "opacity-50 dark:opacity-40"
          )}
        />
        <Meteors number={20} />

        {/* Dark Theme Glow (Blue) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-blue-500 blur-[120px] hidden dark:block"
        />

        {/* Light Theme Glow (Pink) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 3 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-pink-500 blur-[120px] block dark:hidden"
        />
      </div>

      {/* Main Content: Left Side Text, Right Side Mockup */}
      <main className="z-10 w-full flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between container mx-auto px-4 lg:px-8 pt-32 pb-20 lg:py-0 gap-16 lg:gap-0">

        {/* Left Side: Typography & CTA */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[45%]"
        >
          <motion.div variants={item} className="mb-6 flex justify-center lg:justify-start w-full">
            <AnimatedGradientText className="flex items-center">
              <span className="relative flex h-2 w-2 mr-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span
                className={cn(
                  "inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
                  "text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                )}
              >
                Salezo OS is live
              </span>
              <ChevronRight className="ml-1 w-3 h-3 text-neutral-500 shrink-0" />
            </AnimatedGradientText>
          </motion.div>

          <motion.h1 variants={item} className="text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tighter mb-4 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60">
              The Workspace for <br />
            </span>
            <AuroraText>
              Top-tier Sales AI.
            </AuroraText>
          </motion.h1>

          <motion.p variants={item} className="text-base text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto lg:mx-0">
            High-performance utility dashboard designed specifically for sales reps,
            team leads, and owners. Maximum information density, zero visual noise.
          </motion.p>

          <motion.div variants={item} className="flex items-center justify-center lg:justify-start gap-4 w-full">
            <Dialog>
              <DialogTrigger
                render={
                  <RainbowButton className="px-6 py-3.5 text-sm h-auto flex items-center justify-center gap-2 group">
                    Increase sales 🚀
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </RainbowButton>
                }
              />
              <DialogContent className="sm:max-w-md !bg-transparent !backdrop-blur-none border-none shadow-none p-0 overflow-visible">
                <DialogTitle className="sr-only">Login Modal</DialogTitle>
                <MagicCard
                  className="w-full rounded-2xl shadow-2xl relative overflow-hidden"
                  gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none z-30" />
                  <div className="p-8 relative z-40 w-full flex items-center justify-center">
                    <AuthForm />
                  </div>
                </MagicCard>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>

        {/* Right Side: Floating Mockup Graphic */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex w-full lg:w-[55%] relative h-[350px] md:h-[450px] lg:h-[80%] max-w-md lg:max-w-none mx-auto items-center justify-center perspective-[2000px] mb-12 lg:mb-0"
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl overflow-hidden p-2 transform rotate-y-[-10deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 cursor-default group">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 aspect-[4/3] relative flex items-center justify-center">
              {/* Dashboard abstraction graphic */}
              <div className="absolute inset-0 p-8 grid grid-cols-3 gap-4 opacity-50">
                {/* Sidebar */}
                <div className="col-span-1 row-span-4 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800" />
                {/* Header */}
                <div className="col-span-2 row-span-1 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800" />
                {/* Bento Grid */}
                <div className="col-span-1 row-span-1 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800" />
                <div className="col-span-1 row-span-1 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800" />
                <div className="col-span-2 row-span-2 bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800" />
              </div>
              <div className="z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center gap-2 shadow-xl">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-sm tracking-tight text-black dark:text-white">Salezo Dashboard</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
