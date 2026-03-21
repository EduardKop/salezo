"use client";

import { ArrowRight, CheckCircle2, FolderKanban, ShieldCheck } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useTheme } from "next-themes";
import { AuthForm } from "@/components/auth/AuthForm";
import { Meteors } from "@/components/ui/meteors";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { AuroraText } from "@/components/ui/aurora-text";
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { login as translations, t as getT } from "@/lib/i18n/translations";

const featureIcons = [FolderKanban, ShieldCheck, CheckCircle2] as const;

export default function LoginPage() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const activeLanguage = language as Language;
  const t = getT(translations, activeLanguage);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.35 } },
  };

  const panelPoints = [t.panelPointOne, t.panelPointTwo, t.panelPointThree];

  return (
    <div className="relative z-0 flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 z-[-1] flex items-center justify-center overflow-hidden">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "opacity-50 dark:opacity-40"
          )}
        />
        <Meteors number={20} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 3 }}
          className="absolute left-1/2 top-1/2 hidden h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 blur-[120px] dark:block"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 3 }}
          className="absolute left-1/2 top-1/2 block h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500 blur-[120px] dark:hidden"
        />
      </div>

      <main className="container mx-auto flex flex-1 flex-col items-center justify-center gap-16 px-4 pb-20 pt-32 lg:flex-row lg:justify-between lg:px-8 lg:pb-20 lg:pt-32">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex w-full flex-col items-center text-center lg:w-[44%] lg:items-start lg:text-left"
        >
          <motion.div variants={item} className="mb-6 flex w-full justify-center lg:justify-start">
            <AnimatedGradientText className="flex items-center">
              <span className="relative mr-2 flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span
                className={cn(
                  "inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
                  "whitespace-nowrap text-xs font-semibold uppercase tracking-wider"
                )}
              >
                {t.badge}
              </span>
              <ArrowRight className="ml-1 h-3 w-3 shrink-0 text-neutral-500" />
            </AnimatedGradientText>
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-4 text-4xl font-bold tracking-tighter md:text-5xl lg:text-[3.35rem] lg:leading-[1.06]"
          >
            <span className="bg-gradient-to-b from-black to-black/60 bg-clip-text text-transparent dark:from-white dark:to-white/60">
              {t.titleTop} <br />
            </span>
            <AuroraText>{t.titleBottom}</AuroraText>
          </motion.h1>

          <motion.p
            variants={item}
            className="mb-8 max-w-md text-base text-neutral-600 dark:text-neutral-400 lg:mx-0"
          >
            {t.description}
          </motion.p>

          <motion.div
            variants={item}
            className="w-full max-w-xl rounded-[2rem] border border-neutral-200/60 bg-white/55 p-3 shadow-2xl backdrop-blur-xl dark:border-neutral-800/70 dark:bg-black/45"
          >
            <div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-100/85 p-6 dark:border-neutral-800 dark:bg-neutral-900/85">
              <div className="mb-5 inline-flex items-center rounded-full border border-black/8 bg-black/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-neutral-400">
                {t.panelLabel}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white">
                {t.panelTitle}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                {t.panelDescription}
              </p>
              <div className="mt-6 space-y-3">
                {panelPoints.map((point, index) => {
                  const Icon = featureIcons[index] ?? CheckCircle2;
                  return (
                    <div
                      key={point}
                      className="flex items-center gap-3 rounded-2xl border border-black/6 bg-white/70 px-4 py-3 dark:border-white/8 dark:bg-white/[0.03]"
                    >
                      <div className="rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
                        <Icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-black dark:text-white">{point}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex w-full items-center justify-center lg:w-[46%]"
        >
          <MagicCard
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-neutral-200/60 bg-white/70 p-1 shadow-[0_32px_120px_-48px_rgba(0,0,0,0.4)] backdrop-blur-2xl dark:border-neutral-800/70 dark:bg-black/55"
            gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative rounded-[1.6rem] border border-neutral-200 bg-white/92 p-8 dark:border-neutral-800 dark:bg-[#090909]/92 sm:p-10">
              <AuthForm />
            </div>
          </MagicCard>
        </motion.div>
      </main>
    </div>
  );
}
