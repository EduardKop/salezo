"use client";

import * as React from "react";
import {
  Robot as Bot,
  Database,
  ChatTeardropText as MessagesSquare,
  Scroll as ScrollText,
  Sparkle as Sparkles,
  User as UserRound,
  Wrench,
  ChartBar as ChartColumnIncreasing,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

type SalesFlowLabels = {
  flowUser: string;
  flowDialogs: string;
  flowAi: string;
  flowVectorDb: string;
  flowVectorDbDesc: string;
  flowScriptAssistant: string;
  flowScriptAssistantDesc: string;
  flowAgents: string;
  flowAgentsDesc: string;
  flowImprovedScripts: string;
  flowImprovedScriptsDesc: string;
  flowAnalysis: string;
  flowAnalysisDesc: string;
};

type SalesFlowShowcaseProps = {
  labels: SalesFlowLabels;
};

const outputIconClassNames = [
  "text-cyan-500",
  "text-emerald-500",
  "text-violet-500",
  "text-amber-500",
  "text-pink-500",
] as const;

const outputAccentClassNames = [
  "from-cyan-400/95 to-sky-500/60",
  "from-emerald-400/95 to-lime-400/60",
  "from-violet-400/95 to-indigo-500/60",
  "from-amber-400/95 to-orange-500/60",
  "from-pink-400/95 to-fuchsia-500/60",
] as const;

const outputIcons = [
  Database,
  ScrollText,
  Bot,
  Wrench,
  ChartColumnIncreasing,
] as const;

type FlowNodeProps = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  iconClassName?: string;
};

type OutputFlowNodeProps = FlowNodeProps & {
  description: string;
  accentClassName: string;
};

const FlowNode = React.forwardRef<HTMLDivElement, FlowNodeProps>(
  ({ title, icon: Icon, className, iconClassName }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 flex min-h-14 items-center gap-3 rounded-2xl border border-black/8 bg-white/92 px-3 py-3 shadow-[0_10px_40px_-28px_rgba(0,0,0,0.7)] dark:border-white/10 dark:bg-black/80",
          className
        )}
      >
        <div className="rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
          <Icon className={cn("h-4 w-4 text-blue-500", iconClassName)} />
        </div>
        <span className="whitespace-nowrap text-left font-mono text-[12px] font-medium leading-5 tracking-[-0.01em] text-black dark:text-white md:text-[13px]">
          {title}
        </span>
      </div>
    );
  }
);

FlowNode.displayName = "FlowNode";

const OutputFlowNode = React.forwardRef<HTMLDivElement, OutputFlowNodeProps>(
  (
    { title, description, icon: Icon, className, iconClassName, accentClassName },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative z-10 min-h-[94px] overflow-hidden rounded-[28px] border border-black/8 bg-white/92 px-4 py-4 shadow-[0_18px_44px_-32px_rgba(0,0,0,0.45)] backdrop-blur-sm dark:border-white/10 dark:bg-black/78 dark:shadow-[0_22px_56px_-36px_rgba(0,0,0,0.9)]",
          className
        )}
      >
        <div
          className={cn(
            "absolute bottom-4 left-0 top-4 w-[3px] rounded-r-full bg-gradient-to-b opacity-90",
            accentClassName
          )}
        />
        <div className="relative flex h-full flex-col justify-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black/[0.04] p-2 dark:bg-white/[0.06]">
              <Icon className={cn("h-4 w-4 text-blue-500", iconClassName)} />
            </div>
            <div className="min-w-0">
              <div className="whitespace-nowrap font-mono text-[12px] font-medium leading-5 tracking-[-0.02em] text-black dark:text-white md:text-[13px]">
                {title}
              </div>
              <p className="mt-0.5 text-[10px] leading-[1.35] text-black/56 dark:text-white/46 md:text-[10.5px]">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OutputFlowNode.displayName = "OutputFlowNode";

export function SalesFlowShowcase({ labels }: SalesFlowShowcaseProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const userRef = React.useRef<HTMLDivElement>(null);
  const dialogsRef = React.useRef<HTMLDivElement>(null);
  const aiRef = React.useRef<HTMLDivElement>(null);
  const vectorDbRef = React.useRef<HTMLDivElement>(null);
  const assistantRef = React.useRef<HTMLDivElement>(null);
  const agentsRef = React.useRef<HTMLDivElement>(null);
  const scriptsRef = React.useRef<HTMLDivElement>(null);
  const analysisRef = React.useRef<HTMLDivElement>(null);

  const outputs = [
    {
      ref: vectorDbRef,
      title: labels.flowVectorDb,
      description: labels.flowVectorDbDesc,
    },
    {
      ref: assistantRef,
      title: labels.flowScriptAssistant,
      description: labels.flowScriptAssistantDesc,
    },
    {
      ref: agentsRef,
      title: labels.flowAgents,
      description: labels.flowAgentsDesc,
    },
    {
      ref: scriptsRef,
      title: labels.flowImprovedScripts,
      description: labels.flowImprovedScriptsDesc,
    },
    {
      ref: analysisRef,
      title: labels.flowAnalysis,
      description: labels.flowAnalysisDesc,
    },
  ] as const;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto h-[1120px] w-full max-w-[760px] overflow-visible px-2 py-3 md:h-[1160px] lg:h-[760px]"
    >
      <div className="relative z-10 grid h-full grid-cols-1 justify-items-center gap-6 lg:grid-cols-[320px_320px] lg:justify-center lg:gap-12">
        <div className="flex flex-col items-center gap-4 md:gap-5 lg:justify-center">
          <FlowNode
            ref={userRef}
            title={labels.flowUser}
            icon={UserRound}
            iconClassName="text-sky-500"
            className="min-h-[92px] w-[320px] max-w-full justify-start px-6"
          />
          <FlowNode
            ref={dialogsRef}
            title={labels.flowDialogs}
            icon={MessagesSquare}
            iconClassName="text-blue-500"
            className="min-h-[92px] w-[320px] max-w-full justify-start px-6"
          />
          <FlowNode
            ref={aiRef}
            title={labels.flowAi}
            icon={Sparkles}
            iconClassName="text-violet-500"
            className="min-h-[92px] w-[320px] max-w-full justify-start bg-white px-6 dark:bg-black"
          />
        </div>

        <div className="flex flex-col items-center gap-4 md:gap-5 lg:justify-center">
          {outputs.map((output, index) => {
            const Icon = outputIcons[index];

            return (
              <OutputFlowNode
                key={output.title}
                ref={output.ref}
                title={output.title}
                description={output.description}
                icon={Icon}
                iconClassName={outputIconClassNames[index]}
                accentClassName={outputAccentClassNames[index]}
                className="min-h-[88px] w-[280px] max-w-full px-4 py-3"
              />
            );
          })}
        </div>
      </div>

      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={userRef}
        toRef={dialogsRef}
        curvature={0}
        duration={4.6}
        gradientStartColor="#38bdf8"
        gradientStopColor="#2563eb"
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={dialogsRef}
        toRef={aiRef}
        curvature={0}
        duration={4.2}
        gradientStartColor="#60a5fa"
        gradientStopColor="#8b5cf6"
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={vectorDbRef}
        curvature={-64}
        duration={4.8}
        gradientStartColor="#06b6d4"
        gradientStopColor="#38bdf8"
        startXOffset={126}
        endXOffset={-126}
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={assistantRef}
        curvature={-28}
        duration={4.1}
        delay={0.15}
        gradientStartColor="#14b8a6"
        gradientStopColor="#22c55e"
        startXOffset={126}
        endXOffset={-126}
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={agentsRef}
        curvature={0}
        duration={4.4}
        delay={0.3}
        gradientStartColor="#8b5cf6"
        gradientStopColor="#6366f1"
        startXOffset={126}
        endXOffset={-126}
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={scriptsRef}
        curvature={28}
        duration={4.2}
        delay={0.45}
        gradientStartColor="#f59e0b"
        gradientStopColor="#f97316"
        startXOffset={126}
        endXOffset={-126}
      />
      <AnimatedBeam
        className="hidden lg:block"
        containerRef={containerRef}
        fromRef={aiRef}
        toRef={analysisRef}
        curvature={64}
        duration={4.9}
        delay={0.6}
        gradientStartColor="#ec4899"
        gradientStopColor="#a855f7"
        startXOffset={126}
        endXOffset={-126}
      />
    </div>
  );
}
