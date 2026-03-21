"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
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
import { SalesFlowShowcase } from "@/components/home/SalesFlowShowcase";
import { FeatureParallaxSection } from "@/components/home/FeatureParallaxSection";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useLanguage, type Language } from "@/hooks/useLanguage";
import { landing as translations, t as getT } from "@/lib/i18n/translations";

export default function Home() {
  const { theme } = useTheme();
  const { language, mounted } = useLanguage();
  const activeLanguage = (mounted ? language : "ru") as Language;
  const t = getT(translations, activeLanguage);
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
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "opacity-50 dark:opacity-40"
          )}
        />
        <Meteors number={20} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.8 }}
          className="absolute right-[-4%] top-[54%] h-[920px] w-[920px] -translate-y-1/2 rounded-full opacity-58 blur-[8px] dark:hidden"
          style={{
            background:
              "radial-gradient(circle at 74% 24%, rgba(96, 165, 250, 0.1), transparent 0 22%), radial-gradient(circle at 30% 68%, rgba(129, 140, 248, 0.08), transparent 0 30%), radial-gradient(circle at 58% 78%, rgba(56, 189, 248, 0.08), transparent 0 34%), radial-gradient(circle at 50% 50%, rgba(241, 246, 255, 0.52), rgba(225, 235, 255, 0.34) 56%, rgba(255, 255, 255, 0.1) 74%, rgba(255, 255, 255, 0) 84%)",
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.8 }}
          className="absolute right-[-4%] top-[54%] hidden h-[920px] w-[920px] -translate-y-1/2 rounded-full opacity-100 blur-[10px] dark:block"
          style={{
            background:
              "radial-gradient(circle at 72% 24%, rgba(31, 212, 255, 0.22), transparent 0 24%), radial-gradient(circle at 28% 64%, rgba(255, 0, 153, 0.18), transparent 0 30%), radial-gradient(circle at 56% 76%, rgba(81, 36, 255, 0.24), transparent 0 34%), radial-gradient(circle at 50% 50%, rgba(7, 21, 56, 0.78), rgba(3, 8, 22, 0.55) 62%, rgba(0, 0, 0, 0) 78%)",
          }}
        />
        <div className="absolute right-[-4%] top-[54%] h-[920px] w-[920px] -translate-y-1/2 rounded-full border border-black/[0.04] opacity-45 dark:border-white/8 dark:opacity-60" />
        <div className="absolute right-[16%] top-[18%] h-[280px] w-[280px] rounded-full bg-sky-300/4 blur-[90px] dark:bg-cyan-400/10" />
        <div className="absolute right-[30%] top-[62%] h-[260px] w-[260px] rounded-full bg-indigo-300/4 blur-[100px] dark:bg-fuchsia-500/10" />
        <div className="absolute right-[8%] top-[34%] h-[220px] w-[220px] rounded-full bg-blue-300/4 blur-[110px] dark:hidden" />
      </div>

      {/* Main Content: Left Side Text, Right Side Mockup */}
      <main className="z-10 w-full flex-1 flex flex-col items-center justify-center container mx-auto px-4 lg:px-8 pt-32 pb-20 lg:flex-row lg:items-start lg:justify-between lg:pb-24 gap-16 lg:gap-10">

        {/* Left Side: Typography & CTA */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center lg:items-start text-center lg:text-left w-full lg:w-[42%]"
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
                {t.badge}
              </span>
              <ChevronRight className="ml-1 w-3 h-3 text-neutral-500 shrink-0" />
            </AnimatedGradientText>
          </motion.div>

          <motion.h1 variants={item} className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tighter mb-4 leading-[1.05]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-black to-black/60 dark:from-white dark:to-white/60">
              {t.titleTop} <br />
            </span>
            <AuroraText>
              {t.titleBottom}
            </AuroraText>
          </motion.h1>

          <motion.p variants={item} className="text-base text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto lg:mx-0">
            {t.description}
          </motion.p>

          <motion.div variants={item} className="flex items-center justify-center lg:justify-start gap-4 w-full">
            <Dialog>
              <DialogTrigger
                render={
                  <RainbowButton className="px-6 py-3.5 text-sm h-auto flex items-center justify-center gap-2 group">
                    {t.cta} 🚀
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </RainbowButton>
                }
              />
              <DialogContent className="sm:max-w-md !bg-transparent !backdrop-blur-none border-none shadow-none p-0 overflow-visible">
                <DialogTitle className="sr-only">{t.dialogTitle}</DialogTitle>
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
          className="relative mx-auto mb-12 flex w-full max-w-md items-center justify-center lg:-translate-y-32 lg:mb-0 lg:w-[58%] lg:max-w-none"
        >
          <div className="w-full max-w-[780px]">
            <SalesFlowShowcase labels={t} />
          </div>
        </motion.div>
      </main>

      <FeatureParallaxSection labels={t} />
    </div>
  );
}
